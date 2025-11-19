// frontend/src/pages/login/ForgotPasswordModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../utility/translations';

export default function ForgotPasswordModal({ onClose }) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(600); // 10 minutes
    const [canResend, setCanResend] = useState(false);
    const { language } = useLanguage();

    const t = useMemo(() => {
        return translations.forgotPassword?.[language] || translations.forgotPassword?.en || {
            title: 'Reset Password',
            emailPlaceholder: 'Enter your email',
            sendOTP: 'Send OTP',
            otpPlaceholder: 'Enter 6-digit OTP',
            verifyOTP: 'Verify OTP',
            newPasswordPlaceholder: 'Enter new password',
            confirmPasswordPlaceholder: 'Confirm new password',
            resetPassword: 'Reset Password',
            backToLogin: 'Back to Login',
            resendOTP: 'Resend OTP',
            otpExpiresIn: 'OTP expires in',
            passwordMismatch: 'Passwords do not match',
            passwordTooShort: 'Password must be at least 6 characters',
            successMessage: 'Password reset successful! You can now login.',
            close: 'Close'
        };
    }, [language]);

    // Countdown timer for OTP expiry
    useEffect(() => {
        if (step === 2 && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, step]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/api/password-reset/request-reset', { email });
            setLoading(false);
            
            if (response.data.success) {
                setSuccess(response.data.message);
                setStep(2);
                setCountdown(600); // Reset countdown
                setCanResend(false);
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/api/password-reset/request-reset', { email });
            setLoading(false);
            
            if (response.data.success) {
                setSuccess('New OTP sent to your email');
                setCountdown(600); // Reset countdown
                setCanResend(false);
                setOtp('');
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await axios.post('/api/password-reset/verify-otp', { email, otp });
            setLoading(false);
            
            if (response.data.success) {
                setSuccess(response.data.message);
                setStep(3);
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (newPassword.length < 6) {
            setError(t.passwordTooShort);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t.passwordMismatch);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/password-reset/reset-password', {
                email,
                otp,
                newPassword
            });
            setLoading(false);
            
            if (response.data.success) {
                setSuccess(response.data.message);
                setStep(4);
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.title}</h2>

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="text-gray-600 text-sm">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        {success && <div className="text-green-500 text-sm">{success}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-lg text-white font-semibold ${
                                loading
                                    ? 'bg-green-300 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 transition duration-300'
                            }`}
                        >
                            {loading ? 'Sending...' : t.sendOTP}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            We've sent a 6-digit code to <strong>{email}</strong>
                        </p>

                        <div>
                            <label className="text-gray-600 text-sm">Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder={t.otpPlaceholder}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-center text-2xl tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="text-sm text-center text-gray-500">
                            {countdown > 0 ? (
                                <span>{t.otpExpiresIn}: {formatTime(countdown)}</span>
                            ) : (
                                <span className="text-red-500">OTP expired</span>
                            )}
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        {success && <div className="text-green-500 text-sm">{success}</div>}

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className={`w-full py-2 rounded-lg text-white font-semibold ${
                                loading || otp.length !== 6
                                    ? 'bg-green-300 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 transition duration-300'
                            }`}
                        >
                            {loading ? 'Verifying...' : t.verifyOTP}
                        </button>

                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={!canResend || loading}
                            className={`w-full py-2 rounded-lg font-semibold ${
                                canResend && !loading
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {t.resendOTP}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full py-2 text-gray-600 hover:text-gray-800"
                        >
                            ← Back
                        </button>
                    </form>
                )}

                {/* Step 3: Enter New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="relative">
                            <label className="text-gray-600 text-sm">New Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t.newPasswordPlaceholder}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-sm text-green-600"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <div className="relative">
                            <label className="text-gray-600 text-sm">Confirm Password</label>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t.confirmPasswordPlaceholder}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-9 text-sm text-green-600"
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        {success && <div className="text-green-500 text-sm">{success}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-lg text-white font-semibold ${
                                loading
                                    ? 'bg-green-300 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 transition duration-300'
                            }`}
                        >
                            {loading ? 'Resetting...' : t.resetPassword}
                        </button>
                    </form>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Success!</h3>
                        <p className="text-gray-600">{t.successMessage}</p>
                        <button
                            onClick={onClose}
                            className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition duration-300"
                        >
                            {t.close}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}