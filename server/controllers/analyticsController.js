const { Customer } = require('../models/Customer');
const { Subscription, SUBSCRIPTION_STATUS } = require('../models/Subscription');
const { Ticket, TICKET_STATUS, TICKET_PRIORITY } = require('../models/Ticket');
const { ROLES } = require('../config/constants');

// SLA targets in hours by priority
const SLA_HOURS = {
  [TICKET_PRIORITY.CRITICAL]: 4,
  [TICKET_PRIORITY.HIGH]: 24,
  [TICKET_PRIORITY.MEDIUM]: 72,
  [TICKET_PRIORITY.LOW]: 168,
};

const getDashboard = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const isSupportEngineer = userRole === ROLES.SUPPORT_ENGINEER;
    const includeSensitive = !isSupportEngineer; // Admin & Viewer get full view

    // 1. Customer counts
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ accountStatus: 'active' });
    const inactiveCustomers = await Customer.countDocuments({ accountStatus: 'inactive' });
    const suspendedCustomers = await Customer.countDocuments({ accountStatus: 'suspended' });

    // 2. Subscription counts
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    });
    const expiredSubscriptions = await Subscription.countDocuments({
      subscriptionStatus: SUBSCRIPTION_STATUS.EXPIRED,
    });
    const cancelledSubscriptions = await Subscription.countDocuments({
      subscriptionStatus: SUBSCRIPTION_STATUS.CANCELLED,
    });
    const trialSubscriptions = await Subscription.countDocuments({
      subscriptionStatus: SUBSCRIPTION_STATUS.TRIAL,
    });
    const pendingSubscriptions = await Subscription.countDocuments({
      subscriptionStatus: SUBSCRIPTION_STATUS.PENDING,
    });

    // 3. Ticket counts
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: TICKET_STATUS.OPEN });
    const inProgressTickets = await Ticket.countDocuments({ status: TICKET_STATUS.IN_PROGRESS });
    const resolvedTickets = await Ticket.countDocuments({ status: TICKET_STATUS.RESOLVED });
    const closedTickets = await Ticket.countDocuments({ status: TICKET_STATUS.CLOSED });
    const openOrInProgress = openTickets + inProgressTickets;
    const resolvedOrClosed = resolvedTickets + closedTickets;

    const base = {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        suspended: suspendedCustomers,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        cancelled: cancelledSubscriptions,
        trial: trialSubscriptions,
        pending: pendingSubscriptions,
      },
      tickets: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        openOrInProgress,
        resolvedOrClosed,
      },
    };

    if (!includeSensitive) {
      return res.status(200).json({ success: true, data: base });
    }

    // 4. SLA breach indicators (Admin & Viewer only)
    const resolvedTicketsList = await Ticket.find({
      status: { $in: [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED] },
      resolvedAt: { $exists: true, $ne: null },
    })
      .select('priority createdAt resolvedAt')
      .lean();

    let slaBreached = 0;
    let slaMet = 0;
    let totalResolutionHours = 0;
    let resolvedWithTime = 0;

    for (const t of resolvedTicketsList) {
      const resolvedAt = new Date(t.resolvedAt);
      const createdAt = new Date(t.createdAt);
      const hours = (resolvedAt - createdAt) / (1000 * 60 * 60);
      const target = SLA_HOURS[t.priority] ?? SLA_HOURS[TICKET_PRIORITY.MEDIUM];

      totalResolutionHours += hours;
      resolvedWithTime += 1;

      if (hours > target) {
        slaBreached += 1;
      } else {
        slaMet += 1;
      }
    }

    const avgResolutionHours = resolvedWithTime > 0 ? totalResolutionHours / resolvedWithTime : 0;

    // 5. Resolution time trends - last 12 weeks (Admin & Viewer only)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const resolvedInPeriod = await Ticket.find({
      status: { $in: [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED] },
      resolvedAt: { $gte: twelveWeeksAgo, $exists: true, $ne: null },
    })
      .select('priority createdAt resolvedAt')
      .lean();

    const weekMap = {};
    for (const t of resolvedInPeriod) {
      const resolvedAt = new Date(t.resolvedAt);
      const createdAt = new Date(t.createdAt);
      const hours = (resolvedAt - createdAt) / (1000 * 60 * 60);
      const weekStart = new Date(resolvedAt);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toISOString().slice(0, 10);

      if (!weekMap[key]) {
        weekMap[key] = { total: 0, count: 0 };
      }
      weekMap[key].total += hours;
      weekMap[key].count += 1;
    }

    const resolutionTrends = Object.entries(weekMap)
      .map(([week, v]) => ({ week, avgHours: Math.round((v.total / v.count) * 10) / 10, count: v.count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // 6. Overall customer health score 0-100 (Admin & Viewer only)
    let subscriptionHealth = 100;
    if (totalSubscriptions > 0) {
      const healthySubs = activeSubscriptions + trialSubscriptions;
      subscriptionHealth = Math.round((healthySubs / totalSubscriptions) * 100);
    }

    let ticketHealth = 100;
    if (totalTickets > 0) {
      const resolvedPct = (resolvedOrClosed / totalTickets) * 100;
      const slaPenalty = resolvedWithTime > 0 ? (slaBreached / resolvedWithTime) * 30 : 0;
      ticketHealth = Math.max(0, Math.round(resolvedPct - slaPenalty));
    }

    let customerHealth = 100;
    if (totalCustomers > 0) {
      customerHealth = Math.round((activeCustomers / totalCustomers) * 100);
    }

    const healthScore = Math.round(
      subscriptionHealth * 0.4 + ticketHealth * 0.4 + customerHealth * 0.2
    );

    const extended = {
      ...base,
      sla: {
        breached: slaBreached,
        met: slaMet,
        totalAssessed: resolvedWithTime,
        avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      },
      resolutionTrends,
      healthScore: Math.min(100, Math.max(0, healthScore)),
      healthBreakdown: {
        subscription: subscriptionHealth,
        tickets: ticketHealth,
        customers: customerHealth,
      },
    };

    res.status(200).json({ success: true, data: extended });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
