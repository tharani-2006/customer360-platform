import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customersApi } from '../api/customersApi';
import { ROLES } from '../components/ProtectedRoute';
import ShellLayout from '../components/ShellLayout';

const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

const CUSTOMER_TAGS = {
  ENTERPRISE: 'enterprise',
  TRIAL: 'trial',
  FREE: 'free',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
  { value: ACCOUNT_STATUS.INACTIVE, label: 'Inactive' },
  { value: ACCOUNT_STATUS.SUSPENDED, label: 'Suspended' },
];

const tagOptions = [
  { value: CUSTOMER_TAGS.ENTERPRISE, label: 'Enterprise' },
  { value: CUSTOMER_TAGS.TRIAL, label: 'Trial' },
  { value: CUSTOMER_TAGS.FREE, label: 'Free' },
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomerManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === ROLES.ADMIN;

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    industry: '',
    accountStatus: '',
    tags: [],
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    contactDetails: { email: '', phone: '', address: '' },
    region: '',
    industry: '',
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    tags: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filters.region) params.region = filters.region;
      if (filters.industry) params.industry = filters.industry;
      if (filters.accountStatus) params.accountStatus = filters.accountStatus;
      if (filters.tags.length > 0) params.tags = filters.tags;

      const { data } = await customersApi.list(params);
      setCustomers(data.data.customers);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters]);

  const resetForm = () => {
    setFormData({
      organizationName: '',
      contactDetails: { email: '', phone: '', address: '' },
      region: '',
      industry: '',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      tags: [],
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
      await customersApi.create(formData);
      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      organizationName: customer.organizationName,
      contactDetails: customer.contactDetails || { email: '', phone: '', address: '' },
      region: customer.region || '',
      industry: customer.industry || '',
      accountStatus: customer.accountStatus || ACCOUNT_STATUS.ACTIVE,
      tags: customer.tags || [],
    });
    setEditingId(customer.id);
    setShowCreate(false);
    setViewingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await customersApi.update(editingId, formData);
      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customersApi.delete(id);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleView = async (id) => {
    try {
      const { data } = await customersApi.get(id);
      setFormData({
        organizationName: data.data.customer.organizationName,
        contactDetails: data.data.customer.contactDetails || { email: '', phone: '', address: '' },
        region: data.data.customer.region || '',
        industry: data.data.customer.industry || '',
        accountStatus: data.data.customer.accountStatus || ACCOUNT_STATUS.ACTIVE,
        tags: data.data.customer.tags || [],
      });
      setViewingId(id);
      setEditingId(null);
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer');
    }
  };

  const toggleTag = (tag) => {
    setFormData((d) => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ShellLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">Customers</h1>
            <p className="text-ink-muted text-sm">Manage customer organizations and profiles</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create Customer
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 p-4 bg-surface-white rounded-card shadow-card">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <input
              type="text"
              placeholder="Region"
              value={filters.region}
              onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
              className="px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Industry"
              value={filters.industry}
              onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value }))}
              className="px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <select
              value={filters.accountStatus}
              onChange={(e) => setFilters((f) => ({ ...f, accountStatus: e.target.value }))}
              className="px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Create/Edit Form */}
        {(showCreate || editingId || viewingId) && (
          <div className="mb-6 p-6 bg-surface-white rounded-card shadow-card border border-gray-100">
            <h2 className="text-lg font-semibold text-ink mb-4">
              {viewingId ? 'View Customer' : editingId ? 'Edit Customer' : 'Create New Customer'}
            </h2>
            <form onSubmit={viewingId ? (e) => e.preventDefault() : editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Organization Name *</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData((d) => ({ ...d, organizationName: e.target.value }))}
                    required
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactDetails.email}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        contactDetails: { ...d.contactDetails, email: e.target.value },
                      }))
                    }
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.contactDetails.phone}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        contactDetails: { ...d.contactDetails, phone: e.target.value },
                      }))
                    }
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.contactDetails.address}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        contactDetails: { ...d.contactDetails, address: e.target.value },
                      }))
                    }
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData((d) => ({ ...d, region: e.target.value }))}
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData((d) => ({ ...d, industry: e.target.value }))}
                    disabled={!!viewingId}
                    className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink disabled:bg-gray-50 disabled:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Account Status</label>
                  <select
                    value={formData.accountStatus}
                    onChange={(e) => setFormData((d) => ({ ...d, accountStatus: e.target.value }))}
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
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <label key={tag.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tags.includes(tag.value)}
                          onChange={() => toggleTag(tag.value)}
                          disabled={!!viewingId}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-ink">{tag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {!viewingId && (
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : editingId ? 'Update Customer' : 'Create Customer'}
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

        {/* Customer List */}
        <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-ink-muted">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-ink-muted">No customers found. {isAdmin && 'Create one above.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-surface-gray/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Organization</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Region</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Industry</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Tags</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-ink">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-surface-gray/30">
                      <td className="py-4 px-6 text-ink font-medium">{c.organizationName}</td>
                      <td className="py-4 px-6 text-ink-muted text-sm">
                        {c.contactDetails?.email || '-'}
                        {c.contactDetails?.phone && <div className="text-xs">{c.contactDetails.phone}</div>}
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{c.region || '-'}</td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{c.industry || '-'}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2 py-1 rounded-badge text-xs font-medium ${
                            c.accountStatus === ACCOUNT_STATUS.ACTIVE
                              ? 'bg-green-100 text-green-700'
                              : c.accountStatus === ACCOUNT_STATUS.SUSPENDED
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {c.accountStatus || ACCOUNT_STATUS.ACTIVE}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {c.tags?.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-badge text-xs bg-primary/10 text-primary">
                              {tag}
                            </span>
                          ))}
                          {(!c.tags || c.tags.length === 0) && <span className="text-ink-muted text-xs">-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(c.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            View
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEdit(c)}
                                className="text-sm text-ink-muted hover:text-ink hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
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
      </div>
    </ShellLayout>
  );
}
