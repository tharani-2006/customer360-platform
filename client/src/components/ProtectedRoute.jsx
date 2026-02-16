import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ROLES = {
  ADMIN: 'admin',
  SUPPORT_ENGINEER: 'support_engineer',
  VIEWER: 'viewer',
};

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-gray">
        <div className="animate-pulse text-ink-muted font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);
  if (!hasRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-white p-6">
        <h1 className="text-2xl font-bold text-ink mb-2">Access Denied</h1>
        <p className="text-ink-muted">You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
