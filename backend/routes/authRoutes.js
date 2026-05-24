const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
  disable2FA,
  refreshToken,
  logout,
  getCurrentUser,
  updatePassword,
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
  linkedinAuth,
  linkedinAuthCallback
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, validate } = require('../middleware/validation');

// Public routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPassword);
router.post('/refresh-token', refreshToken);

// OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/facebook', facebookAuth);
router.get('/facebook/callback', facebookAuthCallback);
router.get('/linkedin', linkedinAuth);
router.get('/linkedin/callback', linkedinAuthCallback);

// Protected routes
router.use(protect);
router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.put('/update-password', updatePassword);

// 2FA routes
router.post('/2fa/enable', enable2FA);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router;