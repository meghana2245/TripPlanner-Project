const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/jwtConfig");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, jwtSecret, { expiresIn: jwtExpiresIn });
};

module.exports = generateToken;
