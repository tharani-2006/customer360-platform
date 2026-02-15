import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../api/ticketsApi';
import { customersApi } from '../api/customersApi';
import { usersApi } from '../api/usersApi';
import { ROLES } from '../components/ProtectedRoute';

const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const TICKET_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: TICKET_PRIORITY.LOW, label: 'Low' },
  { value: TICKET_PRIORITY.MEDIUM, label: 'Medium' },
  { value: TICKET_PRIORITY.HIGH, label: 'High' },
  { value: TICKET_PRIORITY.CRITICAL, label: 'Critical' },
];

const severityOptions = [
  { value: TICKET_SEVERITY.LOW, label: 'Low' },
  { value: TICKET_SEVERITY.MEDIUM, label: 'Medium' },
  { value: TICKET_SEVERITY.HIGH, label: 'High' },
  { value: TICKET_SEVERITY.CRITICAL, label: 'Critical' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: TICKET_STATUS.OPEN, label: 'Open' },
  { value: TICKET_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TICKET_STATUS.RESOLVED, label: 'Resolved' },
  { value: TICKET_STATUS.CLOSED, label: 'Closed' },
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function TicketManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canEdit = user.role === ROLES.ADMIN || user.role === ROLES.SUPPORT_ENGINEER;

  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    customerId: '',
    status: '',
    priority: '',
    assignedEngineerId: '',
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    title: '',
    description: '',
    priority: TICKET_PRIORITY.MEDIUM,
    severity: TICKET_SEVERITY.MEDIUM,
    assignedEngineer: '',
    resolutionNotes: '',
  });
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [currentTicketData, setCurrentTicketData] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedEngineerId) params.assignedEngineerId = filters.assignedEngineerId;

      const { data } = await ticketsApi.list(params);
      setTickets(data.data.tickets);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await customersApi.list();
      setCustomers(data.data.customers);
    } catch {
      setCustomers([]);
    }
  };

  const fetchEngineers = async () => {
    try {
      const { data } = await usersApi.list();
      const supportEngineers = data.data.users.filter(
        (u) => u.role === ROLES.ADMIN || u.role === ROLES.SUPPORT_ENGINEER
      );
      setEngineers(supportEngineers);
    } catch {
      setEngineers([]);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
    fetchEngineers();
  }, []);

  const resetForm = () => {
    setFormData({
      customer: '',
      title: '',
      description: '',
      priority: TICKET_PRIORITY.MEDIUM,
      severity: TICKET_SEVERITY.MEDIUM,
      assignedEngineer: '',
      resolutionNotes: '',
    });
    setCommentText('');
    setShowCreate(false);
    setEditingId(null);
    setViewingId(null);
    setCurrentTicketData(null);
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await ticketsApi.create(formData);
      resetForm();
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ticket) => {
    setFormData({
      customer: ticket.customer?._id ?? ticket.customer,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      severity: ticket.severity,
      assignedEngineer: (ticket.assignedEngineer?._id ?? ticket.assignedEngineer) || '',
      resolutionNotes: ticket.resolutionNotes || '',
    });
    setEditingId(ticket.id);
    setShowCreate(false);
    setViewingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await ticketsApi.update(editingId, formData);
      resetForm();
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id) => {
    try {
      const { data } = await ticketsApi.get(id);
      const ticket = data.data.ticket;
      setFormData({
        customer: ticket.customer?._id ?? ticket.customer,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        severity: ticket.severity,
        assignedEngineer: (ticket.assignedEngineer?._id ?? ticket.assignedEngineer) || '',
        resolutionNotes: ticket.resolutionNotes || '',
      });
      setCurrentTicketData(ticket);
      setViewingId(id);
      setEditingId(null);
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    setError('');
    try {
      await ticketsApi.addComment(viewingId || editingId, commentText);
      setCommentText('');
      if (viewingId) {
        const { data } = await ticketsApi.get(viewingId);
        setCurrentTicketData(data.data.ticket);
        fetchTickets();
      } else {
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketsApi.update(ticketId, { status: newStatus });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await ticketsApi.delete(id);
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TICKET_PRIORITY.CRITICAL:
        return 'bg-red-100 text-red-700';
      case TICKET_PRIORITY.HIGH:
        return 'bg-orange-100 text-orange-700';
      case TICKET_PRIORITY.MEDIUM:
        return 'bg-yellow-100 text-yellow-700';
      case TICKET_PRIORITY.LOW:
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TICKET_STATUS.OPEN:
        return 'bg-blue-100 text-blue-700';
      case TICKET_STATUS.IN_PROGRESS:
        return 'bg-purple-100 text-purple-700';
      case TICKET_STATUS.RESOLVED:
        return 'bg-green-100 text-green-700';
      case TICKET_STATUS.CLOSED:
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const currentTicket = viewingId
    ? currentTicketData
    : editingId
      ? tickets.find((t) => t.id === editingId)
      : null;

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="bg-surface-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-ink-muted hover:text-ink font-medium">
            ← Dashboard
          </button>
          <span className="font-semibold text-ink">Ticket Management</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="badge-yellow">
            {user.role === ROLES.ADMIN ? 'Admin' : user.role === ROLES.SUPPORT_ENGINEER ? 'Support' : 'Viewer'}
          </span>
          <span className="text-ink-muted text-sm">{user.email}</span>
          <button onClick={handleLogout} className="text-ink-muted hover:text-ink text-sm font-medium">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">Support Tickets</h1>
            <p className="text-ink-muted text-sm">Manage customer support issues and incidents</p>
          </div>
          {canEdit && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create Ticket
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-surface-white rounded-card shadow-card">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Customer</label>
              <select
                value={filters.customerId}
                onChange={(e) => setFilters((f) => ({ ...f, customerId: e.target.value }))}
                className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.organizationName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Assigned Engineer</label>
              <select
                value={filters.assignedEngineerId}
                onChange={(e) => setFilters((f) => ({ ...f, assignedEngineerId: e.target.value }))}
                className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All engineers</option>
                {engineers.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName || e.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Create/Edit/View Form */}
        {(showCreate || editingId || viewingId) && (
          <div className="mb-6 p-6 bg-surface-white rounded-card shadow-card border border-gray-100">
            <h2 className="text-lg font-semibold text-ink mb-4">
              {viewingId ? 'View Ticket' : editingId ? 'Edit Ticket' : 'Create New Ticket'}
            </h2>
            <form
              onSubmit={viewingId ? (e) => e.preventDefault() : editingId ? handleUpdate : handleCreate}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Customer *</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData((d) => ({ ...d, customer: e.target.value }))}
                    required
                    disabled={!!editingId || !!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.organizationName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Assigned Engineer</label>
                  <select
                    value={formData.assignedEngineer}
                    onChange={(e) => setFormData((d) => ({ ...d, assignedEngineer: e.target.value }))}
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {engineers.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName || e.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
                    required
                    disabled={!!viewingId}
                    placeholder="Brief issue description"
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData((d) => ({ ...d, priority: e.target.value }))}
                      disabled={!!viewingId}
                      className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {priorityOptions.slice(1).map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData((d) => ({ ...d, severity: e.target.value }))}
                      disabled={!!viewingId}
                      className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {severityOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                    required
                    disabled={!!viewingId}
                    rows={4}
                    placeholder="Detailed description of the issue..."
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                {editingId && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink mb-1">Resolution Notes</label>
                    <textarea
                      value={formData.resolutionNotes}
                      onChange={(e) => setFormData((d) => ({ ...d, resolutionNotes: e.target.value }))}
                      rows={3}
                      placeholder="Add resolution notes when resolving the ticket..."
                      className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {(viewingId || editingId) && currentTicket && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-ink mb-3">Comments</h3>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {currentTicket.comments && currentTicket.comments.length > 0 ? (
                      currentTicket.comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-surface-gray rounded-button">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-ink">{comment.authorName}</span>
                            <span className="text-xs text-ink-muted">{formatDateTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-ink-muted whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-ink-muted">No comments yet.</p>
                    )}
                  </div>
                  {canEdit && (
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={addingComment || !commentText.trim()}
                        className="btn-primary px-4 py-2 disabled:opacity-60"
                      >
                        {addingComment ? 'Adding...' : 'Add'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {!viewingId && (
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : editingId ? 'Update Ticket' : 'Create Ticket'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-button border border-gray-200 text-ink-muted hover:text-ink"
                >
                  {viewingId ? 'Close' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-ink-muted">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-ink-muted">
              No tickets found. {canEdit && 'Create one above.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-surface-gray/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Title</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Priority</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Severity</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Assigned</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Created</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-ink">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-surface-gray/30">
                      <td className="py-4 px-6 text-ink-muted text-xs font-mono">{t.id.slice(-8)}</td>
                      <td className="py-4 px-6 text-ink font-medium text-sm">{t.customerName || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <div className="text-ink font-medium text-sm truncate">{t.title}</div>
                          <div className="text-ink-muted text-xs truncate">{t.description?.substring(0, 50)}...</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 rounded-badge text-xs font-medium ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 rounded-badge text-xs font-medium ${getPriorityColor(t.severity)}`}>
                          {t.severity}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          disabled={!canEdit}
                          className={`text-xs px-2 py-1 rounded-button border border-gray-200 bg-surface-white text-ink disabled:opacity-60 disabled:cursor-not-allowed ${getStatusColor(t.status)}`}
                        >
                          {statusOptions.slice(1).map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">
                        {t.assignedEngineerName || 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{formatDate(t.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(t.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            View
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleEdit(t)}
                                className="text-sm text-ink-muted hover:text-ink hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="text-sm text-red-600 hover:text-red-700 hover:underline"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
