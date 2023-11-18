const jwt = require('jsonwebtoken');

function getJWT(req, res, next) {
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
    req.token = bearToken;
    // next middlewares
    next();
  } else {
    // Send Forbidden
    res.sendStatus(403);
  }
}

module.exports = getJWT;
