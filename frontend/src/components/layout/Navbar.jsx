import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200">
      {/* Left side (page title) */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      {/* Right side (User info and Logout) */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {user?.email} ({user?.role})
          </span>
        </div>
        <button
          onClick={logout}
          title="Log Out"
          className="p-2 text-gray-500 transition-colors duration-200 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
