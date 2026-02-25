const crypto = require('crypto');
const db = require('../config/db');

const ALGO = 'aes-256-gcm';
const KEY = process.env.RGPD_SECRET || 'default_rgpd_secret_32bytes!!';

function getKey() {
    return crypto.createHash('sha256').update(String(KEY)).digest();
}

module.exports = {
    encryptData: function(plain) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
        const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([iv, tag, encrypted]).toString('base64');
    },

    decryptData: function(enc) {
        try {
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 12);
            const tag = data.slice(12, 28);
            const encrypted = data.slice(28);
            const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
            decipher.setAuthTag(tag);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return decrypted.toString('utf8');
        } catch (e) {
            return null;
        }
    },

    anonymizeData: async function(userId) {
        // Anonymiser l'utilisateur: remplacer username/email/password
        const anonUsername = `anon_${userId}`;
        const anonEmail = `anon_${userId}@example.invalid`;
        try {
            await new Promise((res, rej) => db.query('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?', [anonUsername, anonEmail, '', userId], (e, r) => e ? rej(e) : res(r)));
            // supprimer données associées: reports, chat_messages, schedules
            await new Promise((res, rej) => db.query('DELETE FROM reports WHERE user_id = ?', [userId], (e, r) => e ? rej(e) : res(r)));
            await new Promise((res, rej) => db.query('DELETE FROM chat_messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId], (e, r) => e ? rej(e) : res(r)));
            await new Promise((res, rej) => db.query('DELETE FROM schedules WHERE user_id = ?', [userId], (e, r) => e ? rej(e) : res(r)));
            // Log anonymization action
            await new Promise((res, rej) => db.query('CREATE TABLE IF NOT EXISTS data_access_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, action VARCHAR(255), details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)', [], (e) => e ? rej(e) : res()));
            await new Promise((res, rej) => db.query('INSERT INTO data_access_logs (user_id, action, details) VALUES (?, ?, ?)', [userId, 'anonymize', 'User anonymized per RGPD request'], (e) => e ? rej(e) : res()));
            return true;
        } catch (err) {
            console.error('Anonymize error:', err);
            throw err;
        }
    },

    logDataAccess: async function(userId, action, details) {
        try {
            await new Promise((res, rej) => db.query('CREATE TABLE IF NOT EXISTS data_access_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, action VARCHAR(255), details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)', [], (e) => e ? rej(e) : res()));
            await new Promise((res, rej) => db.query('INSERT INTO data_access_logs (user_id, action, details) VALUES (?, ?, ?)', [userId, action, details || null], (e) => e ? rej(e) : res()));
        } catch (err) {
            console.error('logDataAccess error:', err);
        }
    }
};