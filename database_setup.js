const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tcm_quiz.db');

// Create tables for TCM Body Type Quiz
db.serialize(() => {
  // Drop existing tables if they exist
  db.run("DROP TABLE IF EXISTS tcm_questions");
  db.run("DROP TABLE IF EXISTS tcm_options");
  db.run("DROP TABLE IF EXISTS tcm_results");

  // Create questions table
  db.run(`CREATE TABLE tcm_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_description TEXT,
    question_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create options table
  db.run(`CREATE TABLE tcm_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_letter TEXT NOT NULL,
    option_text TEXT NOT NULL,
    option_image_url TEXT,
    body_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES tcm_questions (id)
  )`);

  // Create results table for body types
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

  // Insert TCM questions based on the Tally quiz
  const questions = [
    {
      text: "How do you usually feel during the day?",
      description: "Understanding your daily energy patterns helps identify your body constitution",
      order: 1
    },
    {
      text: "Which of these sounds most like your digestion?",
      description: "Digestive patterns reveal important clues about your body's internal balance",
      order: 2
    },
    {
      text: "How would you describe your sleep patterns?",
      description: "Sleep quality and patterns reflect your body's natural rhythms",
      order: 3
    },
    {
      text: "What best describes your emotional state?",
      description: "Emotional patterns are closely connected to your body constitution",
      order: 4
    },
    {
      text: "How do you typically respond to stress?",
      description: "Stress responses reveal your body's natural coping mechanisms",
      order: 5
    },
    {
      text: "What describes your skin condition?",
      description: "Skin health reflects your internal body balance and constitution",
      order: 6
    },
    {
      text: "How would you describe your appetite and eating habits?",
      description: "Eating patterns and appetite reveal your body's digestive constitution",
      order: 7
    }
  ];

  const insertQuestion = db.prepare("INSERT INTO tcm_questions (question_text, question_description, question_order) VALUES (?, ?, ?)");
  questions.forEach(q => insertQuestion.run(q.text, q.description, q.order));
  insertQuestion.finalize();

  // Insert options for each question
  const insertOption = db.prepare("INSERT INTO tcm_options (question_id, option_letter, option_text, option_image_url, body_type) VALUES (?, ?, ?, ?, ?)");

  // Question 1: How do you usually feel during the day?
  const question1Options = [
    { letter: "A", text: "Tired and sluggish, even after sleeping well.", image: "https://storage.tally.so/73ded632-02b6-41d3-8cf7-14b71c81a2f2/61382da8b4360.jpeg", bodyType: "qi_deficient" },
    { letter: "B", text: "Cold hands/feet, low energy in the morning.", image: "https://storage.tally.so/30e4f467-ad75-4861-8f14-70763c7a38d5/snow-frozen.gif", bodyType: "yang_deficient" },
    { letter: "C", text: "Overheated, dry mouth, restless at night.", image: "https://storage.tally.so/b5872bc9-6219-4eec-b4a5-2d0d60a7681c/donald-duck-dehydration.gif", bodyType: "yin_deficient" },
    { letter: "D", text: "Tense, irritable, especially under stress.", image: "https://storage.tally.so/5a013e1e-e5f2-4087-8bf7-7c0b380eecc4/b637b97509960ba654ec98b705cb7aa1.jpg", bodyType: "liver_qi_stagnation" },
    { letter: "E", text: "Bloated, heavy, slightly oily or prone to breakouts.", image: "https://storage.tally.so/d654736d-0a35-4bbf-9800-96b99d5d6/entf9hhpl8391.jpg", bodyType: "damp_heat" },
    { letter: "F", text: "None of the above.", image: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", bodyType: "balanced" }
  ];

  question1Options.forEach(opt => insertOption.run(1, opt.letter, opt.text, opt.image, opt.bodyType));

  // Question 2: Which of these sounds most like your digestion?
  const question2Options = [
    { letter: "A", text: "Low appetite, tired after eating.", bodyType: "qi_deficient" },
    { letter: "B", text: "Loose stools, sensitive stomach, can't handle raw foods.", bodyType: "yang_deficient" },
    { letter: "C", text: "Quick digestion, but get dry or constipated.", bodyType: "yin_deficient" },
    { letter: "D", text: "Bloating or irregular appetite, worse when stressed.", bodyType: "liver_qi_stagnation" },
    { letter: "E", text: "Easily bloated, oily stools, bad breath.", bodyType: "damp_heat" },
    { letter: "F", text: "None of the above.", bodyType: "balanced" }
  ];

  question2Options.forEach(opt => insertOption.run(2, opt.letter, opt.text, opt.image, opt.bodyType));

  // Question 3: How would you describe your sleep patterns?
  const question3Options = [
    { letter: "A", text: "Fall asleep easily but wake up tired.", bodyType: "qi_deficient" },
    { letter: "B", text: "Need extra blankets, prefer warm environments.", bodyType: "yang_deficient" },
    { letter: "C", text: "Trouble falling asleep, wake up hot or thirsty.", bodyType: "yin_deficient" },
    { letter: "D", text: "Mind races at night, wake up tense.", bodyType: "liver_qi_stagnation" },
    { letter: "E", text: "Heavy sleep but wake up feeling groggy.", bodyType: "damp_heat" },
    { letter: "F", text: "Sleep well most nights.", bodyType: "balanced" }
  ];

  question3Options.forEach(opt => insertOption.run(3, opt.letter, opt.text, opt.image, opt.bodyType));

  // Question 4: What best describes your emotional state?
  const question4Options = [
    { letter: "A", text: "Generally calm but easily overwhelmed.", bodyType: "qi_deficient" },
    { letter: "B", text: "Stable but sometimes feel unmotivated.", bodyType: "yang_deficient" },
    { letter: "C", text: "Anxious or restless, especially in the evening.", bodyType: "yin_deficient" },
    { letter: "D", text: "Irritable, mood swings, especially when stressed.", bodyType: "liver_qi_stagnation" },
    { letter: "E", text: "Sometimes feel foggy or unclear thinking.", bodyType: "damp_heat" },
    { letter: "F", text: "Generally stable and positive.", bodyType: "balanced" }
  ];

  question4Options.forEach(opt => insertOption.run(4, opt.letter, opt.text, opt.image, opt.bodyType));

  // Question 5: How do you typically respond to stress?
  const question5Options = [
    { letter: "A", text: "Feel exhausted and need to rest.", bodyType: "qi_deficient" },
    { letter: "B", text: "Feel cold and want to curl up.", bodyType: "yang_deficient" },
    { letter: "C", text: "Feel hot, sweaty, and restless.", bodyType: "yin_deficient" },
    { letter: "D", text: "Feel angry, tense, or frustrated.", bodyType: "liver_qi_stagnation" },
    { letter: "E", text: "Feel heavy, foggy, or sluggish.", bodyType: "damp_heat" },
    { letter: "F", text: "Handle stress well with good coping strategies.", bodyType: "balanced" }
  ];

  question5Options.forEach(opt => insertOption.run(5, opt.letter, opt.text, opt.image, opt.bodyType));
])
//   // Question 6: What describes your skin condition?
//   const question6Options = [
//     { letter: "A", text: "Pale, dull, or easily bruised.", bodyType: "qi_deficient" },
//     { letter: "B", text: "Pale, cool to touch, slow to heal.", bodyType: "yang_deficient" },
//     { letter: "C", text: "Dry, itchy, or prone to rashes.", bodyType: "yin_deficient" },
//     { letter: "D", text: "Oily in T-zone, prone to breakouts.", bodyType: "liver_qi_stagnation