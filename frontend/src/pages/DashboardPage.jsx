import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Database, Plus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [modelCount, setModelCount] = useState(0);

  useEffect(() => {
    // Fetch the count of models to display as a stat
    api.get('/models')
      .then(response => {
        setModelCount(response.data.length);
      })
      .catch(err => console.error('Failed to fetch model count:', err));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome back, {user?.email}!
      </h1>
      <p className="text-lg text-gray-600">
        This is your central hub for the Auto-Generated CRUD platform.
      </p>

      {/* --- Stats --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Published Models Card */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Published Models</p>
              <p className="text-3xl font-bold text-gray-800">{modelCount}</p>
            </div>
            <Database size={24} className="text-indigo-500" />
          </div>
        </div>
        
        {/* User Role Card */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Your Role</p>
              <p className="text-3xl font-bold text-gray-800">{user?.role}</p>
            </div>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>

        {/* Quick Action Card (for Admins) */}
        {user?.role === 'Admin' && (
          <div className="p-6 bg-indigo-600 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold">Ready to build?</h3>
            <p className="mt-1 text-sm text-indigo-100">
              Create a new data model and generate its APIs instantly.
            </p>
            <Link 
              to="/model-builder" 
              className="inline-block px-4 py-2 mt-4 font-medium bg-white rounded-md text-indigo-700 hover:bg-indigo-50"
            >
              <Plus size={18} className="inline-block mr-2 -mt-1" />
              Build a Model
            </Link>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default DashboardPage;

