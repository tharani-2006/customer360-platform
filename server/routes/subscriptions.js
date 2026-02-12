const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const { ROLES } = require('../config/constants');
const { SUBSCRIPTION_STATUS } = require('../models/Subscription');

const router = express.Router();
const readOnly = [auth, requireRole(ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER)];
const adminOnly = [auth, requireRole(ROLES.ADMIN)];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.get('/', readOnly, listSubscriptions);

router.get(
  '/:id',
  readOnly,
  [param('id').isMongoId().withMessage('Invalid subscription ID')],
  handleValidation,
  getSubscription
);

router.post(
  '/',
  adminOnly,
  [
    body('customer').isMongoId().withMessage('Valid customer ID is required'),
    body('planName').trim().notEmpty().withMessage('Plan name is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('subscriptionStatus')
      .optional()
      .isIn(Object.values(SUBSCRIPTION_STATUS))
      .withMessage('Invalid subscription status'),
    body('usageMetrics.storageUsed').optional().isNumeric(),
    body('usageMetrics.apiCalls').optional().isNumeric(),
    body('usageMetrics.seatsUsed').optional().isNumeric(),
  ],
  handleValidation,
  createSubscription
);

router.patch(
  '/:id',
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid subscription ID'),
    body('planName').optional().trim().notEmpty().withMessage('Plan name cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('subscriptionStatus')
      .optional()
      .isIn(Object.values(SUBSCRIPTION_STATUS))
      .withMessage('Invalid subscription status'),
    body('usageMetrics.storageUsed').optional().isNumeric(),
    body('usageMetrics.apiCalls').optional().isNumeric(),
    body('usageMetrics.seatsUsed').optional().isNumeric(),
  ],
  handleValidation,
  updateSubscription
);

router.delete(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid subscription ID')],
  handleValidation,
  deleteSubscription
);

module.exports = router;
