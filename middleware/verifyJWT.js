require('dotenv').config();
const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');

function verifyJWT(req, res, next) {
  // Get auth header value
  // FORMAT OF TOKEN
  // Authorization: Bearer <accss_token>
  const bearerHeader = req.headers['authorization'];

  // Check if bearer is undefined
  if (typeof bearerHeader !== undefined) {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearToken = bearer[1];

    const { JWT_SECRET_KEY } = process.env;

    jwt.verify(bearToken, JWT_SECRET_KEY, function (err) {
      if (!err) {
        next();
      } else {
        throw new CustomError(403, err.name);
      }
    });
  }
}

module.exports = { verifyJWT };
