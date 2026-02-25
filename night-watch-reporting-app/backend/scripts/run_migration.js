const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const fileArg = process.argv[2];
if (!fileArg) {
  console.error('Usage: node run_migration.js <sql-file-path>');
  process.exit(1);
}

const sqlPath = path.isAbsolute(fileArg) ? fileArg : path.join(__dirname, '..', fileArg);
if (!fs.existsSync(sqlPath)) {
  console.error('SQL file not found:', sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

const conn = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'night_watch_reporting'
});

conn.connect(err => {
  if (err) {
    console.error('DB connect error:', err);
    process.exit(1);
  }
  conn.query(sql, (e, r) => {
    if (e) {
      console.error('Migration error:', e);
      process.exit(1);
    }
    console.log('Migration applied successfully.');
    conn.end();
  });
});
