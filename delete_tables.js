const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tcm_quiz.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the database.');
});

// List of tables to delete
const tablesToDelete = [
  'tcm_appointments',
  'practitioners',
  'tcm_submissions',
  'users',
  'herbal_formulas',
  'patients'
];

// Delete tables in reverse order to handle foreign key constraints
const deleteTables = () => {
  let completed = 0;
  
  tablesToDelete.forEach((tableName) => {
    db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
      if (err) {
        console.error(`Error deleting table ${tableName}:`, err.message);
      } else {
        console.log(`✓ Deleted table: ${tableName}`);
      }
      
      completed++;
      if (completed === tablesToDelete.length) {
        console.log('\nAll tables deleted successfully!');
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

console.log('Starting table deletion process...\n');
deleteTables();
