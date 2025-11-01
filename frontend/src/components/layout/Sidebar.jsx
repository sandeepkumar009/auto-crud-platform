import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, LayoutGrid, PlusSquare } from 'lucide-react'; // Icons

const Sidebar = () => {
  // Common style for NavLink
  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 space-x-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-gray-800">
      {/* Logo/Title */}
      <NavLink
        to="/"
        className="flex items-center px-2 mb-8 space-x-2 text-white"
      >
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Database size={24} />
        </div>
        <span className="text-xl font-semibold">Auto-CRUD</span>
      </NavLink>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2">
        <h3 className="px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Menu
        </h3>
        
        <NavLink to="/" end className={navLinkClass}>
          <LayoutGrid size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/model-builder" className={navLinkClass}>
          <PlusSquare size={20} />
          <span>Model Builder</span>
        </NavLink>

        {/* Dynamic model links will be added here */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <h3 className="px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Models
          </h3>
          <div className="mt-2 space-y-1">
            {/* Example of what will be dynamically generated later */}
            <p className="px-4 text-sm text-gray-500">
              (No models created)
            </p>
            {/* <NavLink to="/admin/products" className={navLinkClass}>
                <span>Products</span>
              </NavLink>
              <NavLink to="/admin/employees" className={navLinkClass}>
                <span>Employees</span>
              </NavLink>
            */}
          </div>
        </div>
      </nav>
      
      {/* Spacer */}
      <div className="grow"></div>
      
      {/* Footer/User Info (optional) */}
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-700">
        © 2025 Auto-CRUD Inc.
      </div>
    </div>
  );
};

export default Sidebar;
