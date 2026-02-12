const { Subscription, SUBSCRIPTION_STATUS } = require('../models/Subscription');
const { Customer } = require('../models/Customer');

const toSubscriptionResponse = (s, customerPopulated) => ({
  id: s._id,
  customer: s.customer?._id ?? s.customer,
  customerName: customerPopulated?.organizationName ?? undefined,
  planName: s.planName,
  startDate: s.startDate,
  endDate: s.endDate,
  subscriptionStatus: s.subscriptionStatus,
  usageMetrics: s.usageMetrics,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

const listSubscriptions = async (req, res, next) => {
  try {
    const { customerId, status } = req.query;
    const query = {};

    if (customerId) query.customer = customerId;
    if (status) query.subscriptionStatus = status;

    const raw = await Subscription.find(query)
      .populate('customer', 'organizationName')
      .sort({ startDate: -1 })
      .lean();

    const subscriptions = raw.map((s) =>
      toSubscriptionResponse(s, s.customer)
    );

    res.status(200).json({
      success: true,
      data: { subscriptions },
    });
  } catch (err) {
    next(err);
  }
};

const getSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findById(id).populate('customer', 'organizationName').lean();

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    res.status(200).json({
      success: true,
      data: { subscription: toSubscriptionResponse(sub, sub.customer) },
    });
  } catch (err) {
    next(err);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const { customer, planName, startDate, endDate, subscriptionStatus, usageMetrics } = req.body;

    const exists = await Customer.findById(customer);
    if (!exists) {
      return res.status(400).json({ success: false, message: 'Customer not found.' });
    }

    const subscription = await Subscription.create({
      customer,
      planName: planName?.trim(),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      subscriptionStatus: subscriptionStatus || SUBSCRIPTION_STATUS.ACTIVE,
      usageMetrics: usageMetrics || {},
    });

    const created = await Subscription.findById(subscription._id)
      .populate('customer', 'organizationName')
      .lean();

    res.status(201).json({
      success: true,
      data: { subscription: toSubscriptionResponse(created, created.customer) },
    });
  } catch (err) {
    next(err);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planName, startDate, endDate, subscriptionStatus, usageMetrics } = req.body;

    const update = {};
    if (planName !== undefined) update.planName = planName?.trim();
    if (startDate !== undefined) update.startDate = new Date(startDate);
    if (endDate !== undefined) update.endDate = new Date(endDate);
    if (subscriptionStatus !== undefined) update.subscriptionStatus = subscriptionStatus;
    if (usageMetrics !== undefined) {
      if (usageMetrics.storageUsed !== undefined)
        update['usageMetrics.storageUsed'] = usageMetrics.storageUsed;
      if (usageMetrics.apiCalls !== undefined)
        update['usageMetrics.apiCalls'] = usageMetrics.apiCalls;
      if (usageMetrics.seatsUsed !== undefined)
        update['usageMetrics.seatsUsed'] = usageMetrics.seatsUsed;
      if (usageMetrics.custom !== undefined)
        update['usageMetrics.custom'] = usageMetrics.custom;
    }

    const updated = await Subscription.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate('customer', 'organizationName')
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    res.status(200).json({
      success: true,
      data: { subscription: toSubscriptionResponse(updated, updated.customer) },
    });
  } catch (err) {
    next(err);
  }
};

const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Subscription.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
