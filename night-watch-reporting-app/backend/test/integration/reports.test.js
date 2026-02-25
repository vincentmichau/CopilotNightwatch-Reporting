const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app'); // app exports the express instance
const db = require('../../src/config/db');

// Helper to sign token
const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'devsecret');

describe('Integration: reports endpoints', () => {
  let server;
  beforeAll((done) => {
    // start server if not already running
    server = app.listen(0, () => done());
  });

  afterAll((done) => {
    server.close(() => {
      // close DB connection if available
      if (db && db.end) db.end();
      done();
    });
  });

  test('create admin user (initial) and create+list report', async () => {
    // Clean DB tables used by tests to ensure initial state
    await new Promise((resolve, reject) => db.query('DELETE FROM reports', [], (e) => e ? reject(e) : resolve()));
    await new Promise((resolve, reject) => db.query('DELETE FROM users', [], (e) => e ? reject(e) : resolve()));

    // Create initial admin user (allowed when users table empty)
    const userRes = await request(server)
      .post('/api/admin/users')
      .send({ username: 'int-admin', password: 'pass', email: 'int@example.com', role: 'admin' })
      .expect(201);

    const userId = userRes.body.id;
    expect(userId).toBeGreaterThan(0);

    // Generate token for this user
    const token = sign({ id: userId });

    // Create a report
    const postRes = await request(server)
      .post('/api/reports')
      .set('Authorization', token)
      .send({ report_text: 'Integration test report' })
      .expect(201);

    expect(postRes.body).toHaveProperty('id');

    // List reports and expect to find the created report with username
    const getRes = await request(server)
      .get('/api/reports')
      .set('Authorization', token)
      .expect(200);

    expect(Array.isArray(getRes.body)).toBe(true);
    const found = getRes.body.find(r => r.id === postRes.body.id);
    expect(found).toBeDefined();
    expect(found).toHaveProperty('username');
    expect(found.username).toBe('int-admin');
  });
});
