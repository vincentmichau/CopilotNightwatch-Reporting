const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');

jest.mock('../../src/services/mailer', () => ({ sendMail: jest.fn().mockResolvedValue(true) }));
const mailer = require('../../src/services/mailer');

describe('Integration: register + confirm', () => {
  let server;
  beforeAll((done) => {
    server = app.listen(0, () => done());
  });
  afterAll((done) => {
    server.close(() => {
      if (db && db.end) db.end();
      done();
    });
  });

  test('register flow sends email and confirm activates account', async () => {
    // Reset
    await new Promise((res, rej) => db.query('DELETE FROM email_confirmations', [], () => res()));
    await new Promise((res, rej) => db.query('DELETE FROM users', [], () => res()));

    const reg = await request(server)
      .post('/api/auth/register')
      .send({ username: 'ruser', password: 'pwd', email: 'r@example.com' })
      .expect(201);

    expect(reg.body).toHaveProperty('id');
    expect(mailer.sendMail).toHaveBeenCalled();

    // Fetch token from DB
    const row = await new Promise((res, rej) => db.query('SELECT token, user_id FROM email_confirmations LIMIT 1', [], (e, r) => e ? rej(e) : res(r && r[0] ? r[0] : null)));
    expect(row).toBeDefined();

    // Confirm
    await request(server).get('/api/auth/confirm').query({ token: row.token }).expect(200);

    // Now login should be allowed
    const login = await request(server).post('/api/auth/login').send({ username: 'ruser', password: 'pwd' }).expect(200);
    expect(login.body).toHaveProperty('token');
  });
});
