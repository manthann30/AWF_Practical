const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization") || req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({
            status: 401,
            message: "Access denied. No authorization header provided"
        });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            status: 401,
            message: "Access denied. Malformed token. Format must be Bearer <token>"
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 401,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
