/**
 * Authentication Middleware
 */

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' });
  }
  next();
};

const requirePremium = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (req.session.user.plan !== 'premium') {
    return res.status(403).json({ 
      success: false, 
      message: 'Fitur ini hanya tersedia untuk pengguna Premium.',
      upgrade: true
    });
  }
  next();
};

module.exports = { requireAuth, requirePremium };
