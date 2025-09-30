import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MenuIcon,
    BellIcon,
    ChevronDownIcon,
    LogOutIcon,
    UserIcon,
    SettingsIcon
} from 'lucide-react';
import { userProfile } from '../data/mockData';

const Header = ({ onMenuClick }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
        window.location.reload(); // Simple way to reset app state
    };

    return (
        <header className="bg-white shadow-sm z-10 sticky top-0">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <button
                            onClick={onMenuClick}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 md:hidden"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-green-600">VS Portal</h1>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button className="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                            <BellIcon className="h-6 w-6" />
                        </button>
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-3 max-w-xs bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 p-2 hover:bg-gray-100"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <UserIcon className="h-6 w-6 text-gray-500" />
                                    <span className="hidden md:block font-medium text-gray-700">
                                        {userProfile.name}
                                    </span>
                                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                            {profileOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900">
                                            {userProfile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {userProfile.email}
                                        </p>
                                    </div>
                                    <a
                                        href="/settings"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setProfileOpen(false);
                                            navigate('/settings');
                                        }}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <SettingsIcon className="mr-3 h-4 w-4 text-gray-500" />
                                        Settings
                                    </a>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOutIcon className="mr-3 h-4 w-4 text-gray-500" />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
