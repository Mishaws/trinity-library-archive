const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access Denied. Please log in.' });

  try {
    const tokenClean = token.replace('Bearer ', '');
    const verified = jwt.verify(tokenClean, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token tidak valid.' });
  }
};