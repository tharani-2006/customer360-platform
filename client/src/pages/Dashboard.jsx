import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../components/ProtectedRoute';
import ShellLayout from '../components/ShellLayout';
import header_img from '../images/Hero-banner.png';
import { analyticsApi } from '../api/analyticsApi';

const roleLabels = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.SUPPORT_ENGINEER]: 'Support Engineer',
  [ROLES.VIEWER]: 'Viewer',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await analyticsApi.getDashboard();
        if (response.data?.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <ShellLayout>
      <div className="max-w-6xl mx-auto pb-10">
        <h1 className="text-3xl font-extrabold text-ink mb-2 tracking-tight">Welcome back, {user.fullName || user.email}</h1>
        <p className="text-ink-muted mb-8 text-lg font-medium">Role-based access is active. Your role: <span className="text-primary">{roleLabels[user.role]}</span></p>

        {/* Hero / banner */}
        <div className="rounded-2xl overflow-hidden mb-10 grid lg:grid-cols-2 shadow-card transition-all duration-500 hover:shadow-2xl">
          <div className="bg-gradient-to-br from-accent-dark via-accent-dark-light to-primary-dark p-10 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider mb-4 border border-white/30 backdrop-blur-sm">DASHBOARD</span>
              <h2 className="text-white font-extrabold text-4xl mb-4 leading-tight">Unified CX Platform</h2>
              <p className="text-white/80 text-lg max-w-md">The best way to manage, engage, and connect with your customers seamlessly.</p>
            </div>
            {/* Decorative blurs */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 xl:group-hover:scale-110 transition-transform duration-700"></div>
          </div>
          <div className="aspect-video bg-surface-gray flex items-center justify-center overflow-hidden relative group">
            <img src={header_img} alt="Hero Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Data Cards */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-card h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 - Customers */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50 group flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80" alt="Customers" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-accent-dark shadow-sm">
                  {data?.customers?.active || 0} Active
                </div>
              </div>
              <div className="p-6 relative flex-grow flex flex-col">
                <div className="absolute -top-8 left-6 w-14 h-14 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 className="font-extrabold text-xl text-ink mt-6">Total Customers</h3>
                <p className="text-ink-muted text-sm mt-1 mb-6 flex-grow">Unified customer base overview</p>
                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                  <span className="text-4xl font-black text-accent-dark tracking-tight">{data?.customers?.total || 0}</span>
                  <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                    Growth
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 - Subscriptions */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50 group flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80" alt="Subscriptions" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-accent-dark shadow-sm">
                  {data?.subscriptions?.active || 0} Active
                </div>
              </div>
              <div className="p-6 relative flex-grow flex flex-col">
                <div className="absolute -top-8 left-6 w-14 h-14 bg-accent-dark text-white rounded-xl shadow-lg flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="font-extrabold text-xl text-ink mt-6">Subscriptions</h3>
                <p className="text-ink-muted text-sm mt-1 mb-6 flex-grow">Current subscription revenue data</p>
                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                  <span className="text-4xl font-black text-accent-dark tracking-tight">{data?.subscriptions?.total || 0}</span>
                  <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                    {data?.subscriptions?.trial || 0} Trials
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 - Tickets */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50 group flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" alt="Tickets" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="flex space-x-2">
                    <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-accent-dark shadow-sm">
                      {data?.tickets?.resolved || 0} Resolved
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6 relative flex-grow flex flex-col">
                <div className="absolute -top-8 right-6 w-14 h-14 bg-badge-yellow text-accent-dark rounded-xl shadow-lg flex items-center justify-center transform rotate-6 group-hover:rotate-0 transition-transform z-30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                </div>
                <h3 className="font-extrabold text-xl text-ink mt-6">Support Tickets</h3>
                <p className="text-ink-muted text-sm mt-1 mb-6 flex-grow">Total requested support tickets</p>
                <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                  <span className="text-4xl font-black text-accent-dark tracking-tight">{data?.tickets?.total || 0}</span>
                  <span className="text-sm font-semibold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
                    {data?.tickets?.openOrInProgress || 0} Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
