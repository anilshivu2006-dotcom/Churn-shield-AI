import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SinglePrediction from './pages/SinglePrediction';
import Datasets from './pages/Datasets';
import Reports from './pages/Reports';
import Landing from './pages/Landing';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Main App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<SinglePrediction />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/reports" element={<Reports />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;