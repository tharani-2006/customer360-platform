import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="bg-surface-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-ink-muted hover:text-ink font-medium">
            ← Dashboard
          </button>
          <span className="font-semibold text-ink">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="badge-yellow">Admin</span>
          <span className="text-ink-muted text-sm">{user.email}</span>
          <button onClick={handleLogout} className="text-ink-muted hover:text-ink text-sm font-medium">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-ink mb-2">Admin Only</h1>
        <p className="text-ink-muted mb-8">
          This page is restricted to Admin role. Support Engineers and Viewers cannot access it.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/admin/users')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/users')}
            className="card-panel text-left cursor-pointer hover:opacity-95 transition-opacity"
          >
            <h3 className="font-semibold mb-2">User Management</h3>
            <p className="text-white/80 text-sm">Create users, assign roles, activate or deactivate.</p>
            <div className="mt-4 aspect-video bg-white/10 rounded-button flex items-center justify-center text-white/50 text-sm">
              [Add image]
            </div>
          </div>
          <div className="card-panel">
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-white/80 text-sm">Placeholder for admin settings.</p>
            <div className="mt-4 aspect-video bg-white/10 rounded-button flex items-center justify-center text-white/50 text-sm">
              [Add image]
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
