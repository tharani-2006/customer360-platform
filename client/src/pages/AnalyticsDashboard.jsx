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
    default: 'bg-white border-slate-100 text-ink',
    success: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 text-green-900',
    warning: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 text-amber-900',
    danger: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200 text-red-900',
  };
  const valueColors = {
    default: 'text-accent-dark',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
  };

  return (
    <div className={`rounded-2xl p-6 border shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${variants[variant] || variants.default}`}>
      <p className="text-sm font-bold opacity-70 mb-2 uppercase tracking-wider">{title}</p>
      <p className={`text-4xl font-black tracking-tight ${valueColors[variant] || valueColors.default}`}>{value}</p>
      {subtitle && <p className="text-sm font-medium opacity-80 mt-3">{subtitle}</p>}
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

      <main className="max-w-7xl mx-auto p-6 pb-12 space-y-8">
        <div className="flex items-center justify-between bg-gradient-to-r from-accent-dark via-accent-dark-light to-primary-dark p-8 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 text-white">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider mb-3 border border-white/30 backdrop-blur-sm">INSIGHTS</span>
            <h1 className="text-3xl font-extrabold mb-1 tracking-tight text-white">Customer Health & Analytics</h1>
            <p className="text-white/80 font-medium">Deep insights into organizational metrics, support SLA, and overall platform health</p>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {error && (
          <div className="p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Health Score - Admin & Viewer only */}
        {hasFullView && data.healthScore !== undefined && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-accent-dark to-primary-dark text-white p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <h2 className="text-xl font-bold mb-4 relative z-10 text-white/90">Overall Customer Health Score</h2>
              <div className="flex items-end gap-2 relative z-10">
                <div className="text-7xl font-black text-white tracking-tighter drop-shadow-md">{data.healthScore}</div>
                <span className="text-white/60 text-lg font-medium mb-2 pb-1">/ 100</span>
              </div>
              <div className="mt-6 h-3 bg-white/10 rounded-full overflow-hidden relative z-10 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(38,178,77,0.8)]"
                  style={{ width: `${data.healthScore}%` }}
                />
              </div>
              {data.healthBreakdown && (
                <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium relative z-10">
                  <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">Subscriptions: {data.healthBreakdown.subscription}%</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">Tickets: {data.healthBreakdown.tickets}%</span>
                  <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">Customers: {data.healthBreakdown.customers}%</span>
                </div>
              )}
            </div>
            {data.sla && (
              <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-card hover:shadow-lg transition-shadow">
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
          <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-card hover:shadow-lg transition-shadow">
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
          <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-card hover:shadow-lg transition-shadow">
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
          <div className="rounded-2xl bg-white border border-slate-100 p-8 shadow-card hover:shadow-lg transition-shadow">
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
