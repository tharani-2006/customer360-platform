import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-white">
      {/* Top bar: logo + optional nav – replace /images/logo.png with your brand logo */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Customer360 – add logo.png to public/images"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) e.target.nextElementSibling.classList.remove('hidden');
            }}
          />
          <span className="hidden text-xl font-semibold text-ink" data-fallback="logo">
            Customer360
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left: dark green panel – reference hero style */}
        <div className="relative w-full md:w-[40%] bg-primary-dark text-white rounded-none md:rounded-r-card overflow-hidden flex flex-col justify-center p-8 md:p-10">
          {/* Optional decorative pattern – add /images/login-pattern.svg for a light pattern */}
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/login-pattern.svg)' }}
            aria-hidden
          />
          <div className="relative z-10">
            <span className="badge-yellow !bg-badge-yellow/20 !text-white border border-white/30 text-xs uppercase tracking-wide mb-4 inline-block">
              Unified CXM
            </span>
            <h1 className="heading-hero text-white md:text-accent-green mb-2">
              Unified Customer
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-white/90">
              Insight & Management
            </h2>
            <p className="mt-4 text-white/80 text-sm max-w-sm">
              Single source of truth for customer profiles, subscriptions, support, and health.
            </p>
          </div>
        </div>

        {/* Right: form + hero image placeholder */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="flex-1 flex items-center justify-center p-6 md:p-10 order-2 md:order-1">
            <div className="w-full max-w-sm">
              <span className="badge-yellow text-ink mb-4 inline-block">Sign in</span>
              <h3 className="text-2xl font-bold text-ink mb-6">Welcome back</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-button border border-gray-300 text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-button border border-gray-300 text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-button">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3 disabled:opacity-60"
                >
                  {submitting ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
          {/* Hero image – add /images/login-hero.jpg (e.g. person at laptop) */}
          <div className="relative w-full md:w-[40%] min-h-[200px] md:min-h-0 bg-surface-gray flex items-center justify-center order-1 md:order-2 rounded-t-card md:rounded-none overflow-hidden">
            <img
              src="/images/login-hero.jpg"
              alt="Add login-hero.jpg to public/images for hero visual"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                const el = e.target.nextElementSibling;
                if (el) el.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 bg-primary-dark/5 flex items-center justify-center text-ink-muted text-sm">
              Add <code className="mx-1 bg-white/80 px-1 rounded">login-hero.jpg</code> to{' '}
              <code className="mx-1 bg-white/80 px-1 rounded">public/images</code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
