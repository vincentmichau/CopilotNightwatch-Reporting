const fs = require('fs');
const path = require('path');

module.exports = {
  up: async ({ context: sequelize }) => {
    const sqlPath = path.join(__dirname, '..', '..', 'database', 'migration_add_rgpd_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    return sequelize.query(sql);
  },
  down: async ({ context: sequelize }) => {
    // simple rollback: drop the tables
    await sequelize.query('DROP TABLE IF EXISTS data_access_logs');
    await sequelize.query('DROP TABLE IF EXISTS consents');
  }
};
