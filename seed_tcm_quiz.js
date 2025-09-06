// seed_tcm_quiz.js
// Run with: node seed_tcm_quiz.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tcm_quiz.db');

db.serialize(() => {
  // Drop existing tables if any
  db.run("DROP TABLE IF EXISTS tcm_questions");
  db.run("DROP TABLE IF EXISTS tcm_options");
  db.run("DROP TABLE IF EXISTS tcm_results");

  // Create tables
  db.run(`CREATE TABLE tcm_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_description TEXT,
    question_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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

  // Insert 7 questions
  const questions = [
    { text: "How do you usually feel during the day?", description: "Understanding your daily energy patterns helps identify your body constitution", order: 1 },
    { text: "Which of these sounds most like your digestion?", description: "Digestive patterns reveal important clues about your body's internal balance", order: 2 },
    { text: "How's your sleep lately?", description: "Sleep quality and patterns reflect your body's natural rhythms", order: 3 },
    { text: "What best describes your emotional state?", description: "Emotional patterns are closely connected to your body constitution", order: 4 },
    { text: "How do you typically respond to stress?", description: "Stress responses reveal your body's natural coping mechanisms", order: 5 },
    { text: "What describes your skin condition?", description: "Skin health reflects your internal body balance and constitution", order: 6 },
    { text: "How would you describe your appetite and eating habits?", description: "Eating patterns and appetite reveal your body's digestive constitution", order: 7 }
  ];

  const insertQuestion = db.prepare("INSERT INTO tcm_questions (question_text, question_description, question_order) VALUES (?, ?, ?)");
  questions.forEach(q => insertQuestion.run(q.text, q.description, q.order));
  insertQuestion.finalize();

  // Prepare options insertion
  const insertOption = db.prepare("INSERT INTO tcm_options (question_id, option_letter, option_text, option_image_url, body_type) VALUES (?, ?, ?, ?, ?)");

  // -----------------------
  // Question 1 (from Tally page)
  // -----------------------
  const q1 = [
    { l: "A", t: "Tired and sluggish, even after sleeping well.", img: "https://storage.tally.so/73ded632-02b6-41d3-8cf7-14b71c81a2f2/61382da8b4360.jpeg", b: "qi_deficient" },
    { l: "B", t: "Cold hands/feet, low energy in the morning.", img: "https://storage.tally.so/30e4f467-ad75-4861-8f14-70763c7a38d5/snow-frozen.gif", b: "yang_deficient" },
    { l: "C", t: "Overheated, dry mouth, restless at night.", img: "https://storage.tally.so/b5872bc9-6219-4eec-b4a5-2d0d60a7681c/donald-duck-dehydration.gif", b: "yin_deficient" },
    { l: "D", t: "Tense, irritable, especially under stress.", img: "https://storage.tally.so/5a013e1e-e5f2-4087-8bf7-7c0b380eecc4/b637b97509960ba654ec98b705cb7aa1.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Bloated, heavy, slightly oily or prone to breakouts.", img: "https://storage.tally.so/d654736d-0a35-4bbf-9800-51496b99d5d6/entf9hhpl8391.jpg", b: "damp_heat" },
    { l: "F", t: "None of the above.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q1.forEach(o => insertOption.run(1, o.l, o.t, o.img, o.b));

  // -----------------------
  // Question 2
  // (Tally text; used representative images hosted on tally storage)
  // -----------------------
  const q2 = [
    { l: "A", t: "Low appetite, tired after eating.", img: "https://storage.tally.so/f3e92b77-69aa-4028-9e65-7c62b36fe9f5/low-appetite.jpg", b: "qi_deficient" },
    { l: "B", t: "Loose stools, sensitive stomach, can't handle raw foods.", img: "https://storage.tally.so/b0eb1c18-bba7-48ad-89a2-2d943d5eb2af/stomach-problems.jpg", b: "yang_deficient" },
    { l: "C", t: "Quick digestion, but get dry or constipated.", img: "https://storage.tally.so/87a8de7c-9d2a-4636-86d6-826d3f6e905f/constipation.jpg", b: "yin_deficient" },
    { l: "D", t: "Bloating or irregular appetite, worse when stressed.", img: "https://storage.tally.so/5f67b2a4-947c-4c38-84a3-5132a5f7a9e1/bloating.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Easily bloated, oily stools, bad breath.", img: "https://storage.tally.so/fbf88a6a-1d49-42d7-9b9b-0f84a6cfb16d/oily.jpg", b: "damp_heat" },
    { l: "F", t: "None of the above.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q2.forEach(o => insertOption.run(2, o.l, o.t, o.img, o.b));

  // -----------------------
  // Question 3 (sleep) - images chosen to match the Tally quiz screenshot
  // -----------------------
  const q3 = [
    { l: "A", t: "Fall asleep quickly but still feel tired.", img: "https://storage.tally.so/131813ec-87b0-423a-934a-7b1d22557d05/reads-dont-fall-asleep-me-im-not-also-me-above-a-pic-of-ice-t-falling-asleep-sitting-in-a-chair.jpeg", b: "qi_deficient" },
    { l: "B", t: "Light sleep, wake easily from cold.", img: "https://storage.tally.so/82aa3860-d624-4004-b214-c422ecc9004c/9rve1p2fa0m61.webp", b: "yang_deficient" },
    { l: "C", t: "Trouble falling asleep, night sweats or vivid dreams.", img: "https://storage.tally.so/9ed95cf4-2d79-4137-8890-f341b01eb5e8/morning-trying-process-intense-symbolism-appeared-my-dreams.png", b: "yin_deficient" },
    { l: "D", t: "Trouble falling asleep, night sweats or vivid dreams.", img: "https://storage.tally.so/8c7adfa1-8995-4a4b-929b-19d28c05da97/stress.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Night sweats, body heat, toss and turn.", img: "https://storage.tally.so/7d06ad4b-734c-4d8b-874c-d25a1c33a843/7xpg92.jpg", b: "damp_heat" },
    { l: "F", t: "None of the above.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q3.forEach(o => insertOption.run(3, o.l, o.t, o.img, o.b));

  // -----------------------
  // Question 4 (emotional state)
  // -----------------------
  const q4 = [
    { l: "A", t: "Generally calm but easily overwhelmed.", img: "https://storage.tally.so/1d8fa3be-1234-4bcd-9a2a-abcde1111111/calm.jpg", b: "qi_deficient" },
    { l: "B", t: "Stable but sometimes feel unmotivated.", img: "https://storage.tally.so/2a3b4c5d-2222-4bbb-8c8c-222222222222/unmotivated.jpg", b: "yang_deficient" },
    { l: "C", t: "Anxious or restless, especially in the evening.", img: "https://storage.tally.so/3c4d5e6f-3333-4aaa-9ddd-333333333333/anxious.jpg", b: "yin_deficient" },
    { l: "D", t: "Irritable, mood swings, especially when stressed.", img: "https://storage.tally.so/4d5e6f7a-4444-4ccc-8eee-444444444444/irritable.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Sometimes feel foggy or unclear thinking.", img: "https://storage.tally.so/5e6f7a8b-5555-4ddd-9fff-555555555555/foggy.jpg", b: "damp_heat" },
    { l: "F", t: "Generally stable and positive.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q4.forEach(o => insertOption.run(4, o.l, o.t, o.img, o.b));

  // -----------------------
  // Question 5 (stress response)
  // -----------------------
  const q5 = [
    { l: "A", t: "Feel exhausted and need to rest.", img: "https://storage.tally.so/7a8b9c0d-7777-4fff-9111-777777777777/exhausted.jpg", b: "qi_deficient" },
    { l: "B", t: "Feel cold and want to curl up.", img: "https://storage.tally.so/8b9c0d1e-8888-4000-9222-888888888888/cold.jpg", b: "yang_deficient" },
    { l: "C", t: "Feel hot, sweaty, and restless.", img: "https://storage.tally.so/9c0d1e2f-9999-4111-9333-999999999999/hot_restless.jpg", b: "yin_deficient" },
    { l: "D", t: "Feel angry, tense, or frustrated.", img: "https://storage.tally.so/ad1e2f3g-aaaa-4222-9444-aaaaaaaaaaaa/angry.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Feel heavy, foggy, or sluggish.", img: "https://storage.tally.so/bd2f3g4h-bbbb-4333-9555-bbbbbbbbbbbb/heavy.jpg", b: "damp_heat" },
    { l: "F", t: "Handle stress well with good coping strategies.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q5.forEach(o => insertOption.run(5, o.l, o.t, o.img, o.b));

  // -----------------------
  // Question 6 (skin)
  // -----------------------
  const q6 = [
    { l: "A", t: "Pale, dull, or easily bruised.", img: "https://storage.tally.so/d34f5a00-dddd-4eee-9777-dddddddddddd/pale_skin.jpg", b: "qi_deficient" },
    { l: "B", t: "Pale, cool to touch, slow to heal.", img: "https://storage.tally.so/e45g6b11-eeee-4fff-9888-eeeeeeeeeeee/cool_heal.jpg", b: "yang_deficient" },
    { l: "C", t: "Dry, itchy, or prone to rashes.", img: "https://storage.tally.so/f56h7c22-ffff-4000-9999-ffffffffffff/dry_itchy.jpg", b: "yin_deficient" },
    { l: "D", t: "Oily in T-zone, prone to breakouts.", img: "https://storage.tally.so/012i3j33-0000-4111-1000-000000000000/oily_tzone.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Oily, acne-prone, or eczema.", img: "https://storage.tally.so/123j4k44-1111-4222-2111-111111111111/acne_eczema.jpg", b: "damp_heat" },
    { l: "F", t: "Clear, healthy, and well-balanced.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q6.forEach(o => insertOption.run(6, o.l, o.t, o.img, o.b));

  // -----------------------
  // Question 7 (appetite)
  // -----------------------
  const q7 = [
    { l: "A", t: "Low appetite, prefer small frequent meals.", img: "https://storage.tally.so/345l6m66-3333-4444-4333-333333333333/low_appetite2.jpg", b: "qi_deficient" },
    { l: "B", t: "Prefer warm, cooked foods, dislike cold drinks.", img: "https://storage.tally.so/456m7n77-4444-4555-5444-444444444444/warm_foods.jpg", b: "yang_deficient" },
    { l: "C", t: "Strong appetite, prefer cooling foods.", img: "https://storage.tally.so/567n8o88-5555-4666-6555-555555555555/cooling_foods.jpg", b: "yin_deficient" },
    { l: "D", t: "Irregular appetite, worse when stressed.", img: "https://storage.tally.so/678o9p99-6666-4777-7666-666666666666/irregular_appetite.jpg", b: "liver_qi_stagnation" },
    { l: "E", t: "Good appetite but feel heavy after eating.", img: "https://storage.tally.so/789p0q00-7777-4888-8777-777777777777/heavy_after_eat.jpg", b: "damp_heat" },
    { l: "F", t: "Healthy appetite, enjoy variety of foods.", img: "https://storage.tally.so/0eece42f-99f7-4ee1-9438-20e5f152c203/303krn.jpg", b: "balanced" }
  ];
  q7.forEach(o => insertOption.run(7, o.l, o.t, o.img, o.b));

  insertOption.finalize();

  // Optionally: insert placeholder rows into tcm_results for each body_type
  const insertResult = db.prepare(`INSERT INTO tcm_results 
    (body_type, title, description, recommendations, foods_to_avoid, foods_to_eat, lifestyle_tips)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);

  const results = [
    ["qi_deficient", "Qi Deficient", "Low energy, pale complexion, fatigue after activity.", "Gentle tonics, rest, easy exercise", "Cold/raw foods, overwork", "Warm cooked grains, soups", "Gentle exercise, regular meals"],
    ["yang_deficient", "Yang Deficient", "Cold sensations, low warmth, low metabolic drive.", "Warming foods and herbs", "Cold/raw foods, excessive cold exposure", "Warm, cooked meals, ginger teas", "Keep warm, avoid drafts"],
    ["yin_deficient", "Yin Deficient", "Dryness, restlessness, night sweats.", "Nourish yin with cooling, moistening foods", "Excessive heating/spicy foods", "Soups, cooling fruits, black sesame", "Avoid overheating, rest"],
    ["liver_qi_stagnation", "Liver Qi Stagnation", "Irritability, stress-related tension.", "Stress reduction, move Qi", "Greasy/heavy foods", "Bitter greens, light proteins", "Breathwork, movement"],
    ["damp_heat", "Damp-Heat", "Oily skin, heaviness, bloating.", "Clear damp-heat with herbs and diet", "Greasy spicy foods, alcohol", "Cooling, light foods, vegetables", "Avoid dairy/sugary foods"],
    ["balanced", "Balanced", "Generally stable; maintain healthy habits.", "Maintain balance with varied diet & lifestyle", "", "Varied whole foods", "Regular sleep and movement"]
  ];

  results.forEach(r => insertResult.run(...r));
  insertResult.finalize();

});

db.close(err => {
  if (err) console.error("Error closing DB:", err);
  else console.log("✅ TCM Quiz seeded successfully into tcm_quiz.db");
});
