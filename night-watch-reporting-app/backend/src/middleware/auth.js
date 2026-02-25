const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Modèle utilisateur minimal

// Fonction principale de vérification du token
const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        req.user = verified;
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Token invalide.' });
    }
};

// Middleware pour vérifier les droits admin
const adminMiddleware = async (req, res, next) => {
    const user = await User.findById(req.user && req.user.id);

    if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Accès refusé. Droits insuffisants.' });
    }

    next();
};

// Middleware optionnel : si un token est fourni, on le vérifie et on set `req.user`.
// Si aucun token n'est fourni, on laisse passer (utile pour routes publiques qui
// acceptent la création initiale d'un admin).
const optionalAuth = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return next();
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        req.user = verified;
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Token invalide.' });
    }
};

// Supporter les deux usages :
// - `app.use(authMiddleware)` (fonction middleware)
// - `authMiddleware.verifyToken` dans les routes existantes
verifyToken.verifyToken = verifyToken;
verifyToken.adminMiddleware = adminMiddleware;

// Expose l'optionalAuth
verifyToken.optionalAuth = optionalAuth;

module.exports = verifyToken;