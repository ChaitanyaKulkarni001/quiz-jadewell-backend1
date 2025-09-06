const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./tcm.db');
const tcmDb = new sqlite3.Database('./tcm_quiz.db');

app.use(cors());
app.use(bodyParser.json());

// 1. Get 10 random questions
app.get('/api/quiz', (req, res) => {
  db.all("SELECT * FROM questions ORDER BY RANDOM() LIMIT 10", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Submit answers and calculate result
app.post('/api/quiz/submit', (req, res) => {
  const answers = req.body.answers; // [{id, answer:true/false}, ...]

  // Tally scores
  let scores = { yin: 0, yang: 0, qi: 0, blood: 0 };

  answers.forEach(ans => {
    if (ans.answer) { // only count "Yes"
      db.get("SELECT type FROM questions WHERE id = ?", [ans.id], (err, row) => {
        if (row) {
          scores[row.type]++;
        }
      });
    }
  });

  // wait 500ms for async db.get
  setTimeout(() => {
    let bestType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    db.get("SELECT * FROM results WHERE type = ?", [bestType], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        type: bestType,
        title: row.title,
        description: row.description
      });
    });
  }, 500);
});

// TCM Quiz API endpoints
// Get all TCM questions with options
app.get('/api/tcm/quiz', (req, res) => {
  const query = `
    SELECT 
      q.id,
      q.question_text,
      q.question_description,
      q.question_order,
      json_group_array(
        json_object(
          'id', o.id,
          'letter', o.option_letter,
          'text', o.option_text,
          'image_url', o.option_image_url,
          'body_type', o.body_type
        )
      ) as options
    FROM tcm_questions q
    LEFT JOIN tcm_options o ON q.id = o.question_id
    GROUP BY q.id
    ORDER BY q.question_order
  `;
  
  tcmDb.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const questions = rows.map(row => ({
      id: row.id,
      question_text: row.question_text,
      question_description: row.question_description,
      question_order: row.question_order,
      options: JSON.parse(row.options).filter(opt => opt.id !== null)
    }));
    
    res.json(questions);
  });
});

// Submit TCM quiz answers and get result
app.post('/api/tcm/quiz/submit', (req, res) => {
  const { answers } = req.body; // [{question_id, option_id, body_type}, ...]
  
  // Count body type occurrences
  const bodyTypeCounts = {};
  answers.forEach(answer => {
    if (answer.body_type) {
      bodyTypeCounts[answer.body_type] = (bodyTypeCounts[answer.body_type] || 0) + 1;
    }
  });
  
  // Find the most common body type
  const dominantBodyType = Object.keys(bodyTypeCounts).reduce((a, b) => 
    bodyTypeCounts[a] > bodyTypeCounts[b] ? a : b
  );
  
  // Get result details
  tcmDb.get(
    "SELECT * FROM tcm_results WHERE body_type = ?", 
    [dominantBodyType], 
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        body_type: dominantBodyType,
        title: row.title,
        description: row.description,
        recommendations: row.recommendations,
        foods_to_eat: row.foods_to_eat,
        foods_to_avoid: row.foods_to_avoid,
        lifestyle_tips: row.lifestyle_tips,
        body_type_counts: bodyTypeCounts
      });
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
