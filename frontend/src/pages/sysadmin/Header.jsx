import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
export const Header = ({
  collapsed,
  setCollapsed
}) => {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center">
      <div className="flex-grow"></div> {/* This div takes up the remaining space */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center">
          <div className="mr-3 text-right hidden sm:block">
            <p className="text-sm font-medium">System Administrator</p>
            <p className="text-xs text-gray-500">admin@cattlems.org</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
