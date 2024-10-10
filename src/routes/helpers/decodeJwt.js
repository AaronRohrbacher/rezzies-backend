// routes/middleware/decodeJwt.js
const jwt = require('jsonwebtoken');

const decodeJwt = (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  try {
    const decoded = jwt.decode(token); // Decode the token
    req.user = decoded; // Attach the decoded payload to the request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error('JWT Decode Error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = decodeJwt;
