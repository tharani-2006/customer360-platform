const mongoose = require('mongoose');

const TICKET_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const TICKET_SEVERITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const TICKET_STATUS = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
});

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(TICKET_PRIORITY),
      default: TICKET_PRIORITY.MEDIUM,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(TICKET_SEVERITY),
      default: TICKET_SEVERITY.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
      index: true,
    },
    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    comments: [commentSchema],
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ customer: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: -1 });
ticketSchema.index({ assignedEngineer: 1, status: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = { Ticket, TICKET_PRIORITY, TICKET_SEVERITY, TICKET_STATUS };
