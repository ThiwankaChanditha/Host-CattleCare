import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboardIcon, UsersIcon, ClipboardCheckIcon, BellIcon, FileTextIcon, Settings2Icon, LogOutIcon, FolderIcon, MenuIcon, XIcon } from "lucide-react"; // Added MenuIcon and XIcon

export default function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const menuItems = [{
    icon: LayoutDashboardIcon,
    label: "Dashboard",
    url: "/ldi/dashboard"
  }, {
    icon: UsersIcon,
    label: "Farmers",
    url: "/ldi/farmers"
  }, {
    icon: ClipboardCheckIcon,
    label: "Validations",
    url: "/ldi/validations"
  }, {
    icon: FolderIcon,
    label: "Portfolio",
    url: "/ldi/portfolio"
  }, {
    icon: BellIcon,
    label: "Notifications",
    url: "/ldi/notifications"
  }, {
    icon: FileTextIcon,
    label: "Reports",
    url: "/ldi/reports"
  }, {
    icon: Settings2Icon,
    label: "Settings",
    url: "/ldi/settings"
  }];

  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80" alt="Profile" className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="font-semibold text-gray-800">John Smith</h2>
            <p className="text-sm text-gray-500">LDI - Melsiripura</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-4">
          {menuItems.map(item => (
            <li key={item.label}>
              <Link
                to={item.url}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors ${
                  location.pathname === item.url
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link to="/" className="flex items-center space-x-3 text-gray-600 hover:text-red-600 w-full px-4 py-2">
          <LogOutIcon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-6 left-6 z-40 p-3 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <XIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <MenuIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen flex flex-col bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobile && (
        <div className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:hidden shadow-xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h1 className="text-lg font-semibold text-gray-800">Menu</h1>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Close mobile menu"
              >
                <XIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}