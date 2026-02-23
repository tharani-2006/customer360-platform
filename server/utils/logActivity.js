const AuditLog = require('../models/AuditLog');

const logActivity = async (userId, action, moduleAffected, details = {}) => {
    try {
        if (!userId) return; // Don't log if there's no user context

        await AuditLog.create({
            user: userId,
            action,
            moduleAffected,
            details,
        });
    } catch (err) {
        console.error('Error logging activity:', err);
    }
};

module.exports = logActivity;
