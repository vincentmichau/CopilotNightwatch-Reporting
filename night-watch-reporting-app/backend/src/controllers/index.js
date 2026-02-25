const db = require('../config/db');

module.exports = {
  createReport: (req, res) => {
    // Le schéma existant utilise `user_id` et `report_text`.
    const userId = req.user && req.user.id ? req.user.id : null;
    const { report_text } = req.body;
    if (!userId || !report_text) {
      return res.status(400).json({ message: 'Champs manquants : report_text requis et utilisateur authentifié.' });
    }

    const sql = 'INSERT INTO reports (user_id, report_text, created_at) VALUES (?, ?, NOW())';
    db.query(sql, [userId, report_text], (err, result) => {
      if (err) {
        console.error('DB error (createReport):', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la création du rapport.' });
      }
      const insertedId = result && result.insertId ? result.insertId : null;
      return res.status(201).json({ id: insertedId, user_id: userId, report_text });
    });
  },

  getAllReports: (req, res) => {
    // Joindre la table `users` pour inclure le `username` associé
    const sql = `SELECT r.id, r.user_id, u.username, u.email, u.role, r.report_text, r.created_at
           FROM reports r
           LEFT JOIN users u ON r.user_id = u.id
           ORDER BY r.created_at DESC`;
    db.query(sql, [], (err, rows) => {
      if (err) {
        console.error('DB error (getAllReports):', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération des rapports.' });
      }
      return res.status(200).json(rows);
    });
  },

  getReportById: (req, res) => {
    const id = req.params.id;
    const sql = `SELECT r.id, r.user_id, u.username, u.email, u.role, r.report_text, r.created_at
           FROM reports r
           LEFT JOIN users u ON r.user_id = u.id
           WHERE r.id = ? LIMIT 1`;
    db.query(sql, [id], (err, rows) => {
      if (err) {
        console.error('DB error (getReportById):', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération du rapport.' });
      }
      const row = rows && rows.length ? rows[0] : null;
      if (!row) return res.status(404).json({ message: 'Rapport non trouvé.' });
      return res.status(200).json(row);
    });
  },

  updateReport: (req, res) => {
    const id = req.params.id;
    const { report_text } = req.body;
    if (!report_text) {
      return res.status(400).json({ message: 'Champs manquants : report_text requis.' });
    }
    // Vérifier propriétaire du rapport
    db.query('SELECT user_id FROM reports WHERE id = ? LIMIT 1', [id], (err, rows) => {
      if (err) {
        console.error('DB error (updateReport - fetch):', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du rapport.' });
      }
      const row = rows && rows.length ? rows[0] : null;
      if (!row) return res.status(404).json({ message: 'Rapport non trouvé.' });

      const ownerId = row.user_id;
      const requesterId = req.user && req.user.id ? req.user.id : null;

      const continueUpdate = () => {
        const sql = 'UPDATE reports SET report_text = ?, updated_at = NOW() WHERE id = ?';
        db.query(sql, [report_text, id], (err2, result) => {
          if (err2) {
            console.error('DB error (updateReport):', err2);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du rapport.' });
          }
          if (result && result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rapport non trouvé.' });
          }
          return res.status(200).json({ id: Number(id), report_text });
        });
      };

      if (requesterId === ownerId) return continueUpdate();

      // Si pas propriétaire, vérifier rôle admin
      db.query('SELECT role FROM users WHERE id = ? LIMIT 1', [requesterId], (e, r) => {
        if (e) {
          console.error('DB error (updateReport - role):', e);
          return res.status(500).json({ message: 'Erreur serveur.' });
        }
        const role = r && r.length ? r[0].role : null;
        if (role !== 'admin') return res.status(403).json({ message: 'Accès refusé. Droits insuffisants.' });
        return continueUpdate();
      });
    });
  },

  deleteReport: (req, res) => {
    const id = req.params.id;
    // Vérifier existence et propriétaire
    db.query('SELECT user_id FROM reports WHERE id = ? LIMIT 1', [id], (err, rows) => {
      if (err) {
        console.error('DB error (deleteReport - fetch):', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la suppression du rapport.' });
      }
      const row = rows && rows.length ? rows[0] : null;
      if (!row) return res.status(404).json({ message: 'Rapport non trouvé.' });

      const ownerId = row.user_id;
      const requesterId = req.user && req.user.id ? req.user.id : null;

      const doDelete = () => {
        const sql = 'DELETE FROM reports WHERE id = ?';
        db.query(sql, [id], (err2, result) => {
          if (err2) {
            console.error('DB error (deleteReport):', err2);
            return res.status(500).json({ message: 'Erreur serveur lors de la suppression du rapport.' });
          }
          if (result && result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rapport non trouvé.' });
          }
          return res.status(200).json({ message: 'Rapport supprimé.' });
        });
      };

      if (requesterId === ownerId) return doDelete();

      db.query('SELECT role FROM users WHERE id = ? LIMIT 1', [requesterId], (e, r) => {
        if (e) {
          console.error('DB error (deleteReport - role):', e);
          return res.status(500).json({ message: 'Erreur serveur.' });
        }
        const role = r && r.length ? r[0].role : null;
        if (role !== 'admin') return res.status(403).json({ message: 'Accès refusé. Droits insuffisants.' });
        return doDelete();
      });
    });
  },
};