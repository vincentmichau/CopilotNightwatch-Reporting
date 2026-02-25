const { Umzug, SequelizeStorage } = require('umzug');
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DB_NAME || 'night_watch_reporting', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false
});

const umzug = new Umzug({
  migrations: { glob: path.join(__dirname, '..', 'migrations', '*.js') },
  context: sequelize,
  storage: new SequelizeStorage({ sequelize }),
  logger: console
});

const cmd = process.argv[2] || 'up';
(async () => {
  try {
    if (cmd === 'up') {
      const r = await umzug.up();
      console.log('Migrations applied:', r.map(m => m.name));
    } else if (cmd === 'down') {
      const r = await umzug.down();
      console.log('Migrations reverted:', r.map(m => m.name));
    } else {
      console.error('Unknown command', cmd);
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
