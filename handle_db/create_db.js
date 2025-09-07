const sqlite3 = require("sqlite3").verbose();
const tcmDb = new sqlite3.Database("./tcm_quiz.db");

// 1️⃣ Create tcm_questions table if it doesn't exist
tcmDb.serialize(() => {
  tcmDb.run(`
    CREATE TABLE IF NOT EXISTS tcm_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL UNIQUE,
      question_description TEXT,
      question_order INTEGER
    );
  `, (err) => {
    if (err) return console.error("Failed to create tcm_questions:", err.message);
    console.log("tcm_questions table ready");

    // 2️⃣ Create tcm_options table if it doesn't exist
    tcmDb.run(`
      CREATE TABLE IF NOT EXISTS tcm_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        option_letter TEXT NOT NULL,
        option_text TEXT NOT NULL,
        body_type TEXT,
        FOREIGN KEY(question_id) REFERENCES tcm_questions(id)
      );
    `, (err2) => {
      if (err2) return console.error("Failed to create tcm_options:", err2.message);
      console.log("tcm_options table ready");

      // 3️⃣ Now you can insert questions using the previous script
      require("./send_questions_insert.js"); // your insertion script
    });
  });
});
