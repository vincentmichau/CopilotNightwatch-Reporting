const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const db = require('../config/db');

// Create transporter supporting either SMTP auth (user/pass) or OAuth2.
function createTransporter() {
  const useOAuth = process.env.SMTP_OAUTH_CLIENT_ID && process.env.SMTP_OAUTH_CLIENT_SECRET && process.env.SMTP_OAUTH_REFRESH_TOKEN;
  if (useOAuth) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.SMTP_OAUTH_CLIENT_ID,
        clientSecret: process.env.SMTP_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.SMTP_OAUTH_REFRESH_TOKEN
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  });
}

const transporter = createTransporter();

// Ensure email_logs table exists when first used
let _logsEnsured = false;
async function ensureEmailLogs() {
  if (_logsEnsured) return;
  const q = `CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    to_address VARCHAR(255),
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(50),
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
  await new Promise((res, rej) => db.query(q, [], (e) => e ? rej(e) : res()));
  _logsEnsured = true;
}

async function sendMail(opts) {
  // opts: { to, subject, text, html }
  await ensureEmailLogs();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    const info = await transporter.sendMail({ from, ...opts });
    // log success
    const body = opts.html || opts.text || '';
    await new Promise((res, rej) => db.query('INSERT INTO email_logs (to_address, subject, body, status) VALUES (?, ?, ?, ?)', [opts.to, opts.subject, body, 'sent'], (e) => e ? rej(e) : res()));
    // call webhook if configured
    if (process.env.EMAIL_WEBHOOK_URL) {
      try {
        await fetch(process.env.EMAIL_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: opts.to, subject: opts.subject, info }) });
      } catch (whErr) {
        console.error('Webhook call failed:', whErr);
      }
    }
    return info;
  } catch (err) {
    const body = opts.html || opts.text || '';
    await new Promise((res, rej) => db.query('INSERT INTO email_logs (to_address, subject, body, status, error) VALUES (?, ?, ?, ?, ?)', [opts.to, opts.subject, body, 'error', err.message], (e) => e ? rej(e) : res()));
    // call webhook on error
    if (process.env.EMAIL_WEBHOOK_URL) {
      try {
        await fetch(process.env.EMAIL_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: opts.to, subject: opts.subject, error: err.message }) });
      } catch (whErr) {
        console.error('Webhook call failed:', whErr);
      }
    }
    throw err;
  }
}

module.exports = { sendMail };
