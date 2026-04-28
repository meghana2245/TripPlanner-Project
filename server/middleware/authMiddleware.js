const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwtConfig");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not authorized, token missing");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    const authError = new Error("Not authorized, token invalid");
    authError.statusCode = 401;
    throw authError;
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    const error = new Error("Admin access required");
    error.statusCode = 403;
    throw error;
  }
  next();
};

module.exports = { protect, adminMiddleware };
