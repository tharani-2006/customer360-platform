const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const { ROLES } = require('../config/constants');
const { CUSTOMER_TAGS, ACCOUNT_STATUS } = require('../models/Customer');

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

router.get('/', readOnly, listCustomers);

router.get(
  '/:id',
  readOnly,
  [param('id').isMongoId().withMessage('Invalid customer ID')],
  handleValidation,
  getCustomer
);

router.post(
  '/',
  adminOnly,
  [
    body('organizationName').trim().notEmpty().withMessage('Organization name is required'),
    body('contactDetails.email').optional().isEmail().withMessage('Invalid email'),
    body('contactDetails.phone').optional().trim(),
    body('contactDetails.address').optional().trim(),
    body('region').optional().trim(),
    body('industry').optional().trim(),
    body('accountStatus')
      .optional()
      .isIn(Object.values(ACCOUNT_STATUS))
      .withMessage('Invalid account status'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags.length > 0 && !tags.every((t) => Object.values(CUSTOMER_TAGS).includes(t))) {
          throw new Error('Invalid tag');
        }
        return true;
      }),
  ],
  handleValidation,
  createCustomer
);

router.patch(
  '/:id',
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid customer ID'),
    body('organizationName').optional().trim().notEmpty().withMessage('Organization name cannot be empty'),
    body('contactDetails.email').optional().isEmail().withMessage('Invalid email'),
    body('contactDetails.phone').optional().trim(),
    body('contactDetails.address').optional().trim(),
    body('region').optional().trim(),
    body('industry').optional().trim(),
    body('accountStatus')
      .optional()
      .isIn(Object.values(ACCOUNT_STATUS))
      .withMessage('Invalid account status'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags) => {
        if (tags.length > 0 && !tags.every((t) => Object.values(CUSTOMER_TAGS).includes(t))) {
          throw new Error('Invalid tag');
        }
        return true;
      }),
  ],
  handleValidation,
  updateCustomer
);

router.delete(
  '/:id',
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid customer ID')],
  handleValidation,
  deleteCustomer
);

module.exports = router;
