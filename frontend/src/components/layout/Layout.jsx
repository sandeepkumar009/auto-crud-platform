import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Fixed position) */}
      <Sidebar />
      
      {/* Main Content Area (Scrollable) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Page Content (Scrollable) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="p-8">
            {/* Outlet renders the active nested route (e.g., DashboardPage) */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
