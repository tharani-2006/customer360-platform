const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { listUsers, createUser, updateUser } = require('../controllers/userController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const { ROLES } = require('../config/constants');

const router = express.Router();
const adminOnly = [auth, requireRole(ROLES.ADMIN)];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.get('/', adminOnly, listUsers);

router.post(
  '/',
  adminOnly,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').optional().trim(),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage('Invalid role'),
  ],
  handleValidation,
  createUser
);

router.patch(
  '/:id',
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('fullName').optional().trim(),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  handleValidation,
  updateUser
);

module.exports = router;
