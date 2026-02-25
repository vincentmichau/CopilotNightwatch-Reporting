const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');

describe('Integration: RGPD endpoints', () => {
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

  test('consent set/get and forget-me flow', async () => {
    // Reset DB
    await new Promise((res, rej) => db.query('DELETE FROM email_confirmations', [], () => res()));
    await new Promise((res, rej) => db.query('DELETE FROM users', [], () => res()));
    await new Promise((res, rej) => db.query('DELETE FROM reports', [], () => res()));
    await new Promise((res, rej) => db.query('DELETE FROM consents', [], () => res()));

    // Create initial admin (allowed when users table empty)
    const adm = await request(server).post('/api/admin/users').send({ username: 'adm', password: 'pass', email: 'adm@example.com', role: 'admin' }).expect(201);
    // Login admin to obtain token
    const login = await request(server).post('/api/auth/login').send({ username: 'adm', password: 'pass' }).expect(200);
    const token = login.body.token;

    // Set consent
    await request(server).post('/api/rgpd/consent').set('Authorization', token).send({ consent: true }).expect(200);

    // Get consent
    const getRes = await request(server).get('/api/rgpd/consent').set('Authorization', token).expect(200);
    expect(getRes.body).toHaveProperty('consent');
    expect(getRes.body.consent).toBe(true);

    // Forget-me (anonymize)
    await request(server).post('/api/rgpd/forget-me').set('Authorization', token).expect(200);

    // After anonymization, login with previous credentials should fail
    await request(server).post('/api/auth/login').send({ username: 'adm', password: 'pass' }).expect(401);
  }, 20000);
});
