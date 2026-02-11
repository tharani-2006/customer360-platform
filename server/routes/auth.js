const express = require('express');
const { body, validationResult } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = express.Router();

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post(
  '/login',
  loginValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  },
  login
);

router.get('/me', auth, getMe);

module.exports = router;
