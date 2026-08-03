import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, FolderOpen, Settings, LogOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Templates', path: '/templates', icon: Layers }, // Link to templates list (we will use a page for this if needed, or point to field builder page list)
    { name: 'Sessions', path: '/sessions', icon: FolderOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const widthClass = collapsed ? 'w-[72px]' : 'w-[260px]';

  return (
    <div className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-20 ${widthClass}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-gray-900 tracking-tight">DocExtract</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 mt-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 font-medium">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
