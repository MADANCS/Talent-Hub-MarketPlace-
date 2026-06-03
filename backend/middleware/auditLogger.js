const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource, severity = 'LOW') => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      try {
        const status = res.statusCode >= 200 && res.statusCode < 400 ? 'SUCCESS' : 'FAILED';
        await AuditLog.create({
          user: req.user?._id,
          action,
          resource,
          resourceId: req.params?.id,
          details: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: sanitizeBody(req.body)
          },
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          status,
          severity,
          errorMessage: data?.message || ''
        });
      } catch (e) {
        // non-blocking
      }
      return originalJson(data);
    };
    next();
  };
};

const sanitizeBody = (body) => {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.token;
  return sanitized;
};

module.exports = auditLogger;
