const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find({})
            .populate('user', 'fullName email role')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: { logs },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAuditLogs,
};
