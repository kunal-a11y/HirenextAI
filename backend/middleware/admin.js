const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'demo@hirenextai.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const [rows] = await pool.query(
      'SELECT id, email, firstName, lastName, role FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];
    user.name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.firstName || user.lastName || '');
    const email = (user.email || '').toLowerCase();
    const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(email);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'admin',
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Admin middleware error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
