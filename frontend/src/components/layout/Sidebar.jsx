import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { DatabaseZap, Database, LayoutGrid, PlusSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const Sidebar = () => {
  const { user } = useAuth();

  const [dynamicModels, setDynamicModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await api.get('/models');
        setDynamicModels(response.data);
      } catch (error) {
        console.error('Error fetching models:', error);
        // Don't show an error, just an empty list
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, []);

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
          <DatabaseZap size={24} />
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

        {user?.role === 'Admin' && (
          <NavLink to="/model-builder" className={navLinkClass}>
            <PlusSquare size={20} />
            <span>Model Builder</span>
          </NavLink>
        )}

        {/* Dynamic model links will be added here */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <h3 className="px-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Models
          </h3>
          <div className="mt-2 space-y-1">
            {loading ? (
              <p className="px-3 text-sm text-gray-400">Loading...</p>
            ) : (
              dynamicModels.map((modelName) => (
                <NavLink
                  key={modelName}
                  to={`/admin/${modelName.toLowerCase()}`}
                  className={navLinkClass}
                >
                  <Database size={18} className="mr-3" />
                  {modelName}
                </NavLink>
              ))
            )}
            
            {!loading && dynamicModels.length === 0 && (
              <p className="px-3 text-sm text-gray-400">
                No models published yet.
              </p>
            )}
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
