const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tcm_quiz.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

// Table creation queries
const tableQueries = [
  {
    name: 'tcm_submissions',
    query: `CREATE TABLE IF NOT EXISTS tcm_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      body_type TEXT,
      created_at TEXT NOT NULL
    );`
  },
  {
    name: 'users',
    query: `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`
  },
  {
    name: 'herbal_formulas',
    query: `CREATE TABLE IF NOT EXISTS herbal_formulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      formula_name TEXT NOT NULL,
      description TEXT,
      ingredients_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`
  },
  {
    name: 'patients',
    query: `CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`
  },
  {
    name: 'practitioners',
    query: `CREATE TABLE IF NOT EXISTS practitioners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      specialties TEXT NOT NULL,
      experience TEXT NOT NULL,
      rating DECIMAL(3,2) NOT NULL,
      reviews_count INTEGER NOT NULL,
      bio TEXT NOT NULL,
      availability TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL
    );`
  },
  {
    name: 'tcm_appointments',
    query: `CREATE TABLE IF NOT EXISTS tcm_appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      state TEXT,
      age INTEGER,
      auth_method TEXT,
      practitioner_id INTEGER,
      practitioner_name TEXT,
      start_datetime TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      notes TEXT,
      payment_status TEXT DEFAULT 'pending',
      payment_id TEXT,
      amount DECIMAL(10,2),
      created_at TEXT NOT NULL,
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );`
  }
];

// Create tables
const createTables = () => {
  let completed = 0;
  
  tableQueries.forEach((table) => {
    db.run(table.query, (err) => {
      if (err) {
        console.error(`Error creating table ${table.name}:`, err.message);
      } else {
        console.log(`✓ Created table: ${table.name}`);
      }
      
      completed++;
      if (completed === tableQueries.length) {
        console.log('\nAll tables created successfully!');
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      }
    });
  });
};

console.log('Starting table creation process...\n');
createTables();
