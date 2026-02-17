import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { customersApi } from '../api/customersApi';
import { ROLES } from '../components/ProtectedRoute';

const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
  PENDING: 'pending',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: SUBSCRIPTION_STATUS.ACTIVE, label: 'Active' },
  { value: SUBSCRIPTION_STATUS.EXPIRED, label: 'Expired' },
  { value: SUBSCRIPTION_STATUS.CANCELLED, label: 'Cancelled' },
  { value: SUBSCRIPTION_STATUS.TRIAL, label: 'Trial' },
  { value: SUBSCRIPTION_STATUS.PENDING, label: 'Pending' },
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

export default function SubscriptionManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === ROLES.ADMIN;

  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    planName: '',
    startDate: '',
    endDate: '',
    subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
    usageMetrics: { storageUsed: 0, apiCalls: 0, seatsUsed: 0 },
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCustomer) params.customerId = filterCustomer;
      if (filterStatus) params.status = filterStatus;
      const { data } = await subscriptionsApi.list(params);
      setSubscriptions(data.data.subscriptions);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscriptions');
      setSubscriptions([]);
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

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCustomer, filterStatus]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setFormData({
      customer: '',
      planName: '',
      startDate: '',
      endDate: '',
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      usageMetrics: { storageUsed: 0, apiCalls: 0, seatsUsed: 0 },
    });
    setShowCreate(false);
    setEditingId(null);
    setViewingId(null);
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };
      await subscriptionsApi.create(payload);
      resetForm();
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sub) => {
    setFormData({
      customer: sub.customer?._id ?? sub.customer,
      planName: sub.planName,
      startDate: toDateInputValue(sub.startDate),
      endDate: toDateInputValue(sub.endDate),
      subscriptionStatus: sub.subscriptionStatus || SUBSCRIPTION_STATUS.ACTIVE,
      usageMetrics: {
        storageUsed: sub.usageMetrics?.storageUsed ?? 0,
        apiCalls: sub.usageMetrics?.apiCalls ?? 0,
        seatsUsed: sub.usageMetrics?.seatsUsed ?? 0,
      },
    });
    setEditingId(sub.id);
    setShowCreate(false);
    setViewingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        planName: formData.planName,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        subscriptionStatus: formData.subscriptionStatus,
        usageMetrics: formData.usageMetrics,
      };
      await subscriptionsApi.update(editingId, payload);
      resetForm();
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id) => {
    try {
      const { data } = await subscriptionsApi.get(id);
      const sub = data.data.subscription;
      setFormData({
        customer: sub.customer?._id ?? sub.customer,
        planName: sub.planName,
        startDate: toDateInputValue(sub.startDate),
        endDate: toDateInputValue(sub.endDate),
        subscriptionStatus: sub.subscriptionStatus || SUBSCRIPTION_STATUS.ACTIVE,
        usageMetrics: {
          storageUsed: sub.usageMetrics?.storageUsed ?? 0,
          apiCalls: sub.usageMetrics?.apiCalls ?? 0,
          seatsUsed: sub.usageMetrics?.seatsUsed ?? 0,
        },
      });
      setViewingId(id);
      setEditingId(null);
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subscription');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await subscriptionsApi.delete(id);
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subscription');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const usageSummary = (u) => {
    if (!u) return '-';
    const parts = [];
    if (u.storageUsed != null) parts.push(`Storage: ${u.storageUsed}`);
    if (u.apiCalls != null) parts.push(`API: ${u.apiCalls}`);
    if (u.seatsUsed != null) parts.push(`Seats: ${u.seatsUsed}`);
    return parts.length ? parts.join(' · ') : '-';
  };

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="bg-surface-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-ink-muted hover:text-ink font-medium">
            ← Dashboard
          </button>
          <span className="font-semibold text-ink">Subscription Management</span>
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
            <h1 className="text-2xl font-bold text-ink mb-1">Subscriptions</h1>
            <p className="text-ink-muted text-sm">Track plans, dates, status and usage</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Assign Subscription
            </button>
          )}
        </div>

        <div className="mb-6 p-4 bg-surface-white rounded-card shadow-card">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Customer</label>
              <select
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {(showCreate || editingId || viewingId) && (
          <div className="mb-6 p-6 bg-surface-white rounded-card shadow-card border border-gray-100">
            <h2 className="text-lg font-semibold text-ink mb-4">
              {viewingId ? 'View Subscription' : editingId ? 'Update Subscription' : 'Assign Subscription'}
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
                  <label className="block text-sm font-medium text-ink mb-1">Plan name *</label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData((d) => ({ ...d, planName: e.target.value }))}
                    required
                    disabled={!!viewingId}
                    placeholder="e.g. Pro Monthly"
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Start date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((d) => ({ ...d, startDate: e.target.value }))}
                    required
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">End date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((d) => ({ ...d, endDate: e.target.value }))}
                    required
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Status</label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) => setFormData((d) => ({ ...d, subscriptionStatus: e.target.value }))}
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {statusOptions.slice(1).map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Usage metrics</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">Storage used</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.usageMetrics.storageUsed ?? ''}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          usageMetrics: { ...d.usageMetrics, storageUsed: Number(e.target.value) || 0 },
                        }))
                      }
                      disabled={!!viewingId}
                      className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">API calls</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.usageMetrics.apiCalls ?? ''}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          usageMetrics: { ...d.usageMetrics, apiCalls: Number(e.target.value) || 0 },
                        }))
                      }
                      disabled={!!viewingId}
                      className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink-muted mb-1">Seats used</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.usageMetrics.seatsUsed ?? ''}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          usageMetrics: { ...d.usageMetrics, seatsUsed: Number(e.target.value) || 0 },
                        }))
                      }
                      disabled={!!viewingId}
                      className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {!viewingId && (
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : editingId ? 'Update Subscription' : 'Assign Subscription'}
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

        <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-ink-muted">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-12 text-center text-ink-muted">
              No subscriptions found. {isAdmin && 'Assign one above.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-surface-gray/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Plan</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Start</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">End</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Usage summary</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-ink">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-surface-gray/30">
                      <td className="py-4 px-6 text-ink font-medium">
                        {s.customerName || s.customer || '-'}
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{s.planName}</td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{formatDate(s.startDate)}</td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{formatDate(s.endDate)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2 py-1 rounded-badge text-xs font-medium ${
                            s.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE
                              ? 'bg-green-100 text-green-700'
                              : s.subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED
                                ? 'bg-gray-100 text-gray-600'
                                : s.subscriptionStatus === SUBSCRIPTION_STATUS.CANCELLED
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {s.subscriptionStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{usageSummary(s.usageMetrics)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleView(s.id)} className="text-sm text-primary hover:underline">
                            View
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(s)}
                                className="text-sm text-ink-muted hover:text-ink hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
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
