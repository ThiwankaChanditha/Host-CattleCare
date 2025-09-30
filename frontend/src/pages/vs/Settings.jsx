/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Save, Eye, EyeOff, UserIcon, LockIcon, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastNotification';

const Card = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
                {Icon && <Icon className="h-5 w-5 text-gray-600" />}
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const Button = ({ variant = 'primary', children, ...props }) => {
    const baseClasses = "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500"
    };

    return (
        <button className={`${baseClasses} ${variants[variant]}`} {...props}>
            {children}
        </button>
    );
};

const Settings = () => {
    const { token, isAuthenticated, loading: authLoading, logout } = useAuth();
    const { showSuccess, showError, showInfo } = useToast();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [profileErrors, setProfileErrors] = useState({});

    const formatMemberSince = (createdAt) => {
        if (!createdAt) return 'N/A';
        const date = new Date(createdAt);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        if (!isAuthenticated && !authLoading) {
            console.warn("User not authenticated. Cannot fetch profile.");
            setLoading(false);
            return;
        }

        if (token) {
            const fetchProfile = async () => {
                try {
                    setLoading(true);
                    const response = await fetch('/api/vs/dashboard/settings', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.status === 401) {
                        logout();
                        return;
                    }

                    if (!response.ok) {
                        throw new Error('Failed to fetch user profile');
                    }
                    const data = await response.json();
                    console.log('Fetched profile data:', data);
                    setProfile({
                        name: data.user.full_name || '',
                        email: data.user.email || '',
                        contact: data.user.contact_number || '',
                        address: data.user.address || '',
                        designation: data.user.designation || '',
                        area: data.user.area || '',
                        memberSince: formatMemberSince(data.user.created_at),
                        divisionType: data.divData.division_type || '',
                        divisionName: data.divData.division_name || ''
                    });
                } catch (error) {
                    console.error('Error fetching profile:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [token, isAuthenticated, authLoading, logout]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
        if (profileErrors[name]) {
            setProfileErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
        if (passwordErrors[name]) {
            setPasswordErrors({
                ...passwordErrors,
                [name]: ''
            });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const validatePasswords = () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        } else if (!/[A-Z]/.test(passwordData.newPassword) || !/[a-z]/.test(passwordData.newPassword) || !/[0-9]/.test(passwordData.newPassword)) {
            errors.newPassword = 'Password must include uppercase, lowercase, and a number.';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setProfileErrors({});
        try {
            const response = await fetch('/api/vs/dashboard/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: profile.name,
                    email: profile.email,
                    contact_number: profile.contact
                })
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.errors) {
                    setProfileErrors(errorData.errors);
                } else {
                    setProfileErrors({ general: errorData.message || 'Failed to update profile' });
                }
                throw new Error(errorData.message || 'Failed to update profile');
            }
            showSuccess('Settings updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            if (!profileErrors.general) {
                setProfileErrors({ general: 'An unexpected error occurred while updating profile.' });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        const errors = validatePasswords();
        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setIsSaving(true);
        setPasswordErrors({});
        try {
            const response = await fetch('/api/vs/dashboard/settings/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                setPasswordErrors({ currentPassword: errorData.message || 'Failed to update password' });
                return;
            }
            showSuccess('Settings updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error updating password:', error);
            setPasswordErrors({ general: 'An unexpected error occurred while updating password.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-500"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-300 opacity-30"></div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <p className="text-center text-red-500">Please log in to view settings.</p>;
    }




    return (
        <div>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8">
                </div>
                {/* Profile Information */}
                <Card title="Profile Information" icon={UserIcon}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white ${profileErrors.full_name ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                                    value={profile?.name || ''}
                                    onChange={handleInputChange}
                                />
                                {profileErrors.full_name && <p className="text-sm text-red-600">{profileErrors.full_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white ${profileErrors.email ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                                    value={profile?.email || ''}
                                    onChange={handleInputChange}
                                />
                                {profileErrors.email && <p className="text-sm text-red-600">{profileErrors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="contact" className="block text-sm font-semibold text-gray-700">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    name="contact"
                                    id="contact"
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 bg-white ${profileErrors.contact ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                                    value={profile?.contact || ''}
                                    onChange={handleInputChange}
                                />
                                {profileErrors.contact && <p className="text-sm text-red-600">{profileErrors.contact}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                                    value={profile?.address || ''}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="designation" className="block text-sm font-semibold text-gray-700">
                                    Division Name
                                </label>
                                <input
                                    type="text"
                                    name="divisionName"
                                    id="divisionName"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                                    value={profile?.divisionName || ''}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="area" className="block text-sm font-semibold text-gray-700">
                                    Division Type
                                </label>
                                <input
                                    type="text"
                                    name="divisionType"
                                    id="divisionType"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                                    value={profile?.divisionType || ''}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Member since: <span className="font-medium text-gray-900">{profile?.memberSince || 'N/A'}</span></p>
                                </div>
                                <Button variant="primary" onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                            {profileErrors.general && <p className="text-sm text-red-600 mt-2">{profileErrors.general}</p>}
                        </div>
                    </div>
                </Card>

                {/* Password Change */}
                <Card title="Change Password" icon={LockIcon}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        id="currentPassword"
                                        className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 bg-white ${passwordErrors.currentPassword
                                            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                                            : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            }`}
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        {showPasswords.current ? (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            id="newPassword"
                                            className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 bg-white ${passwordErrors.newPassword
                                                ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                                                : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                }`}
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => togglePasswordVisibility('new')}
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 bg-white ${passwordErrors.confirmPassword
                                                ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                                                : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                                }`}
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    <p>Password requirements:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                                        <li>At least 6 characters long</li>
                                        <li>Include uppercase and lowercase letters</li>
                                        <li>Include at least one number</li>
                                    </ul>
                                </div>
                                <Button variant="primary" onClick={handlePasswordSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </div>
                            {passwordErrors.general && <p className="text-sm text-red-600 mt-2">{passwordErrors.general}</p>}
                        </div>
                    </div>
                </Card>


            </div>
        </div>
    );
};

export default Settings;