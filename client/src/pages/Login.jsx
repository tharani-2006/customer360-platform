import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginimage from '../images/Screenshot 2025-08-01 203306.png'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel – dark accent green – add your images here */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-dark rounded-r-[2rem] p-12 flex-col justify-between">
        <div>
          {/* Add logo: <img src="/logo.png" alt="Logo" className="h-10 w-auto mb-12" /> */}
          <div className="w-32 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/50 text-xs mb-12">
            [Logo]
          </div>
        </div>
        <div>
          <h2 className="text-primary font-bold text-2xl mb-4">Unified CX Platform</h2>
          <p className="text-white/90 text-lg max-w-md">
            Best Unified Customer Experience Management
          </p>
        </div>
        {/* Placeholder: Add your hero image here */}
        <div className="w-full aspect-video rounded-2xl bg-white/5 flex items-center justify-center text-white/40 text-sm">
          <img src={loginimage} alt="Login Hero" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-white">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-ink mb-2">Login to your Account</h1>
          <p className="text-ink-muted mb-8">Enter your email and password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-button border border-gray-200 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-button border border-gray-200 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-muted">
            Demo: admin@customer360.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}
