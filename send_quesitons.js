const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tcm.db');

// Create tables
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS questions");
  db.run("DROP TABLE IF EXISTS results");

  db.run(`CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    type TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE results (
    type TEXT PRIMARY KEY,
    title TEXT,
    description TEXT
  )`);

  // Insert questions
  const questions = [
    ["Do you often feel cold hands and feet?", "yang"],
    ["Do you often feel hot at night?", "yin"],
    ["Do you often feel tired or low energy?", "qi"],
    ["Do you have pale complexion or dizziness?", "blood"],
    ["Do you sweat easily without exertion?", "qi"],
    ["Do you feel restless or have difficulty sleeping?", "yin"],
    ["Do you often feel bloated after meals?", "qi"],
    ["Do you experience frequent colds or weak immunity?", "yang"],
    ["Do you have dry throat, lips, or skin?", "yin"],
    ["Do you bruise easily or have poor circulation?", "blood"],
    ["Do you have trouble concentrating?", "qi"],
    ["Do you feel emotionally unbalanced often?", "yin"],
    ["Do you experience back or knee weakness?", "yang"],
    ["Do you feel dizzy when standing up quickly?", "blood"],
    ["Do you have poor appetite?", "qi"],
    ["Do you have excessive sweating during the day?", "qi"],
    ["Do you feel nervous or anxious at night?", "yin"],
    ["Do you feel fatigued in cold weather?", "yang"],
    ["Do you have irregular menstruation (if applicable)?", "blood"],
    ["Do you catch colds easily?", "yang"],
    ["Do you wake up often at night thirsty?", "yin"],
    ["Do you feel like your muscles are weak?", "qi"],
    ["Do you feel your hands/feet are icy in winter?", "yang"],
    ["Do you experience palpitations?", "qi"],
    ["Do you feel mentally exhausted even after rest?", "qi"],
    ["Do you have a red tongue or dry mouth?", "yin"],
    ["Do you feel sluggish in the morning?", "yang"],
    ["Do you get headaches with fatigue?", "qi"],
    ["Do you feel emotionally low or depressed?", "blood"],
    ["Do you have ringing in ears or poor hearing?", "yin"]
  ];

  const insertQ = db.prepare("INSERT INTO questions (text, type) VALUES (?, ?)");
  questions.forEach(q => insertQ.run(q[0], q[1]));
  insertQ.finalize();

  // Insert results
  const results = [
    ["yin", "Yin Deficient", "Often feels hot, restless, and dry. Yin-nourishing herbs and cooling foods may help restore balance."],
    ["yang", "Yang Deficient", "Often feels cold, weak, or tired. Warming herbs and foods may help restore vitality."],
    ["qi", "Qi Deficient", "Often feels fatigued, weak, or short of breath. Qi-tonifying herbs and balanced meals may help."],
    ["blood", "Blood Deficient", "Often looks pale, feels dizzy, or has poor circulation. Blood-nourishing herbs and iron-rich foods may help."]
  ];

  const insertR = db.prepare("INSERT INTO results (type, title, description) VALUES (?, ?, ?)");
  results.forEach(r => insertR.run(r[0], r[1], r[2]));
  insertR.finalize();
});

db.close();
