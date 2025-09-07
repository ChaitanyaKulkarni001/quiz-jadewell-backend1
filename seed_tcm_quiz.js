const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tcm_quiz.db');

const questionsData = [
  {
    question_text: "How do you usually feel during the day?",
    question_order: 1,
    options: [
      { letter: "A", text: "Tired and sluggish, even after sleeping well.", body_type: "yin" },
      { letter: "B", text: "Cold hands/feet, low energy in the morning.", body_type: "yang" },
      { letter: "C", text: "Overheated, dry mouth, restless at night.", body_type: "yang" },
      { letter: "D", text: "Tense, irritable, especially under stress.", body_type: "qi" },
      { letter: "E", text: "Bloated, heavy, slightly oily or prone to breakouts.", body_type: "blood" },
      { letter: "F", text: "None of the above.", body_type: "unsure" },
    ],
  },
  {
    question_text: "Which of these sounds most like your digestion?",
    question_order: 2,
    options: [
      { letter: "A", text: "Low appetite, tired after eating.", body_type: "yin" },
      { letter: "B", text: "Loose stools, sensitive stomach, can't handle raw foods.", body_type: "yang" },
      { letter: "C", text: "Quick digestion, but get dry or constipated.", body_type: "yang" },
      { letter: "D", text: "Bloating or irregular appetite, worse when stressed.", body_type: "qi" },
      { letter: "E", text: "Easily bloated, oily stools, bad breath.", body_type: "blood" },
      { letter: "F", text: "None of the above.", body_type: "unsure" },
    ],
  },
  {
    question_text: "How's your sleep lately?",
    question_order: 3,
    options: [
      { letter: "A", text: "Fall asleep quickly but still feel tired.", body_type: "yin" },
      { letter: "B", text: "Light sleep, wake easily from cold.", body_type: "yang" },
      { letter: "C", text: "Trouble falling asleep, night sweats or vivid dreams.", body_type: "yang" },
      { letter: "D", text: "Wake up feeling stressed or with jaw tension.", body_type: "qi" },
      { letter: "E", text: "Night sweats, body heat, toss and turn.", body_type: "blood" },
      { letter: "F", text: "None of the above.", body_type: "unsure" },
    ],
  },
  {
    question_text: "What best describes your mood most often?",
    question_order: 4,
    options: [
      { letter: "A", text: "Mentally foggy, low motivation.", body_type: "yin" },
      { letter: "B", text: "Withdrawn, need extra rest to feel okay.", body_type: "yang" },
      { letter: "C", text: "Anxious, restless, easily overstimulated.", body_type: "yang" },
      { letter: "D", text: "Irritable, moody, emotional swings.", body_type: "qi" },
      { letter: "E", text: "Frustrated, “hot-tempered” when overwhelmed.", body_type: "blood" },
      { letter: "F", text: "None of the above.", body_type: "unsure" },
    ],
  },
  {
    question_text: "Which skin/hair trait stands out the most?",
    question_order: 5,
    options: [
      { letter: "A", text: "Pale skin, dry or thinning hair.", body_type: "yin" },
      { letter: "B", text: "Pale, puffy face, brittle nails.", body_type: "yang" },
      { letter: "C", text: "Redness, dryness, prone to heat rashes.", body_type: "yang" },
      { letter: "D", text: "Acne or breakouts during stress.", body_type: "qi" },
      { letter: "E", text: "Oily skin, body odor, breakouts.", body_type: "blood" },
      { letter: "F", text: "None of the above.", body_type: "unsure" },
    ],
  },
  {
    question_text: "What symptom do you experience regularly?",
    question_order: 6,
    options: [
      { letter: "A", text: "Fatigue or low immunity", body_type: "yin" },
      { letter: "B", text: "Sensitivity to cold, weak knees/back", body_type: "yang" },
      { letter: "C", text: "Dryness (skin, eyes, mouth)", body_type: "yang" },
      { letter: "D", text: "PMS, chest tightness, sighing", body_type: "qi" },
      { letter: "E", text: "Skin irritation, bitter taste, sticky stools", body_type: "blood" },
      { letter: "F", text: "None of the above.", body_type: "unsure" },
    ],
  },
];


const resultsData = [
  ["qi_deficient", "Qi Deficient", "Low energy, pale complexion, fatigue after activity.",
    JSON.stringify(["Gentle tonics", "Rest", "Easy exercise"]),
    JSON.stringify(["Cold/raw foods", "Overwork"]),
    JSON.stringify(["Warm cooked grains", "Soups"]),
    JSON.stringify(["Gentle exercise", "Regular meals"])
  ],
  ["yang_deficient", "Yang Deficient", "Cold sensations, low warmth, low metabolic drive.",
    JSON.stringify(["Warming foods and herbs"]),
    JSON.stringify(["Cold/raw foods", "Excessive cold exposure"]),
    JSON.stringify(["Warm, cooked meals", "Ginger teas"]),
    JSON.stringify(["Keep warm", "Avoid drafts"])
  ],
  ["yin_deficient", "Yin Deficient", "Dryness, restlessness, night sweats.",
    JSON.stringify(["Nourish yin with cooling, moistening foods"]),
    JSON.stringify(["Excessive heating/spicy foods"]),
    JSON.stringify(["Soups", "Cooling fruits", "Black sesame"]),
    JSON.stringify(["Avoid overheating", "Rest"])
  ],
  ["liver_qi_stagnation", "Liver Qi Stagnation", "Irritability, stress-related tension.",
    JSON.stringify(["Stress reduction", "Move Qi"]),
    JSON.stringify(["Greasy/heavy foods"]),
    JSON.stringify(["Bitter greens", "Light proteins"]),
    JSON.stringify(["Breathwork", "Movement"])
  ],
  ["damp_heat", "Damp-Heat", "Oily skin, heaviness, bloating.",
    JSON.stringify(["Clear damp-heat with herbs and diet"]),
    JSON.stringify(["Greasy spicy foods", "Alcohol"]),
    JSON.stringify(["Cooling, light foods", "Vegetables"]),
    JSON.stringify(["Avoid dairy", "Sugary foods"])
  ],
  ["balanced", "Balanced", "Generally stable; maintain healthy habits.",
    JSON.stringify(["Maintain balance with varied diet & lifestyle"]),
    JSON.stringify([]),
    JSON.stringify(["Varied whole foods"]),
    JSON.stringify(["Regular sleep", "Movement"])
  ],
];

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS tcm_questions");
  db.run("DROP TABLE IF EXISTS tcm_options");
  db.run("DROP TABLE IF EXISTS tcm_results");

  db.run(`CREATE TABLE tcm_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE tcm_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_letter TEXT NOT NULL,
    option_text TEXT NOT NULL,
    body_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES tcm_questions (id)
  )`);

  db.run(`CREATE TABLE tcm_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body_type TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendations TEXT,
    foods_to_avoid TEXT,
    foods_to_eat TEXT,
    lifestyle_tips TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const insertResult = db.prepare(`INSERT INTO tcm_results (body_type, title, description, recommendations, foods_to_avoid, foods_to_eat, lifestyle_tips) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  resultsData.forEach(r => insertResult.run(...r));
  insertResult.finalize();

  const insertQuestion = db.prepare(`INSERT INTO tcm_questions (question_text, question_order) VALUES (?, ?)`);
  const insertOption = db.prepare(`INSERT INTO tcm_options (question_id, option_letter, option_text, body_type) VALUES (?, ?, ?, ?)`);

  const insertAllQuestions = (index = 0) => {
    if (index >= questionsData.length) {
      insertQuestion.finalize();
      insertOption.finalize();
      db.close(err => {
        if (err) console.error("Error closing DB:", err);
        else console.log("✅ Seeding completed successfully in tcm_quiz.db");
      });
      return;
    }

    const q = questionsData[index];
    insertQuestion.run(q.question_text, q.question_order, function(err) {
      if (err) return console.error("Error inserting question:", err);

      const questionId = this.lastID;
      q.options.forEach(opt => {
        insertOption.run(questionId, opt.letter, opt.text, opt.body_type);
      });

      insertAllQuestions(index + 1);
    });
  };

  insertAllQuestions();
});
