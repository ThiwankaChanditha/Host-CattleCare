import { useLocation, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../App';
import React, { useState, useRef, useEffect } from 'react';
import {
    LayoutDashboardIcon, BellIcon, FileTextIcon, Settings2Icon,
    LogOutIcon, Workflow, BadgeInfo, Upload, X, Trash2, ChevronLeft, ChevronRight, Menu
} from "lucide-react";
import Logo from "../assets/avatar.png";
import axios from 'axios';

const allSidebarTranslations = {
    en: {
        profileName: 'Guest User',
        selectLanguage: 'Select Language',
        english: 'English',
        sinhala: 'සිංහල',
        tamil: 'தமிழ்',
        logout: 'Logout',
        updateProfilePicture: 'Update Profile Picture',
        chooseFile: 'Choose File',
        uploadImage: 'Upload Image',
        removeImage: 'Remove Image',
        cancel: 'Cancel',
        noFileSelected: 'No file selected',
        collapseSidebar: 'Collapse Sidebar',
        expandSidebar: 'Expand Sidebar',
        menu: {
            dashboard: 'Dashboard',
            workshops: 'Workshops',
            notifications: 'Notifications',
            analytics: 'Analytics',
            forum: 'Forum',
            profile: 'Profile',
        }
    },
    si: {
        profileName: 'ආගන්තුක පරිශීලකයා',
        selectLanguage: 'භාෂාව තෝරන්න',
        english: 'English',
        sinhala: 'සිංහල',
        tamil: 'தமிழ්',
        logout: 'පිටවීම',
        updateProfilePicture: 'පැතිකඩ පින්තූරය යාවත්කාලීන කරන්න',
        chooseFile: 'ගොනුව තෝරන්න',
        uploadImage: 'පින්තූරය උඩුගත කරන්න',
        removeImage: 'පින්තූරය ඉවත් කරන්න',
        cancel: 'අවලංගු කරන්න',
        noFileSelected: 'ගොනුවක් තෝරා නැත',
        collapseSidebar: 'පැති තීරුව හකුළන්න',
        expandSidebar: 'පැති තීරුව විහිදන්න',
        menu: {
            dashboard: 'මුල් පිටුව',
            workshops: 'වැඩමුළු',
            notifications: 'දැනුම්දීම්',
            analytics: 'විශ්ලේෂණ',
            forum: 'සංසදය',
            profile: 'පැතිකඩ',
        }
    },
    ta: {
        profileName: 'விருந்தினர் பயனர்',
        selectLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
        english: 'English',
        sinhala: 'சிங்களம்',
        tamil: 'தமிழ்',
        logout: 'வெளியேறு',
        updateProfilePicture: 'சுயவிவரப் படத்தை புதுப்பிக்கவும்',
        chooseFile: 'கோப்பை தேர்ந்தெดுக்கவும்',
        uploadImage: 'படத்தை பதிவேற்றவும்',
        removeImage: 'படத்தை அகற்றவும்',
        cancel: 'ரத்து செய்யவும்',
        noFileSelected: 'கோப்பு தேர்ந்தெடுக்கப்படवில्லை',
        collapseSidebar: 'பக்கப்பட்டியை மறை',
        expandSidebar: 'பக्कप्पट्टियை विस्तार',
        menu: {
            dashboard: 'முதன்மைப் பக்கம்',
            workshops: 'பணிக்கூடங்கள்',
            notifications: 'அறிவிப்புகள்',
            analytics: 'பகுப்பாய்வுகள்',
            forum: 'மன்றம்',
            profile: 'சுयவிவरம்',
        }
    },
};

export default function Sidebar() {
    const location = useLocation();
    const { language } = useLanguage();
    const BACKEND_BASE_URL = 'http://localhost:5000';
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const t = allSidebarTranslations[language];

    const { isCollapsed, setIsCollapsed } = useSidebar();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    console.log("Sidebar Render Cycle:");
    console.log("    Current User object in Sidebar:", user);
    console.log("    Profile Image URL from user object:", user?.profileImage);

    const userRolePrefix = user?.dashboard ? user.dashboard.replace('_dashboard', '') : '';

    const menuItems = [
        { icon: LayoutDashboardIcon, labelKey: "dashboard", url: `/${userRolePrefix}/dashboard` },
        { icon: Workflow, labelKey: "workshops", url: `/${userRolePrefix}/workshop` },
        { icon: BellIcon, labelKey: "notifications", url: `/${userRolePrefix}/notifications` },
        { icon: FileTextIcon, labelKey: "analytics", url: `/${userRolePrefix}/analytics` },
        { icon: BadgeInfo, labelKey: "forum", url: `/${userRolePrefix}/forum` },
        { icon: Settings2Icon, labelKey: "profile", url: `/${userRolePrefix}/profile` }
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleProfileClick = () => {
        if (user && user.id) {
            setIsModalOpen(true);
            setSelectedFile(null);
        } else {
            alert("Please log in to update your profile picture.");
            navigate('/login');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleImageUpload = async () => {
        if (!user || !user.id || !selectedFile) {
            console.error("User not logged in or no file selected.");
            alert("Please log in and select a file to upload.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const res = await axios.post(`/api/users/${user.id}/upload-profile`, formData);
            if (res.data.success && res.data.imagePath) {
                updateUser({ profileImage: res.data.imagePath });
            }
        } catch (err) {
            console.error("Upload failed", err.response?.data || err.message);
            alert(`Failed to upload profile picture: ${err.response?.data?.error || "Unknown error"}`);
        } finally {
            setIsUploading(false);
            setIsModalOpen(false);
            setSelectedFile(null);
        }
    };

    const handleRemoveImage = async () => {
        if (!user || !user.id) {
            console.error("User not logged in. Cannot remove image.");
            alert("Please log in to remove your profile picture.");
            return;
        }

        setIsUploading(true);
        try {
            await axios.delete(`/api/users/${user.id}/remove-profile`);
            updateUser({ profileImage: null });
        } catch (err) {
            console.error("Removal failed", err.response?.data || err.message);
            alert(`Failed to remove profile picture: ${err.response?.data?.error || "Unknown error"}`);
        } finally {
            setIsUploading(false);
            setIsModalOpen(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFile(null);
    };

    const renderRankStars = (rank) => {
        const actualRank = typeof rank === 'number' ? Math.min(Math.max(0, rank), 5) : 0;
        return (
            <div className={`flex items-center justify-center space-x-1 ${isCollapsed ? 'mt-1' : ''}`}>
                {Array.from({ length: 5 }, (_, i) => (
                    <svg
                        key={i}
                        className={`${isCollapsed ? 'h-2 w-2' : 'h-4 w-4'} ${i < actualRank ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.049 2.927a1 1 0 011.902 0l1.351 3.658a1 1 0 00.95.69h3.914a1 1 0 01.588 1.809l-3.16 2.42a1 1 0 00-.366 1.118l1.16 3.785a1 1 0 01-1.522 1.095l-3.387-2.504a1 1 0 00-1.175 0l-3.387 2.504a1 1 0 01-1.522-1.095l1.16-3.785a1 1 0 00-.366-1.118l-3.16-2.42a1 1 0 01.588-1.809h3.914a1 1 0 00.95-.69l1.351-3.658z"
                            clipRule="evenodd"
                        />
                    </svg>
                ))}
            </div>
        );
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* Internet Explorer 10+ */
                    scrollbar-width: none;  /* Firefox */
                }
                .scrollbar-hide::-webkit-scrollbar { 
                    display: none;  /* Safari and Chrome */
                }
            `}</style>

            {/* Mobile hamburger menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            {/* Sidebar for desktop and mobile */}
            <div ref={sidebarRef} className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:flex-col`}>
                <div className={`${isCollapsed ? 'p-2 pt-4' : 'p-4 pt-6'} flex flex-col items-center border-b border-gray-200 transition-all duration-300`}>
                    <Link to={userRolePrefix ? `/${userRolePrefix}/dashboard` : "/"} className="flex flex-col items-center group">
                        <div className="relative">
                            <img
                                src={user?.profileImage ? `/api/${user.profileImage}` : Logo}
                                alt="Profile"
                                className={`${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'} rounded-full object-cover border-2 border-gray-100 cursor-pointer hover:border-blue-400 transition-all duration-300 group-hover:scale-105`}
                                onClick={handleProfileClick}
                            />
                            {isCollapsed && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="text-center mt-2 transition-opacity duration-300">
                                {renderRankStars(user?.rating)}
                            </div>
                        )}

                        {isCollapsed && (
                            <div className="mt-1">
                                {renderRankStars(user?.rating)}
                            </div>
                        )}
                    </Link>
                </div>

                <div className="relative">
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-4 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 z-50 group"
                        title={isCollapsed ? t.expandSidebar : t.collapseSidebar}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-green-600 transition-colors" />
                        ) : (
                            <ChevronLeft className="w-3 h-3 text-gray-600 group-hover:text-green-600 transition-colors" />
                        )}
                    </button>
                </div>

                <nav className="flex-1 py-4 scrollbar-hide">
                    <ul className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        {menuItems.map((item) => (
                            <li key={item.labelKey} className="group">
                                <Link
                                    to={item.url}
                                    className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-2.5'} rounded-lg transition-all duration-200 relative
                                    ${location.pathname.startsWith(item.url)
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-green-700 font-semibold shadow-sm border-l-4 border-green-500"
                                            : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-green-700"
                                        }`}
                                    title={isCollapsed ? t.menu[item.labelKey] : ''}
                                >
                                    <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200 ${location.pathname.startsWith(item.url) ? 'text-green-600' : ''}`} />
                                    {!isCollapsed && (
                                        <span className="transition-opacity duration-200">{t.menu[item.labelKey]}</span>
                                    )}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                            {t.menu[item.labelKey]}
                                            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3 w-full' : 'space-x-3 w-full px-4 py-2'} text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group relative`}
                        title={isCollapsed ? t.logout : ''}
                    >
                        <LogOutIcon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200`} />
                        {!isCollapsed && <span>{t.logout}</span>}

                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {t.logout}
                                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {isModalOpen && user && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-96 max-w-md mx-4 transform transition-all duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {t.updateProfilePicture}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-all duration-200"
                                disabled={isUploading}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <img
                                        src={user?.profileImage ? `${user.profileImage}` : Logo}
                                        alt="Current Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <Upload className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    {t.chooseFile}
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={isUploading}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-300 rounded-lg cursor-pointer hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-200 flex-1"
                                    >
                                        <Upload className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700 truncate">
                                            {selectedFile ? selectedFile.name : t.chooseFile}
                                        </span>
                                    </label>
                                </div>
                                {!selectedFile && (
                                    <p className="text-xs text-gray-500 mt-2">{t.noFileSelected}</p>
                                )}
                            </div>

                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={handleImageUpload}
                                    disabled={!selectedFile || isUploading}
                                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>
                                        {isUploading ? 'Uploading...' : t.uploadImage}
                                    </span>
                                </button>

                                {user?.profileImage && (
                                    <button
                                        onClick={handleRemoveImage}
                                        disabled={isUploading}
                                        className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>
                                            {isUploading ? 'Removing...' : t.removeImage}
                                        </span>
                                    </button>
                                )}

                                <button
                                    onClick={closeModal}
                                    disabled={isUploading}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {t.cancel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
