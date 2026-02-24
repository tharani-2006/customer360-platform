import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auditApi } from '../api/auditApi';

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export default function AuditLogs() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data } = await auditApi.list();
            setLogs(data.data.logs);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load audit logs');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-surface-gray">
            <header className="bg-surface-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-ink-muted hover:text-ink font-medium"
                    >
                        ← Admin Panel
                    </button>
                    <span className="font-semibold text-ink">Audit Logs</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="badge-yellow">Admin</span>
                    <span className="text-ink-muted text-sm">{user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="text-ink-muted hover:text-ink text-sm font-medium"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-ink mb-1">System Audit Logs</h1>
                    <p className="text-ink-muted text-sm">Review critical system actions and modifications</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-button bg-red-50 text-red-600 text-sm">{error}</div>
                )}

                <div className="bg-surface-white rounded-card shadow-card overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-ink-muted">Loading audit logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-ink-muted">No audit logs found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-surface-gray/50">
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Timestamp</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-ink">User</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Action</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Module</th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-ink">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id || log.id} className="border-b border-gray-100 hover:bg-surface-gray/30">
                                            <td className="py-4 px-6 text-ink-muted text-sm whitespace-nowrap">
                                                {formatDateTime(log.createdAt)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-medium text-ink">
                                                    {log.user ? log.user.fullName : 'Unknown'}
                                                </div>
                                                <div className="text-xs text-ink-muted">
                                                    {log.user ? log.user.email : 'Deleted User'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex px-2 py-1 bg-surface-gray text-ink rounded-badge text-xs font-semibold uppercase tracking-wider">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-ink text-sm font-medium">
                                                {log.moduleAffected}
                                            </td>
                                            <td className="py-4 px-6 text-ink-muted text-xs">
                                                <pre className="max-w-xs truncate overflow-x-auto">
                                                    {log.details ? JSON.stringify(log.details) : '-'}
                                                </pre>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
