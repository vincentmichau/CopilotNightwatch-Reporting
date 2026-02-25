const express = require('express');
const router = express.Router();
const reportController = require('../controllers/index');
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth');

// Route pour créer un rapport
router.post('/reports', authMiddleware.verifyToken, reportController.createReport);

// Route pour obtenir tous les rapports
router.get('/reports', authMiddleware.verifyToken, reportController.getAllReports);

// Route pour obtenir un rapport par ID
router.get('/reports/:id', authMiddleware.verifyToken, reportController.getReportById);

// Route pour mettre à jour un rapport
router.put('/reports/:id', authMiddleware.verifyToken, reportController.updateReport);

// Route pour supprimer un rapport
router.delete('/reports/:id', authMiddleware.verifyToken, reportController.deleteReport);

// Route d'administration pour créer des users.
// La création initiale est autorisée si la table `users` est vide (handled in controller).
router.post('/admin/users', adminController.createUser);

// Auth: login
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/confirm', authController.confirm);

// Autres routes peuvent être ajoutées ici

module.exports = router;