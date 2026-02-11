const { Ticket, TICKET_STATUS } = require('../models/Ticket');
const { Customer } = require('../models/Customer');
const User = require('../models/User');

const toTicketResponse = (t, customerPopulated, assignedEngineerPopulated) => ({
  id: t._id,
  customer: t.customer?._id ?? t.customer,
  customerName: customerPopulated?.organizationName ?? undefined,
  title: t.title,
  description: t.description,
  priority: t.priority,
  severity: t.severity,
  status: t.status,
  assignedEngineer: t.assignedEngineer?._id ?? t.assignedEngineer,
  assignedEngineerName: assignedEngineerPopulated
    ? `${assignedEngineerPopulated.fullName || ''} (${assignedEngineerPopulated.email})`.trim()
    : undefined,
  comments: t.comments?.map((c) => ({
    id: c._id,
    author: c.author?._id ?? c.author,
    authorName: c.author?.fullName || c.author?.email || 'Unknown',
    text: c.text,
    createdAt: c.createdAt,
  })) || [],
  resolutionNotes: t.resolutionNotes,
  resolvedAt: t.resolvedAt,
  closedAt: t.closedAt,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

const listTickets = async (req, res, next) => {
  try {
    const { customerId, status, priority, assignedEngineerId } = req.query;
    const query = {};

    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedEngineerId) query.assignedEngineer = assignedEngineerId;

    const raw = await Ticket.find(query)
      .populate('customer', 'organizationName')
      .populate('assignedEngineer', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    const tickets = raw.map((t) =>
      toTicketResponse(t, t.customer, t.assignedEngineer)
    );

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (err) {
    next(err);
  }
};

const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id)
      .populate('customer', 'organizationName')
      .populate('assignedEngineer', 'fullName email')
      .populate('comments.author', 'fullName email')
      .lean();

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    res.status(200).json({
      success: true,
      data: { ticket: toTicketResponse(ticket, ticket.customer, ticket.assignedEngineer) },
    });
  } catch (err) {
    next(err);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { customer, title, description, priority, severity, assignedEngineer } = req.body;

    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(400).json({ success: false, message: 'Customer not found.' });
    }

    if (assignedEngineer) {
      const engineerExists = await User.findById(assignedEngineer);
      if (!engineerExists) {
        return res.status(400).json({ success: false, message: 'Assigned engineer not found.' });
      }
    }

    const ticket = await Ticket.create({
      customer,
      title: title?.trim(),
      description: description?.trim(),
      priority,
      severity,
      assignedEngineer: assignedEngineer || null,
      status: TICKET_STATUS.OPEN,
    });

    const created = await Ticket.findById(ticket._id)
      .populate('customer', 'organizationName')
      .populate('assignedEngineer', 'fullName email')
      .lean();

    res.status(201).json({
      success: true,
      data: { ticket: toTicketResponse(created, created.customer, created.assignedEngineer) },
    });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, severity, status, assignedEngineer, resolutionNotes } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const update = {};
    if (title !== undefined) update.title = title?.trim();
    if (description !== undefined) update.description = description?.trim();
    if (priority !== undefined) update.priority = priority;
    if (severity !== undefined) update.severity = severity;
    if (status !== undefined) {
      update.status = status;
      if (status === TICKET_STATUS.RESOLVED && !ticket.resolvedAt) {
        update.resolvedAt = new Date();
      }
      if (status === TICKET_STATUS.CLOSED && !ticket.closedAt) {
        update.closedAt = new Date();
      }
    }
    if (assignedEngineer !== undefined) {
      if (assignedEngineer) {
        const engineerExists = await User.findById(assignedEngineer);
        if (!engineerExists) {
          return res.status(400).json({ success: false, message: 'Assigned engineer not found.' });
        }
        update.assignedEngineer = assignedEngineer;
      } else {
        update.assignedEngineer = null;
      }
    }
    if (resolutionNotes !== undefined) update.resolutionNotes = resolutionNotes?.trim();

    const updated = await Ticket.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate('customer', 'organizationName')
      .populate('assignedEngineer', 'fullName email')
      .lean();

    res.status(200).json({
      success: true,
      data: { ticket: toTicketResponse(updated, updated.customer, updated.assignedEngineer) },
    });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    ticket.comments.push({
      author: req.user._id,
      text: text?.trim(),
    });

    await ticket.save();

    const updated = await Ticket.findById(id)
      .populate('customer', 'organizationName')
      .populate('assignedEngineer', 'fullName email')
      .populate('comments.author', 'fullName email')
      .lean();

    res.status(200).json({
      success: true,
      data: { ticket: toTicketResponse(updated, updated.customer, updated.assignedEngineer) },
    });
  } catch (err) {
    next(err);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Ticket.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  addComment,
  deleteTicket,
};
