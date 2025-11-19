// backend/controllers/passwordResetController.js
const User = require('../models/users');
const PasswordReset = require('../models/password_reset');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Email configuration (you'll need to set these in your .env file)
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset (send OTP)
exports.requestPasswordReset = async (req, res) => {
    try {
        console.log('requestPasswordReset called', req.body);
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email (case-insensitive)
        const user = await User.findOne({
            email: { $regex: new RegExp('^' + email.trim() + '$', 'i') }
        });

        if (!user) {
            console.log('No user found, returning early');
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset code.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        console.log(`Generated OTP for ${user.email}: ${otp}`);
        // Delete any existing unused OTPs for this user
        await PasswordReset.deleteMany({
            user_id: user._id,
            is_used: false
        });

        // Create new password reset record
        await PasswordReset.create({
            user_id: user._id,
            email: user.email,
            otp: otp
        });

        // Send email with OTP
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Code - CattleCare',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">Password Reset Request</h2>
                    <p>Hello ${user.full_name},</p>
                    <p>You have requested to reset your password. Please use the following code:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #22c55e; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">
                        This is an automated message from CattleCare. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Password reset code has been sent to your email.'
        });

    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request. Please try again.'
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Find the reset record
        const resetRecord = await PasswordReset.findOne({
            email: { $regex: new RegExp('^' + email.trim() + '$', 'i') },
            otp: otp.trim(),
            is_used: false
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Check if OTP is expired (10 minutes)
        const otpAge = Date.now() - resetRecord.created_at.getTime();
        if (otpAge > 10 * 60 * 1000) {
            await PasswordReset.deleteOne({ _id: resetRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            resetToken: resetRecord._id.toString() // We'll use this to identify the reset session
        });

    } catch (error) {
        console.error('Error in verifyOTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP. Please try again.'
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Find the reset record
        const resetRecord = await PasswordReset.findOne({
            email: { $regex: new RegExp('^' + email.trim() + '$', 'i') },
            otp: otp.trim(),
            is_used: false
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Check if OTP is expired
        const otpAge = Date.now() - resetRecord.created_at.getTime();
        if (otpAge > 10 * 60 * 1000) {
            await PasswordReset.deleteOne({ _id: resetRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Find user
        const user = await User.findById(resetRecord.user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        user.password_hash = hashedPassword;
        await user.save();

        // Mark OTP as used
        resetRecord.is_used = true;
        await resetRecord.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Successful - CattleCare',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">Password Reset Successful</h2>
                    <p>Hello ${user.full_name},</p>
                    <p>Your password has been successfully reset.</p>
                    <p>If you did not make this change, please contact support immediately.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">
                        This is an automated message from CattleCare. Please do not reply to this email.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password. Please try again.'
        });
    }
};