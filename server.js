// server.js
// Full server with changes to persist email + answers from TCM quiz into SQLite.
// - Provides existing endpoints (GET /api/quiz, POST /api/quiz/submit)
// - Provides TCM endpoints (GET /api/tcm/quiz, POST /api/tcm/quiz/submit)
// - Creates tcm_submissions table to store email, answers JSON, body_type, created_at

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Databases (existing)
const db = new sqlite3.Database('./tcm.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error('Error opening tcm.db:', err.message);
  else console.log('Opened tcm.db');
});
const tcmDb = new sqlite3.Database('./tcm_quiz.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) console.error('Error opening tcm_quiz.db:', err.message);
  else console.log('Opened tcm_quiz.db');
});

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Ensure submissions table exists for TCM quiz
tcmDb.serialize(() => {
  tcmDb.run(
    `CREATE TABLE IF NOT EXISTS tcm_submissions (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       email TEXT NOT NULL,
       answers_json TEXT NOT NULL,
       body_type TEXT,
       created_at TEXT NOT NULL
     );`,
    (err) => {
      if (err) {
        console.error('Failed to create tcm_submissions table:', err.message);
      } else {
        console.log('tcm_submissions table ready');
      }
    }
  );

  // Optional: ensure tcm_results table exists structure (no-op if already present)
  // You can remove or adjust this depending on your schema
  // tcmDb.run(`CREATE TABLE IF NOT EXISTS tcm_results (...);`);
});

// ---------------------------
// Existing quiz routes
// ---------------------------

// 1. Get 10 random questions (legacy)
app.get('/api/quiz', (req, res) => {
  db.all("SELECT * FROM questions ORDER BY RANDOM() LIMIT 10", [], (err, rows) => {
    if (err) {
      console.error('Error GET /api/quiz:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 2. Submit answers and calculate result (legacy)
app.post('/api/quiz/submit', (req, res) => {
  const answers = req.body.answers; // [{id, answer:true/false}, ...]

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers (array) required" });
  }

  // Tally scores
  let scores = { yin: 0, yang: 0, qi: 0, blood: 0 };

  // We'll collect DB calls and wait for them to finish using Promise wrapper
  const promises = answers.map(ans => {
    return new Promise((resolve) => {
      if (!ans.answer) return resolve();
      db.get("SELECT type FROM questions WHERE id = ?", [ans.id], (err, row) => {
        if (err) {
          console.error('Error reading question type:', err);
        } else if (row && row.type) {
          if (scores[row.type] !== undefined) scores[row.type]++;
        }
        resolve();
      });
    });
  });

  Promise.all(promises).then(() => {
    let bestType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    db.get("SELECT * FROM results WHERE type = ?", [bestType], (err, row) => {
      if (err) {
        console.error('Error fetching results row:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        type: bestType,
        title: row?.title || null,
        description: row?.description || null
      });
    });
  }).catch(e => {
    console.error('Error processing legacy quiz submit:', e);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// ---------------------------
// TCM Quiz API endpoints
// ---------------------------

// Get all TCM questions with options
app.get('/api/tcm/quiz', (req, res) => {
  // This query assembles options as a JSON array per question using json_group_array/json_object.
  // Ensure your SQLite build supports JSON1 extension. If not, adapt to a two-query approach.
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
    if (err) {
      console.error('Error GET /api/tcm/quiz:', err.message);
      return res.status(500).json({ error: err.message });
    }

    const questions = rows.map(row => {
      let opts = [];
      try {
        opts = row.options ? JSON.parse(row.options) : [];
      } catch (e) {
        // if parsing fails, fallback to empty array
        console.warn('Failed to parse options JSON for question', row.id);
        opts = [];
      }
      // filter out null id placeholders if any
      opts = opts.filter(opt => opt && opt.id !== null);
      return {
        id: row.id,
        question_text: row.question_text,
        question_description: row.question_description,
        question_order: row.question_order,
        options: opts
      };
    });

    res.json(questions);
  });
});

// Submit TCM quiz answers and get result (updated to store email)
app.post('/api/tcm/quiz/submit', (req, res) => {
  try {
    const { answers, email } = req.body;

    // Basic validation
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "answers (non-empty array) required" });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email is required" });
    }
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "invalid email format" });
    }

    // Count body type occurrences
    const bodyTypeCounts = {};
    answers.forEach(answer => {
      if (answer && answer.body_type) {
        bodyTypeCounts[answer.body_type] = (bodyTypeCounts[answer.body_type] || 0) + 1;
      }
    });

    // Determine dominant type, fallback to 'unsure'
    const dominantBodyType = Object.keys(bodyTypeCounts).length
      ? Object.keys(bodyTypeCounts).reduce((a, b) =>
          bodyTypeCounts[a] > bodyTypeCounts[b] ? a : b
        )
      : "unsure";

    // Query result details for the dominant type
    tcmDb.get(
      "SELECT * FROM tcm_results WHERE body_type = ?",
      [dominantBodyType],
      (err, row) => {
        if (err) {
          console.error('Error fetching tcm_results row:', err.message);
          return res.status(500).json({ error: err.message });
        }

        // Normalize/parse fields which might be stored as JSON strings or CSV
        const parseMaybeJson = (val) => {
          if (!val && val !== "") return [];
          if (Array.isArray(val)) return val;
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {
            // not JSON
          }
          // fallback: split by comma and trim, ignore empty
          return String(val).split(',').map(s => s.trim()).filter(Boolean);
        };

        const resultPayload = {
          body_type: dominantBodyType,
          title: (row && row.title) ? row.title : "Personalized Result",
          description: (row && row.description) ? row.description : "We created a tailored result for you.",
          recommendations: row ? parseMaybeJson(row.recommendations) : [],
          foods_to_eat: row ? parseMaybeJson(row.foods_to_eat) : [],
          foods_to_avoid: row ? parseMaybeJson(row.foods_to_avoid) : [],
          lifestyle_tips: row ? parseMaybeJson(row.lifestyle_tips) : [],
          body_type_counts: bodyTypeCounts
        };

        // Save submission in tcm_submissions table (store answers as JSON)
        const answersJson = JSON.stringify(answers);
        const createdAt = new Date().toISOString();
        const insertSql = `INSERT INTO tcm_submissions (email, answers_json, body_type, created_at) VALUES (?, ?, ?, ?)`;

        tcmDb.run(insertSql, [email, answersJson, dominantBodyType, createdAt], function(insertErr) {
          if (insertErr) {
            console.error('Failed to insert submission:', insertErr.message);
            // Return computed result but indicate not saved
            resultPayload.saved = false;
            resultPayload.savedEmail = null;
            return res.status(500).json({ error: "Failed to save submission" });
          }

          // success: include savedEmail and submission id
          resultPayload.saved = true;
          resultPayload.savedEmail = email;
          resultPayload.submissionId = this.lastID; // last inserted row id

          return res.json(resultPayload);
        });
      }
    );
  } catch (ex) {
    console.error('Unhandled error in /api/tcm/quiz/submit:', ex);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------
// Misc - static assets or health check
// ---------------------------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve a minimal message at root
app.get('/', (req, res) => {
  res.send('TCM Quiz server is running.');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
