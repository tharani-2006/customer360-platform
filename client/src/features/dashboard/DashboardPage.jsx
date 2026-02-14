import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Admin',
  support_engineer: 'Support Engineer',
  viewer: 'Viewer',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="bg-primary-dark text-white shadow-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Customer360"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-lg font-semibold">Customer360</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/90 text-sm">
              {user?.fullName || user?.email} · {ROLE_LABELS[user?.role] || user?.role}
            </span>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-button bg-white/10 hover:bg-white/20 text-sm font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          <span className="badge-yellow mb-3 inline-block">Dashboard</span>
          <h1 className="text-2xl font-bold text-ink mb-2">Welcome, {user?.fullName || user?.email}</h1>
          <p className="text-ink-muted mb-6">
            You are signed in as <strong>{ROLE_LABELS[user?.role] || user?.role}</strong>.
            Role-based modules (User Management, Customers, etc.) will be added in later steps.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 rounded-button bg-primary-dark/10 text-primary-dark text-sm font-medium">
              JWT authenticated
            </span>
            <span className="px-3 py-1.5 rounded-button bg-accent-green/10 text-accent-dark text-sm font-medium">
              RBAC active
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
