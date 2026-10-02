const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', authenticateToken, authController.getMe);
router.put('/language', authenticateToken, authController.updateLanguage);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authenticateToken, authController.resendVerification);
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  message: { error: 'Too many OTP requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-otp', otpLimiter, authController.sendOtp);
router.post('/verify-otp', otpLimiter, authController.verifyOtp);

router.post('/logout', authenticateToken, (req, res) => {
  const { logSecurityEvent } = require('../services/securityLogger');
  const { getRealIp } = require('../utils/ipHelper');
  const ip = getRealIp(req);
  const ua = req.headers['user-agent'] || '';
  
  logSecurityEvent(
    req.user?.id || null,
    req.user?.email || 'unknown',
    'LOGOUT',
    ip,
    ua,
    'User successfully logged out'
  ).catch(err => console.error('Failed to log logout:', err.message));

  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
