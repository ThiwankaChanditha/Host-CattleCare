import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Calendar,
    ClipboardList,
    Home,
    BarChart,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useSidebar } from '../../../App';

const Sidebar = () => {
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/vs/dashboard', icon: Home },
        { name: 'Health Records', href: '/vs/animals', icon: ClipboardList },
        { name: 'Appointments', href: '/vs/appointments', icon: Calendar },
        { name: 'Reports', href: '/vs/reports', icon: BarChart },
        { name: 'Settings', href: '/vs/settings', icon: Settings },
    ];

    const handleLogout = () => {
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen flex flex-col bg-white border-r border-gray-200 fixed top-0 left-0 transition-all duration-300 ease-in-out shadow-sm z-50`}>
            {/* Header */}
            <div className={`flex-1 flex flex-col pt-5 pb-4 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                <div className="flex items-center justify-between px-4 mb-2">
                    {!isCollapsed && (
                        <h2 className="text-xl font-bold text-green-600 transition-opacity duration-200">
                            VS Portal
                        </h2>
                    )}

                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className={`p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : 'ml-auto'
                            }`}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`mt-3 flex-1 px-2 bg-white space-y-1 ${isCollapsed ? 'px-3' : ''}`}>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.name} className="relative group">
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'
                                        } text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-green-100 text-green-700 shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon
                                                className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'
                                                    } transition-colors duration-200 ${isActive
                                                        ? 'text-green-600'
                                                        : 'text-gray-500 group-hover:text-gray-700'
                                                    }`}
                                            />
                                            {!isCollapsed && (
                                                <span className="transition-opacity duration-200">
                                                    {item.name}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                        {item.name}
                                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Logout Section */}
            <div className={`px-4 py-4 border-t border-gray-200 ${isCollapsed ? 'px-3' : ''}`}>
                <div className="relative group">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-2'
                            } text-gray-600 hover:text-red-600 hover:bg-red-50 w-full rounded-lg transition-all duration-200`}
                        type="button"
                    >
                        <LogOut
                            className={`${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'
                                } text-gray-500 hover:text-red-500 transition-colors duration-200`}
                        />
                        {!isCollapsed && (
                            <span className="transition-opacity duration-200">
                                Log out
                            </span>
                        )}
                    </button>

                    {/* Tooltip for logout when collapsed */}
                    {isCollapsed && (
                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                            Log out
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;