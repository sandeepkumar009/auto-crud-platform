import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard!</h1>
      <p className="mt-2 text-lg text-gray-700">
        You are logged in as: <strong>{user?.email}</strong> (Role: {user?.role})
      </p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Log Out
      </button>
    </div>
  );
};

export default DashboardPage;
