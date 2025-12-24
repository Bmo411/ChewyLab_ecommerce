const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const decoded = jwt.verify(token, 'secret_key'); // Use env var in production
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido o expirado." });
    }
};

module.exports = authMiddleware;
