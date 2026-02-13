import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from './ProtectedRoute';

const navItems = [
  { label: 'Dashboard', path: '/', roles: [ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER] },
  { label: 'Customers', path: '/customers', roles: [ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER] },
  { label: 'Subscriptions', path: '/subscriptions', roles: [ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER] },
  { label: 'Tickets', path: '/tickets', roles: [ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER] },
  { label: 'Analytics', path: '/analytics', roles: [ROLES.ADMIN, ROLES.SUPPORT_ENGINEER, ROLES.VIEWER] },
];

const adminItems = [
  { label: 'Users', path: '/admin/users' },
  { label: 'Audit Logs', path: '/admin/audit' },
];

export default function ShellLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const roleLabel =
    user.role === ROLES.ADMIN
      ? 'Admin'
      : user.role === ROLES.SUPPORT_ENGINEER
        ? 'Support'
        : 'Viewer';

  return (
    <div className="min-h-screen bg-surface-gray flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            C
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">Customer360</div>
            <div className="text-xs text-ink-muted">Unified CX Platform</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-button text-left ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-ink-muted hover:bg-surface-gray hover:text-ink'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

          {user.role === ROLES.ADMIN && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="px-1 text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
                Admin
              </div>
              {adminItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-button text-left ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-ink-muted hover:bg-surface-gray hover:text-ink'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200 text-xs text-ink-muted">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium text-ink text-sm">{user.email}</div>
              <div className="text-xs text-ink-muted">{roleLabel}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-ink-muted hover:text-ink text-xs font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

