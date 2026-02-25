const mysql = require('mysql');

// Si `USE_MOCK_DB=true`, on exporte une implémentation minimale en mémoire
if (process.env.USE_MOCK_DB === 'true') {
    const reports = [];
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

            // INSERT INTO reports (title, content, created_at) VALUES (?, ?, ?)
            if (sql && sql.toLowerCase().includes('insert into reports')) {
                const title = params[0];
                const content = params[1];
                const created_at = params[2] || new Date();
                const row = { id: nextId++, title, content, created_at };
                reports.push(row);
                return cb(null, { insertId: row.id });
            }

            // SELECT * FROM reports ORDER BY created_at DESC
            if (sql && sql.toLowerCase().includes('select * from reports order by')) {
                // retourner copie triée
                const copy = [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                return cb(null, copy);
            }

            // SELECT * FROM reports WHERE id = ?
            if (sql && sql.toLowerCase().includes('select * from reports where id')) {
                const id = params[0];
                const row = reports.find(r => Number(r.id) === Number(id)) || null;
                return cb(null, [row]);
            }

            // UPDATE reports SET title = ?, content = ? WHERE id = ?
            if (sql && sql.toLowerCase().includes('update reports set')) {
                const title = params[0];
                const content = params[1];
                const id = params[2];
                const idx = reports.findIndex(r => Number(r.id) === Number(id));
                if (idx === -1) return cb(null, { affectedRows: 0 });
                reports[idx].title = title;
                reports[idx].content = content;
                return cb(null, { affectedRows: 1 });
            }

            // DELETE FROM reports WHERE id = ?
            if (sql && sql.toLowerCase().includes('delete from reports where id')) {
                const id = params[0];
                const idx = reports.findIndex(r => Number(r.id) === Number(id));
                if (idx === -1) return cb(null, { affectedRows: 0 });
                reports.splice(idx, 1);
                return cb(null, { affectedRows: 1 });
            }

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