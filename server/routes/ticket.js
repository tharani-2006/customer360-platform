const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  addComment,
  deleteTicket,
} = require('../controllers/ticketController');
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const { ROLES } = require('../config/constants');
const { TICKET_PRIORITY, TICKET_SEVERITY, TICKET_STATUS } = require('../models/Ticket');

const router = express.Router();
const readOnly = [auth, requireRole(ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER)];
const fullAccess = [auth, requireRole(ROLES.ADMIN, ROLES.SUPPORT_ENGINEER)];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.get('/', readOnly, listTickets);

router.get(
  '/:id',
  readOnly,
  [param('id').isMongoId().withMessage('Invalid ticket ID')],
  handleValidation,
  getTicket
);

router.post(
  '/',
  fullAccess,
  [
    body('customer').isMongoId().withMessage('Valid customer ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('priority')
      .optional()
      .isIn(Object.values(TICKET_PRIORITY))
      .withMessage('Invalid priority'),
    body('severity')
      .optional()
      .isIn(Object.values(TICKET_SEVERITY))
      .withMessage('Invalid severity'),
    body('assignedEngineer').optional().isMongoId().withMessage('Invalid engineer ID'),
  ],
  handleValidation,
  createTicket
);

router.patch(
  '/:id',
  fullAccess,
  [
    param('id').isMongoId().withMessage('Invalid ticket ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('priority')
      .optional()
      .isIn(Object.values(TICKET_PRIORITY))
      .withMessage('Invalid priority'),
    body('severity')
      .optional()
      .isIn(Object.values(TICKET_SEVERITY))
      .withMessage('Invalid severity'),
    body('status')
      .optional()
      .isIn(Object.values(TICKET_STATUS))
      .withMessage('Invalid status'),
    body('assignedEngineer').optional().isMongoId().withMessage('Invalid engineer ID'),
    body('resolutionNotes').optional().trim(),
  ],
  handleValidation,
  updateTicket
);

router.post(
  '/:id/comments',
  fullAccess,
  [
    param('id').isMongoId().withMessage('Invalid ticket ID'),
    body('text').trim().notEmpty().withMessage('Comment text is required'),
  ],
  handleValidation,
  addComment
);

router.delete(
  '/:id',
  fullAccess,
  [param('id').isMongoId().withMessage('Invalid ticket ID')],
  handleValidation,
  deleteTicket
);

module.exports = router;
