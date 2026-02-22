const express = require('express');
const { getAuditLogs } = require('../controllers/auditController');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Only Admins can view audit logs
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/', getAuditLogs);

module.exports = router;
