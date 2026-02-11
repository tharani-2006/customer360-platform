const { ROLES } = require('../config/constants');

const requireRole = (...allowedRoles) => {
  const set = new Set(allowedRoles.length ? allowedRoles : Object.values(ROLES));
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!set.has(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { requireRole };
