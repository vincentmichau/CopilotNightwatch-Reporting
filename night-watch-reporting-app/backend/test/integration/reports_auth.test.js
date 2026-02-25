const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const db = require('../../src/config/db');

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'devsecret');

describe('Integration: reports auth + permissions', () => {
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

  test('update/delete permissions and error cases', async () => {
    // Reset DB
    await new Promise((resolve, reject) => db.query('DELETE FROM reports', [], (e) => e ? reject(e) : resolve()));
    await new Promise((resolve, reject) => db.query('DELETE FROM users', [], (e) => e ? reject(e) : resolve()));

    // Create initial admin
    const adminRes = await request(server)
      .post('/api/admin/users')
      .send({ username: 'adm', password: 'pass', email: 'adm@example.com', role: 'admin' })
      .expect(201);
    const adminId = adminRes.body.id;
    const adminToken = sign({ id: adminId });

    // Admin creates a normal user
    const userRes = await request(server)
      .post('/api/admin/users')
      .set('Authorization', adminToken)
      .send({ username: 'user1', password: 'u1', email: 'u1@example.com', role: 'watchman' })
      .expect(201);
    const userId = userRes.body.id;
    const userLogin = await request(server).post('/api/auth/login').send({ username: 'user1', password: 'u1' }).expect(200);
    const userToken = userLogin.body.token;

    // Admin creates a report
    const postRes = await request(server)
      .post('/api/reports')
      .set('Authorization', adminToken)
      .send({ report_text: 'Admin report' })
      .expect(201);
    const reportId = postRes.body.id;

    // Non-owner (user1) tries to update admin's report -> 403
    await request(server)
      .put(`/api/reports/${reportId}`)
      .set('Authorization', userToken)
      .send({ report_text: 'attempted edit' })
      .expect(403);

    // Admin updates -> success
    await request(server)
      .put(`/api/reports/${reportId}`)
      .set('Authorization', adminToken)
      .send({ report_text: 'admin edited' })
      .expect(200);

    // Non-authenticated update -> 401
    await request(server)
      .put(`/api/reports/${reportId}`)
      .send({ report_text: 'no token' })
      .expect(401);

    // Non-existing report update -> 404
    await request(server)
      .put(`/api/reports/99999`)
      .set('Authorization', adminToken)
      .send({ report_text: 'nope' })
      .expect(404);

    // User creates own report
    const ownRes = await request(server)
      .post('/api/reports')
      .set('Authorization', userToken)
      .send({ report_text: 'user own' })
      .expect(201);
    const ownId = ownRes.body.id;

    // Another non-admin tries to delete admin's report -> 403
    await request(server)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', userToken)
      .expect(403);

    // Owner deletes own report -> success
    await request(server)
      .delete(`/api/reports/${ownId}`)
      .set('Authorization', userToken)
      .expect(200);

    // Admin deletes remaining report -> success
    await request(server)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', adminToken)
      .expect(200);

    // Delete non-existent -> 404
    await request(server)
      .delete(`/api/reports/99999`)
      .set('Authorization', adminToken)
      .expect(404);
  }, 20000);
});
