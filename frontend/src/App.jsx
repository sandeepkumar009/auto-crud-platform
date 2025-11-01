import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ModelBuilderPage from './pages/ModelBuilderPage';
import ModelDataPage from './pages/ModelDataPage';

function App() {
  return (
    <Routes>
      {/* Public Route: */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes: */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* These routes are "nested" inside Layout.
            They will be rendered where the <Outlet /> is.
        */}
        <Route index element={<DashboardPage />} />
        <Route path="model-builder" element={<ModelBuilderPage />} />
        <Route path="admin/:modelName" element={<ModelDataPage />} />
      </Route>
      
      {/* Catch-all for 404 Not Found (optional but good) */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;
