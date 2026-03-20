import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from './ProtectedRoute';
import Logo from '../images/image.png'

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
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-xl z-20">
        <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-dark flex items-center justify-center text-white shadow-md p-1.5 overflow-hidden">
            <img src={Logo} alt="Logo" className="w-full h-auto object-contain" />
          </div>
          <div>
            <div className="text-base font-extrabold text-ink tracking-tight">Customer360</div>
            <div className="text-xs font-semibold text-ink-muted">Unified CX Platform</div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm overflow-y-auto">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-all duration-200 ${isActive(item.path)
                    ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary font-bold shadow-sm border-l-4 border-primary'
                    : 'text-ink-muted hover:bg-slate-50 hover:text-ink font-medium border-l-4 border-transparent'
                  }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

          {user.role === ROLES.ADMIN && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="px-2 text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-3">
                Admin
              </div>
              {adminItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-all duration-200 ${isActive(item.path)
                      ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary font-bold shadow-sm border-l-4 border-primary'
                      : 'text-ink-muted hover:bg-slate-50 hover:text-ink font-medium border-l-4 border-transparent'
                    }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-dark to-primary flex flex-shrink-0 items-center justify-center text-white font-bold shadow-inner">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-ink text-sm truncate" title={user.email}>{user.email.split('@')[0]}</div>
              <div className="text-xs font-medium text-primary truncate">{roleLabel}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-ink-muted hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl font-bold transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

