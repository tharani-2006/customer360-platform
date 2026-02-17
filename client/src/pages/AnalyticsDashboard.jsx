import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/analyticsApi';
import { ROLES } from '../components/ProtectedRoute';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const roleLabels = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SUPPORT_ENGINEER]: 'Support Engineer',
  [ROLES.VIEWER]: 'Viewer',
};

function MetricCard({ title, value, subtitle, variant = 'default' }) {
  const variants = {
    default: 'bg-surface-white border-gray-200',
    success: 'bg-green-50/80 border-green-200',
    warning: 'bg-amber-50/80 border-amber-200',
    danger: 'bg-red-50/80 border-red-200',
  };
  return (
    <div className={`rounded-card p-5 border shadow-card ${variants[variant] || variants.default}`}>
      <p className="text-sm font-medium text-ink-muted mb-1">{title}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
      {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasFullView = user.role === ROLES.ADMIN || user.role === ROLES.VIEWER;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: res } = await analyticsApi.getDashboard();
        setData(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-gray flex items-center justify-center">
        <div className="text-ink-muted font-medium">Loading analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-gray flex items-center justify-center">
        <div className="text-red-600">{error || 'No data available.'}</div>
      </div>
    );
  }

  const subscriptionPieData = [
    { name: 'Active', value: data.subscriptions.active, color: '#26B24D' },
    { name: 'Trial', value: data.subscriptions.trial, color: '#FFE600' },
    { name: 'Expired', value: data.subscriptions.expired, color: '#6b7280' },
    { name: 'Cancelled', value: data.subscriptions.cancelled, color: '#ef4444' },
    { name: 'Pending', value: data.subscriptions.pending, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const ticketPieData = [
    { name: 'Open', value: data.tickets.open, color: '#3b82f6' },
    { name: 'In Progress', value: data.tickets.inProgress, color: '#8b5cf6' },
    { name: 'Resolved', value: data.tickets.resolved, color: '#22c55e' },
    { name: 'Closed', value: data.tickets.closed, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="bg-surface-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-ink-muted hover:text-ink font-medium">
            ← Dashboard
          </button>
          <span className="font-semibold text-ink">Customer Health & Analytics</span>
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

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">Customer Health & Analytics</h1>
          <p className="text-ink-muted text-sm">
            Insights into customer status, subscriptions, and support trends
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Health Score - Admin & Viewer only */}
        {hasFullView && data.healthScore !== undefined && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-card bg-accent-dark text-white p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-2">Overall Customer Health Score</h2>
              <div className="flex items-end gap-4">
                <div className="text-5xl font-bold text-primary">{data.healthScore}</div>
                <span className="text-white/80 text-sm mb-1">/ 100</span>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${data.healthScore}%` }}
                />
              </div>
              {data.healthBreakdown && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <span>Subscriptions: {data.healthBreakdown.subscription}%</span>
                  <span>Tickets: {data.healthBreakdown.tickets}%</span>
                  <span>Customers: {data.healthBreakdown.customers}%</span>
                </div>
              )}
            </div>
            {data.sla && (
              <div className="rounded-card bg-surface-white border border-gray-200 p-6 shadow-card">
                <h2 className="text-lg font-semibold text-ink mb-4">SLA Performance</h2>
                <MetricCard
                  title="SLA Breached"
                  value={data.sla.breached}
                  subtitle={`of ${data.sla.totalAssessed} assessed`}
                  variant={data.sla.breached > 0 ? 'danger' : 'default'}
                />
                <div className="mt-4">
                  <p className="text-sm text-ink-muted">Avg Resolution Time</p>
                  <p className="text-xl font-bold text-ink">{data.sla.avgResolutionHours}h</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Core metrics - all roles */}
        <div>
          <h2 className="text-lg font-semibold text-ink mb-4">Core Metrics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Customers" value={data.customers.total} />
            <MetricCard
              title="Active Customers"
              value={data.customers.active}
              subtitle={`${data.customers.total > 0 ? Math.round((data.customers.active / data.customers.total) * 100) : 0}% of total`}
              variant="success"
            />
            <MetricCard
              title="Active Subscriptions"
              value={data.subscriptions.active}
              subtitle={`${data.subscriptions.total > 0 ? Math.round((data.subscriptions.active / data.subscriptions.total) * 100) : 0}% of ${data.subscriptions.total}`}
            />
            <MetricCard
              title="Expired Subscriptions"
              value={data.subscriptions.expired}
              variant={data.subscriptions.expired > 0 ? 'warning' : 'default'}
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink mb-4">Ticket Status</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Open" value={data.tickets.open} variant="warning" />
            <MetricCard title="In Progress" value={data.tickets.inProgress} />
            <MetricCard title="Resolved" value={data.tickets.resolved} variant="success" />
            <MetricCard title="Closed" value={data.tickets.closed} />
          </div>
          <div className="mt-2 flex gap-4 text-sm text-ink-muted">
            <span>Open/In Progress: {data.tickets.openOrInProgress}</span>
            <span>Resolved/Closed: {data.tickets.resolvedOrClosed}</span>
          </div>
        </div>

        {/* Charts - Admin & Viewer only */}
        {hasFullView && data.resolutionTrends && data.resolutionTrends.length > 0 && (
          <div className="rounded-card bg-surface-white border border-gray-200 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink mb-4">Resolution Time Trends (Avg Hours)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.resolutionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v} hours`, 'Avg Resolution']} />
                  <Bar dataKey="avgHours" fill="#26B24D" radius={[4, 4, 0, 0]} name="Avg Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Pie charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-card bg-surface-white border border-gray-200 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink mb-4">Subscriptions by Status</h2>
            {subscriptionPieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {subscriptionPieData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-ink-muted text-sm py-8">No subscription data yet.</p>
            )}
          </div>
          <div className="rounded-card bg-surface-white border border-gray-200 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink mb-4">Tickets by Status</h2>
            {ticketPieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ticketPieData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-ink-muted text-sm py-8">No ticket data yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
