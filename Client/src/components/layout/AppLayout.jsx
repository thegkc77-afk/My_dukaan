import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastNotification } from '../common/ToastNotification';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Persistent Toast Notifications */}
      <ToastNotification />
    </div>
  );
};
