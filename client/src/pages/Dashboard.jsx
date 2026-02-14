import { useAuth } from '../context/AuthContext';
import { ROLES } from '../components/ProtectedRoute';
import ShellLayout from '../components/ShellLayout';

const roleLabels = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SUPPORT_ENGINEER]: 'Support Engineer',
  [ROLES.VIEWER]: 'Viewer',
};

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ShellLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-ink mb-2">Welcome, {user.fullName || user.email}</h1>
        <p className="text-ink-muted mb-8">Role-based access is active. Your role: {roleLabels[user.role]}</p>

        {/* Hero / banner */}
        <div className="rounded-card overflow-hidden mb-8 grid lg:grid-cols-2">
          <div className="bg-accent-dark p-8 flex flex-col justify-center">
            <h2 className="text-primary font-bold text-xl mb-2">Unified CX Platform</h2>
            <p className="text-white/90">Best Unified Customer Experience Management</p>
          </div>
          <div className="aspect-video bg-white/5 flex items-center justify-center text-ink-muted text-sm">
            [Add banner image]
          </div>
        </div>

        {/* Role-specific placeholders */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
            <div className="aspect-[4/3] bg-surface-gray flex items-center justify-center text-ink-muted text-sm">
              [Add image 1]
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-ink">Section 1</h3>
              <p className="text-ink-muted text-sm">Content for {roleLabels[user.role]}</p>
            </div>
          </div>
          <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
            <div className="aspect-[4/3] bg-surface-gray flex items-center justify-center text-ink-muted text-sm">
              [Add image 2]
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-ink">Section 2</h3>
              <p className="text-ink-muted text-sm">Placeholder for your content</p>
            </div>
          </div>
          <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
            <div className="aspect-[4/3] bg-surface-gray flex items-center justify-center text-ink-muted text-sm">
              [Add image 3]
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-ink">Section 3</h3>
              <p className="text-ink-muted text-sm">Replace with your images</p>
            </div>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
