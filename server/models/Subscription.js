const mongoose = require('mongoose');

const SUBSCRIPTION_STATUS = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
  PENDING: 'pending',
});

const subscriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
      index: true,
    },
    usageMetrics: {
      storageUsed: { type: Number, default: 0 },
      apiCalls: { type: Number, default: 0 },
      seatsUsed: { type: Number, default: 0 },
      custom: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ customer: 1, startDate: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = { Subscription, SUBSCRIPTION_STATUS };
