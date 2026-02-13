const express = require('express');
const { getDashboard } = require('../controllers/analyticsController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const { ROLES } = require('../config/constants');

const router = express.Router();
const allowedRoles = [auth, requireRole(ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER)];

router.get('/dashboard', allowedRoles, getDashboard);

module.exports = router;
