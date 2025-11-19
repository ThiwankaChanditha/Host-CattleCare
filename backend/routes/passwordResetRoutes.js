// backend/routes/passwordResetRoutes.js
const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Request password reset (send OTP)
router.post('/request-reset', passwordResetController.requestPasswordReset);

// Verify OTP
router.post('/verify-otp', passwordResetController.verifyOTP);

// Reset password
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;