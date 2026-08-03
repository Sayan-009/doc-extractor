import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';
import Toast from '../ui/Toast';

const AppLayout = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    // Ideally you'd only call checkAuth if you haven't yet, but doing it on mount is fine for this demo
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed);
  }, [collapsed]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-500 font-medium">Loading DocExtract...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const marginLeft = collapsed ? 'ml-[72px]' : 'ml-[260px]';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${marginLeft}`}>
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
