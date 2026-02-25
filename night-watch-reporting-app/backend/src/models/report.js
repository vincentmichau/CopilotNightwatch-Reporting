const mysql = require('mysql');
const db = require('../config/db');

// Définition du modèle de données pour les rapports
const Report = {
    create: (data, callback) => {
        const query = 'INSERT INTO reports (title, content, created_at) VALUES (?, ?, ?)';
        db.query(query, [data.title, data.content, new Date()], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.insertId);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM reports ORDER BY created_at DESC';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM reports WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    update: (id, data, callback) => {
        const query = 'UPDATE reports SET title = ?, content = ? WHERE id = ?';
        db.query(query, [data.title, data.content, id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.affectedRows);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM reports WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.affectedRows);
        });
    }
};

module.exports = Report;