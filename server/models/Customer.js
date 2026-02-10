const mongoose = require('mongoose');

const CUSTOMER_TAGS = Object.freeze({
  ENTERPRISE: 'enterprise',
  TRIAL: 'trial',
  FREE: 'free',
});

const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
});

const customerSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contactDetails: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    region: {
      type: String,
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
    tags: {
      type: [String],
      enum: Object.values(CUSTOMER_TAGS),
      default: [],
    },
  },
  { timestamps: true }
);

customerSchema.index({ organizationName: 'text' });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = { Customer, CUSTOMER_TAGS, ACCOUNT_STATUS };
