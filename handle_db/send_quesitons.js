// Insert TCM Quiz Questions & Options into SQLite (no images)
const sqlite3 = require("sqlite3").verbose();
const tcmDb = new sqlite3.Database("./tcm_quiz.db");

const newQuestions = [
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

newQuestions.forEach(q => {
  tcmDb.run(
    `INSERT INTO tcm_questions (question_text, question_order) VALUES (?, ?)`,
    [q.question_text, q.question_order],
    function(err) {
      if (err) return console.error("Failed to insert question:", err);
      const qid = this.lastID;
      q.options.forEach(opt => {
        tcmDb.run(
          `INSERT INTO tcm_options (question_id, option_letter, option_text, body_type) VALUES (?, ?, ?, ?)`,
          [qid, opt.letter, opt.text, opt.body_type],
          (err2) => { if (err2) console.error("Failed to insert option:", err2); }
        );
      });
    }
  );
});

console.log("All questions inserted successfully!");
