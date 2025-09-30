import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [{
    id: 'dashboard',
    label: 'Dashboard',
    path: '/sysadmin/dashboard',
    icon: <LayoutDashboard size={20} />
  }, {
    id: 'users',
    label: 'User Management',
    path: '/sysadmin/users',
    icon: <Users size={20} />
  }, {
    id: 'administrative',
    label: 'Administrative Details',
    path: '/sysadmin/administrative-details',
    icon: <MapPin size={20} />
  }];

  const getCurrentView = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => item.path === currentPath);
    return activeItem ? activeItem.id : 'dashboard';
  };

  const handleLogout = () => {
    navigate('/');
  };

  const currentView = getCurrentView();

  return (
    <aside className={`bg-green-900 text-green-50 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center p-4 border-b border-green-700">
        {!collapsed ? (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 flex-1 hover:bg-green-700 p-2 rounded transition-colors duration-200"
          >
            <MapPin size={24} />
            <h1 className="text-lg font-bold">Cattle MS</h1>
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex justify-center w-full hover:bg-green-700 p-2 rounded transition-colors duration-200"
          >
            <MapPin size={24} />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-green-700 transition-colors duration-200 ml-2"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-4">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center p-3 transition-colors duration-200 ${collapsed ? 'justify-center' : 'px-4'
                  } ${currentView === item.id
                    ? 'bg-green-700 text-white border-r-2 border-green-400'
                    : 'text-green-50 hover:bg-green-700 hover:text-white'
                  }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full transition-colors duration-200 ${collapsed
              ? 'justify-center p-3'
              : 'px-4 py-2'
            } text-green-50 hover:text-red-300 hover:bg-red-900 rounded-lg`}
          type="button"
        >
          <LogOut
            className={`${collapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'
              } transition-colors duration-200`}
          />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-green-700">
        <div className={`flex ${collapsed ? 'justify-center' : 'items-center'}`}>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm text-green-50 font-medium">System Admin</p>
              <p className="text-xs text-green-200">v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;