const db = require('../config/db');
const rgpd = require('../utils/rgpd');

async function getConsent(req, res) {
  if (!req.user || !req.user.id) return res.status(401).json({ message: 'Authentification requise.' });
  const uid = req.user.id;
  try {
    await new Promise((resn, rej) => db.query('CREATE TABLE IF NOT EXISTS consents (user_id INT PRIMARY KEY, consent TINYINT(1), given_at DATETIME)', [], (e) => e ? rej(e) : resn()));
    const row = await new Promise((resn, rej) => db.query('SELECT consent FROM consents WHERE user_id = ? LIMIT 1', [uid], (e, r) => e ? rej(e) : resn(r && r[0] ? r[0] : null)));
    return res.status(200).json({ consent: row ? Boolean(row.consent) : null });
  } catch (err) {
    console.error('getConsent error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function setConsent(req, res) {
  if (!req.user || !req.user.id) return res.status(401).json({ message: 'Authentification requise.' });
  const uid = req.user.id;
  const { consent } = req.body;
  if (typeof consent !== 'boolean') return res.status(400).json({ message: 'consent must be boolean' });
  try {
    await new Promise((resn, rej) => db.query('CREATE TABLE IF NOT EXISTS consents (user_id INT PRIMARY KEY, consent TINYINT(1), given_at DATETIME)', [], (e) => e ? rej(e) : resn()));
    await new Promise((resn, rej) => db.query('REPLACE INTO consents (user_id, consent, given_at) VALUES (?, ?, NOW())', [uid, consent ? 1 : 0], (e) => e ? rej(e) : resn()));
    await rgpd.logDataAccess(uid, 'consent_set', `consent=${consent}`);
    return res.status(200).json({ consent });
  } catch (err) {
    console.error('setConsent error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

async function forgetMe(req, res) {
  if (!req.user || !req.user.id) return res.status(401).json({ message: 'Authentification requise.' });
  const uid = req.user.id;
  try {
    await rgpd.anonymizeData(uid);
    await rgpd.logDataAccess(uid, 'forget_me', 'User requested data erasure/anonymization');
    return res.status(200).json({ message: 'Vos données ont été anonymisées.' });
  } catch (err) {
    console.error('forgetMe error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = { getConsent, setConsent, forgetMe };
