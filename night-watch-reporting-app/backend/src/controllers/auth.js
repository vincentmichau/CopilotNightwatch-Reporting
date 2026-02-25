const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../services/mailer');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username et password requis' });

  try {
    db.query('SELECT id, username, password, email, role, IFNULL(confirmed,0) AS confirmed FROM users WHERE username = ? LIMIT 1', [username], (err, rows) => {
      if (err) {
        console.error('Auth login DB error:', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      const user = rows && rows.length ? rows[0] : null;
      if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

      if (!user.confirmed) return res.status(403).json({ message: 'Compte non confirmé. Vérifiez votre email.' });

      const ok = bcrypt.compareSync(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'devsecret');
      return res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Register: create user (unconfirmed) and send confirmation email
async function register(req, res) {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).json({ message: 'username, password, email requis' });

  try {
    // Ensure users table has `confirmed` column (best-effort)
    try {
      db.query('ALTER TABLE users ADD COLUMN confirmed TINYINT(1) DEFAULT 0', [], () => {});
    } catch (e) {
      // ignore
    }

    // Check uniqueness
    const exists = await new Promise((resolve, reject) => {
      db.query('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1', [username, email], (e, r) => e ? reject(e) : resolve(r && r.length ? r[0] : null));
    });
    if (exists) return res.status(409).json({ message: 'Username ou email déjà utilisé' });

    const hashed = bcrypt.hashSync(password, 8);
    const insertRes = await new Promise((resolve, reject) => {
      db.query('INSERT INTO users (username, password, email, role, created_at, confirmed) VALUES (?, ?, ?, ?, NOW(), 0)', [username, hashed, email, 'watchman'], (e, r) => e ? reject(e) : resolve(r));
    });
    const userId = insertRes.insertId;

    // Ensure email_confirmations table exists
    await new Promise((resolve, reject) => {
      const q = `CREATE TABLE IF NOT EXISTS email_confirmations (
        token VARCHAR(128) PRIMARY KEY,
        user_id INT NOT NULL,
        expires_at DATETIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
      db.query(q, [], (e) => e ? reject(e) : resolve());
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24h
    await new Promise((resolve, reject) => db.query('INSERT INTO email_confirmations (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expiresAt], (e) => e ? reject(e) : resolve()));

    // Send confirmation email
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const link = `${appUrl}/api/auth/confirm?token=${token}`;

    try {
      await mailer.sendMail({
        to: email,
        subject: 'Confirmez votre adresse email',
        text: `Cliquez sur ce lien pour confirmer votre compte: ${link}`,
        html: `<p>Cliquez sur ce lien pour confirmer votre compte: <a href="${link}">${link}</a></p>`
      });
    } catch (mailErr) {
      console.error('Erreur envoi email:', mailErr);
      // Don't fail registration because of mail error; log and continue
    }

    return res.status(201).json({ id: userId, username, email });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

// Confirm email
async function confirm(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token requis' });

  try {
    const row = await new Promise((resolve, reject) => db.query('SELECT user_id, expires_at FROM email_confirmations WHERE token = ? LIMIT 1', [token], (e, r) => e ? reject(e) : resolve(r && r.length ? r[0] : null)));
    if (!row) return res.status(400).json({ message: 'Token invalide ou expiré' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ message: 'Token expiré' });

    await new Promise((resolve, reject) => db.query('UPDATE users SET confirmed = 1 WHERE id = ?', [row.user_id], (e) => e ? reject(e) : resolve()));
    await new Promise((resolve, reject) => db.query('DELETE FROM email_confirmations WHERE token = ?', [token], (e) => e ? reject(e) : resolve()));

    return res.status(200).json({ message: 'Email confirmé. Vous pouvez vous connecter.' });
  } catch (err) {
    console.error('Confirm error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { login, register, confirm };
