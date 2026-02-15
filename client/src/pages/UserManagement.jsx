import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/usersApi';
import { ROLES } from '../components/ProtectedRoute';

const roleOptions = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.SUPPORT_ENGINEER, label: 'Support Engineer' },
  { value: ROLES.VIEWER, label: 'Viewer' },
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UserManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: ROLES.VIEWER,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await usersApi.list();
      setUsers(data.data.users);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    try {
      await usersApi.create(createData);
      setShowCreate(false);
      setCreateData({ fullName: '', email: '', password: '', role: ROLES.VIEWER });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleActive = async (u) => {
    setUpdatingId(u.id);
    setError('');
    try {
      await usersApi.update(u.id, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (u, newRole) => {
    setUpdatingId(u.id);
    setError('');
    try {
      await usersApi.update(u.id, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="bg-surface-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-ink-muted hover:text-ink font-medium"
          >
            ← Admin Panel
          </button>
          <span className="font-semibold text-ink">User Management</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="badge-yellow">Admin</span>
          <span className="text-ink-muted text-sm">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-ink-muted hover:text-ink text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">Users</h1>
            <p className="text-ink-muted text-sm">Create, assign roles, and manage user status</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create User
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {showCreate && (
          <div className="mb-6 p-6 bg-surface-white rounded-card shadow-card border border-gray-100">
            <h2 className="text-lg font-semibold text-ink mb-4">Create New User</h2>
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input
                  type="text"
                  value={createData.fullName}
                  onChange={(e) => setCreateData((d) => ({ ...d, fullName: e.target.value }))}
                  placeholder="Full name"
                  className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email *</label>
                <input
                  type="email"
                  value={createData.email}
                  onChange={(e) => setCreateData((d) => ({ ...d, email: e.target.value }))}
                  placeholder="user@company.com"
                  required
                  className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Password *</label>
                <input
                  type="password"
                  value={createData.password}
                  onChange={(e) => setCreateData((d) => ({ ...d, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Role</label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData((d) => ({ ...d, role: e.target.value }))}
                  className="w-full px-4 py-2 rounded-button border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createLoading} className="btn-primary">
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setError('');
                  }}
                  className="px-4 py-2 rounded-button border border-gray-200 text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-ink-muted">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-ink-muted">No users yet. Create one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-surface-gray/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Created</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-ink">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id || u._id} className="border-b border-gray-100 hover:bg-surface-gray/30">
                      <td className="py-4 px-6 text-ink font-medium">
                        {u.fullName || '-'}
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">{u.email}</td>
                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          disabled={updatingId === (u.id || u._id)}
                          className="text-sm px-2 py-1 rounded-button border border-gray-200 bg-surface-white text-ink disabled:opacity-60"
                        >
                          {roleOptions.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2 py-1 rounded-badge text-xs font-medium ${
                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-ink-muted text-sm">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {user.id === (u.id || u._id) && u.isActive ? (
                          <span className="text-ink-muted text-xs">(you)</span>
                        ) : (
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={updatingId === (u.id || u._id)}
                            className={`text-sm font-medium px-3 py-1 rounded-button ${
                              u.isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-green-600 hover:bg-green-50'
                            } disabled:opacity-60`}
                          >
                            {updatingId === (u.id || u._id)
                              ? '...'
                              : u.isActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
                        )}
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
