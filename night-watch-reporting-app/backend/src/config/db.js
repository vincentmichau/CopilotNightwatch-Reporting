const mysql = require('mysql');

// Si `USE_MOCK_DB=true`, on exporte une implémentation minimale en mémoire
if (process.env.USE_MOCK_DB === 'true') {
    const reports = [];
    const users = [];
    const emailConfirmations = [];
    let nextId = 1;

    const mockDb = {
        connect: (cb) => {
            console.log('Using mock DB (in-memory)');
            if (cb) cb(null);
        },

        query: (sql, params, cb) => {
            // Normaliser les arguments (params optionnel)
            if (typeof params === 'function') {
                cb = params;
                params = [];
            }

            const lower = sql ? sql.toLowerCase() : '';

            // Generic deletes without WHERE (truncate style)
            if (lower.startsWith('delete from reports') && !lower.includes('where')) {
                reports.length = 0;
                return cb(null, { affectedRows: 0 });
            }
            if (lower.startsWith('delete from users') && !lower.includes('where')) {
                users.length = 0;
                return cb(null, { affectedRows: 0 });
            }
            if (lower.startsWith('delete from email_confirmations') && !lower.includes('where')) {
                emailConfirmations.length = 0;
                return cb(null, { affectedRows: 0 });
            }

            // SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1
            if (lower.includes('select id from users where username') && lower.includes('or email')) {
                const username = params[0];
                const email = params[1];
                const user = users.find(u => u.username === username || u.email === email);
                return cb(null, user ? [{ id: user.id }] : []);
            }
            // SELECT id, username, password, email, role, ifnull(confirmed,0) ...
            if (lower.includes('select id, username, password') && lower.includes('from users') && lower.includes('username = ?')) {
                const username = params[0];
                const user = users.find(u => u.username === username);
                if (!user) return cb(null, []);
                // simulate IFNULL(confirmed,0)
                const confirmed = user.confirmed ? 1 : 0;
                return cb(null, [{ id: user.id, username: user.username, password: user.password, email: user.email, role: user.role, confirmed }]);
            }
            // CREATE TABLE IF NOT EXISTS email_confirmations ...
            if (lower.startsWith('create table if not exists email_confirmations')) {
                // no-op for mock
                return cb(null, {});
            }
            // INSERT INTO email_confirmations (token, user_id, expires_at) VALUES (?, ?, ?)
            if (lower.includes('insert into email_confirmations')) {
                const token = params[0];
                const user_id = params[1];
                const expires_at = params[2];
                emailConfirmations.push({ token, user_id, expires_at });
                return cb(null, {});
            }
            // SELECT token, user_id FROM email_confirmations LIMIT 1
            if (lower.includes('select token, user_id from email_confirmations')) {
                const row = emailConfirmations[0] || null;
                return cb(null, row ? [row] : []);
            }
            // SELECT user_id, expires_at FROM email_confirmations WHERE token = ? LIMIT 1
            if (lower.includes('select user_id, expires_at from email_confirmations where token')) {
                const token = params[0];
                const row = emailConfirmations.find(r => r.token === token) || null;
                return cb(null, row ? [row] : []);
            }
            // DELETE FROM email_confirmations WHERE token = ?
            if (lower.includes('delete from email_confirmations where token')) {
                const token = params[0];
                const idx = emailConfirmations.findIndex(r => r.token === token);
                if (idx === -1) return cb(null, { affectedRows: 0 });
                emailConfirmations.splice(idx, 1);
                return cb(null, { affectedRows: 1 });
            }

            // SELECT COUNT(*) AS c FROM users
            if (lower.includes('select count(*)') && lower.includes('from users')) {
                return cb(null, [{ c: users.length }]);
            }

            // CREATE TABLE IF NOT EXISTS consents
            if (lower.startsWith('create table if not exists consents')) {
                return cb(null, {});
            }
            // REPLACE INTO consents (user_id, consent, given_at) VALUES (?, ?, NOW())
            if (lower.includes('replace into consents') || lower.includes('insert into consents') ) {
                const user_id = params[0];
                const consent = params[1];
                // store in users array meta if needed via a simple objects map
                const existing = users.find(u => Number(u.id) === Number(user_id));
                if (existing) existing.consent = consent ? 1 : 0;
                return cb(null, {});
            }
            // SELECT consent FROM consents WHERE user_id = ? LIMIT 1
            if (lower.includes('select consent from consents where user_id')) {
                const user_id = params[0];
                const existing = users.find(u => Number(u.id) === Number(user_id));
                return cb(null, existing && typeof existing.consent !== 'undefined' ? [{ consent: existing.consent }] : []);
            }

            // SELECT role FROM users WHERE id = ? LIMIT 1
            if (lower.includes('select role from users where id')) {
                const id = params[0];
                const user = users.find(u => Number(u.id) === Number(id));
                return cb(null, user ? [{ role: user.role }] : []);
            }

            // INSERT INTO users
            if (lower.includes('insert into users')) {
                const username = params[0];
                const password = params[1];
                const email = params[2];
                const role = params[3];
                const id = nextId++;
                const newUser = { id, username, password, email, role, created_at: new Date(), confirmed: 1 };
                users.push(newUser);
                return cb(null, { insertId: id });
            }

            // UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?
            if (lower.includes('update users set username') && lower.includes('where id = ?')) {
                const username = params[0];
                const email = params[1];
                const password = params[2];
                const id = params[3];
                const user = users.find(u => Number(u.id) === Number(id));
                if (user) {
                    user.username = username;
                    user.email = email;
                    user.password = password;
                }
                return cb(null, { affectedRows: user ? 1 : 0 });
            }

            // DELETE FROM chat_messages WHERE sender_id = ? OR receiver_id = ?
            if (lower.includes('delete from chat_messages where sender_id') && lower.includes('or receiver_id')) {
                const sid = params[0];
                const rid = params[1];
                // no permanent store for chat messages in mock; just return success
                return cb(null, { affectedRows: 0 });
            }

            // DELETE FROM schedules WHERE user_id = ?
            if (lower.includes('delete from schedules where user_id')) {
                const uid = params[0];
                // no permanent store for schedules in mock; just return success
                return cb(null, { affectedRows: 0 });
            }

            // SELECT user_id FROM reports WHERE id = ? LIMIT 1
            if (lower.includes('select user_id from reports where id')) {
                const id = params[0];
                const report = reports.find(r => Number(r.id) === Number(id));
                return cb(null, report ? [{ user_id: report.user_id }] : []);
            }
            // UPDATE users SET confirmed = 1 WHERE id = ?
            if (lower.includes('update users set confirmed')) {
                const id = params[0];
                const user = users.find(u => Number(u.id) === Number(id));
                if (user) {
                    user.confirmed = 1;
                }
                return cb(null, { affectedRows: user ? 1 : 0 });
            }

            // REPORT JOINS
            if (lower.includes('from reports r') && lower.includes('left join users')) {
                // this covers both getAllReports and getReportById
                let result = reports.map(r => ({
                    id: r.id,
                    user_id: r.user_id,
                    username: (users.find(u => u.id === r.user_id) || {}).username || null,
                    email: (users.find(u => u.id === r.user_id) || {}).email || null,
                    role: (users.find(u => u.id === r.user_id) || {}).role || null,
                    report_text: r.report_text,
                    created_at: r.created_at
                }));
                if (lower.includes('where r.id = ?')) {
                    const id = params[0];
                    result = result.filter(r => Number(r.id) === Number(id));
                }
                // order by handled above by tests by default
                return cb(null, result);
            }

            // INSERT INTO reports (user_id, report_text, created_at)
            if (lower.includes('insert into reports')) {
                const user_id = params[0];
                const report_text = params[1];
                const created_at = params[2] || new Date();
                const row = { id: nextId++, user_id, report_text, created_at };
                reports.push(row);
                return cb(null, { insertId: row.id });
            }

            // UPDATE reports SET report_text = ?, updated_at = NOW() WHERE id = ?
            if (lower.includes('update reports set report_text')) {
                const text = params[0];
                const id = params[1];
                const idx = reports.findIndex(r => Number(r.id) === Number(id));
                if (idx === -1) return cb(null, { affectedRows: 0 });
                reports[idx].report_text = text;
                return cb(null, { affectedRows: 1 });
            }

            // DELETE FROM reports WHERE user_id = ?
            if (lower.includes('delete from reports where user_id')) {
                const uid = params[0];
                let removed = 0;
                for (let i = reports.length - 1; i >= 0; i--) {
                    if (Number(reports[i].user_id) === Number(uid)) {
                        reports.splice(i, 1);
                        removed++;
                    }
                }
                return cb(null, { affectedRows: removed });
            }

            // DELETE FROM reports WHERE id = ?
            if (lower.includes('delete from reports where id')) {
                const id = params[0];
                const idx = reports.findIndex(r => Number(r.id) === Number(id));
                if (idx === -1) return cb(null, { affectedRows: 0 });
                reports.splice(idx, 1);
                return cb(null, { affectedRows: 1 });
            }

            // CREATE TABLE IF NOT EXISTS data_access_logs
            if (lower.startsWith('create table if not exists data_access_logs')) {
                return cb(null, {});
            }
            // INSERT INTO data_access_logs (...) VALUES (?, ?, ?)
            if (lower.includes('insert into data_access_logs') || lower.includes('insert into data_access_logs (user_id')) {
                return cb(null, { insertId: nextId++ });
            }

            // For any other supported minimal queries we can add as needed

            // Requête non supportée
            return cb(new Error('Mock DB: requête non supportée: ' + sql));
        }
    };

    module.exports = mockDb;
} else {
    const db = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'your_username',
        password: process.env.DB_PASSWORD || 'your_password',
        database: process.env.DB_NAME || 'night_watch_reporting'
    });

    // `app.js` effectue la connexion via `db.connect(...)`.
    // Ici on n'appelle pas `db.connect` pour éviter les connexions dupliquées
    // qui provoquent l'erreur "Cannot enqueue Handshake after already enqueuing a Handshake.".
    module.exports = db;
}