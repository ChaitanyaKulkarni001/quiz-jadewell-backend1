const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('./tcm_quiz.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to the database.');
          resolve();
        }
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed.');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  async deleteAllTables() {
    const tablesToDelete = [
      'tcm_appointments',
      'practitioners',
      'tcm_submissions',
      'users',
      'herbal_formulas',
      'patients'
    ];

    console.log('Starting table deletion process...\n');
    
    for (const tableName of tablesToDelete) {
      await this.runQuery(`DROP TABLE IF EXISTS ${tableName}`);
      console.log(`✓ Deleted table: ${tableName}`);
    }
    
    console.log('\nAll tables deleted successfully!');
  }

  async createAllTables() {
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

    console.log('Starting table creation process...\n');
    
    for (const table of tableQueries) {
      await this.runQuery(table.query);
      console.log(`✓ Created table: ${table.name}`);
    }
    
    console.log('\nAll tables created successfully!');
  }

  async seedPractitioners() {
    const practitioners = [
      {
        name: 'Dr. Sarah Chen',
        title: 'Licensed Acupuncturist & TCM Practitioner',
        specialties: JSON.stringify(['Pain Management', 'Digestive Health', 'Women\'s Health', 'Fertility Support']),
        experience: '8 years',
        rating: 4.9,
        reviews_count: 127,
        bio: 'Dr. Sarah Chen specializes in pain management and digestive health with a focus on personalized herbal treatments. She has helped hundreds of patients achieve better health through Traditional Chinese Medicine.',
        availability: 'Available this week',
        image_url: '/doctor.png',
        created_at: new Date().toISOString()
      },
      {
        name: 'Dr. Michael Rodriguez',
        title: 'Traditional Chinese Medicine Doctor',
        specialties: JSON.stringify(['Stress & Anxiety', 'Sleep Disorders', 'Immune Support', 'Mental Health']),
        experience: '12 years',
        rating: 4.8,
        reviews_count: 89,
        bio: 'Dr. Michael Rodriguez is an expert in stress management and sleep optimization using TCM principles and herbal medicine. He combines ancient wisdom with modern understanding.',
        availability: 'Available next week',
        image_url: '/doctor.png',
        created_at: new Date().toISOString()
      },
      {
        name: 'Dr. Emily Watson',
        title: 'Herbal Medicine Specialist',
        specialties: JSON.stringify(['Skin Health', 'Hormonal Balance', 'Detoxification', 'Anti-aging']),
        experience: '6 years',
        rating: 4.9,
        reviews_count: 156,
        bio: 'Dr. Emily Watson focuses on skin health and hormonal balance through personalized herbal formulas and lifestyle guidance. She has a passion for helping patients achieve radiant health.',
        availability: 'Available this week',
        image_url: '/doctor.png',
        created_at: new Date().toISOString()
      },
      {
        name: 'Dr. James Liu',
        title: 'Senior TCM Physician',
        specialties: JSON.stringify(['Chronic Pain', 'Autoimmune Conditions', 'Cancer Support', 'Longevity']),
        experience: '15 years',
        rating: 4.7,
        reviews_count: 203,
        bio: 'Dr. James Liu is a senior TCM physician with extensive experience in treating chronic conditions and supporting cancer patients. He brings deep knowledge of classical Chinese medicine.',
        availability: 'Available next week',
        image_url: '/doctor.png',
        created_at: new Date().toISOString()
      },
      {
        name: 'Dr. Maria Santos',
        title: 'Integrative Medicine Practitioner',
        specialties: JSON.stringify(['Weight Management', 'Diabetes Support', 'Cardiovascular Health', 'Wellness Coaching']),
        experience: '10 years',
        rating: 4.8,
        reviews_count: 142,
        bio: 'Dr. Maria Santos combines TCM with modern integrative medicine approaches. She specializes in metabolic health and preventive care, helping patients achieve sustainable wellness.',
        availability: 'Available this week',
        image_url: '/doctor.png',
        created_at: new Date().toISOString()
      },
      {
        name: 'Dr. David Kim',
        title: 'TCM Sports Medicine Specialist',
        specialties: JSON.stringify(['Sports Injuries', 'Muscle Recovery', 'Performance Enhancement', 'Rehabilitation']),
        experience: '7 years',
        rating: 4.9,
        reviews_count: 98,
        bio: 'Dr. David Kim specializes in sports medicine using TCM principles. He helps athletes and active individuals recover from injuries and optimize their performance naturally.',
        availability: 'Available next week',
        image_url: '/doctor.png',
        created_at: new Date().toISOString()
      }
    ];

    // Clear existing practitioners
    await this.runQuery('DELETE FROM practitioners');
    console.log('Cleared existing practitioners.');

    // Insert new practitioners
    const insertSql = `INSERT INTO practitioners (
      name, title, specialties, experience, rating, reviews_count, bio, availability, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    console.log('Inserting practitioners...\n');
    
    for (const practitioner of practitioners) {
      await this.runQuery(insertSql, [
        practitioner.name,
        practitioner.title,
        practitioner.specialties,
        practitioner.experience,
        practitioner.rating,
        practitioner.reviews_count,
        practitioner.bio,
        practitioner.availability,
        practitioner.image_url,
        practitioner.created_at
      ]);
      console.log(`✓ Inserted practitioner: ${practitioner.name}`);
    }
    
    console.log('\nAll practitioners inserted successfully!');
  }

  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  async getPractitioners() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM practitioners ORDER BY rating DESC", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

// Command line interface
async function main() {
  const dbManager = new DatabaseManager();
  const command = process.argv[2];

  try {
    await dbManager.connect();

    switch (command) {
      case 'delete':
        await dbManager.deleteAllTables();
        break;
      case 'create':
        await dbManager.createAllTables();
        break;
      case 'seed':
        await dbManager.seedPractitioners();
        break;
      case 'reset':
        console.log('Resetting database...\n');
        await dbManager.deleteAllTables();
        await dbManager.createAllTables();
        await dbManager.seedPractitioners();
        break;
      case 'list':
        const practitioners = await dbManager.getPractitioners();
        console.log('\nPractitioners in database:');
        practitioners.forEach(p => {
          console.log(`- ${p.name} (${p.title}) - Rating: ${p.rating}`);
        });
        break;
      default:
        console.log('Usage: node db_manager.js [command]');
        console.log('Commands:');
        console.log('  delete  - Delete all tables');
        console.log('  create  - Create all tables');
        console.log('  seed    - Seed practitioners data');
        console.log('  reset   - Delete, create, and seed (full reset)');
        console.log('  list    - List all practitioners');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await dbManager.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseManager;
