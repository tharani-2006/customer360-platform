const ROLES = Object.freeze({
  ADMIN: 'admin',
  SUPPORT_ENGINEER: 'support_engineer',
  VIEWER: 'viewer',
});

const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

module.exports = { ROLES, JWT_EXPIRY };


