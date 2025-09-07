const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tcm_quiz.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

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
db.run('DELETE FROM practitioners', (err) => {
  if (err) {
    console.error('Error clearing practitioners:', err.message);
    return;
  }
  console.log('Cleared existing practitioners.');
});

// Insert new practitioners
const insertSql = `INSERT INTO practitioners (
  name, title, specialties, experience, rating, reviews_count, bio, availability, image_url, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

let completed = 0;
practitioners.forEach((practitioner) => {
  db.run(insertSql, [
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
  ], function(err) {
    if (err) {
      console.error('Error inserting practitioner:', err.message);
    } else {
      console.log(`✓ Inserted practitioner: ${practitioner.name} (ID: ${this.lastID})`);
    }
    
    completed++;
    if (completed === practitioners.length) {
      console.log('\nAll practitioners inserted successfully!');
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