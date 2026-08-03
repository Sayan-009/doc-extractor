import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCircle, FileText, Mail, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sessionService } from '../../services/sessionService';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState([]);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/sessions')) return 'Sessions';
    if (path.startsWith('/templates')) return 'Templates';
    if (path.startsWith('/settings')) return 'Settings';
    return 'DocExtract';
  };

  // Fetch sessions for activity feed
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const sessions = await sessionService.getSessions();
        const recentActivities = sessions.slice(0, 5).map(s => ({
          type: s.total_processed > 0 ? 'extraction' : 'success',
          description: s.total_processed > 0
            ? `Extracted ${s.total_processed} doc(s) in "${s.session_name}"`
            : `Session "${s.session_name}" is active`,
          time: s.last_processed_at
            ? new Date(s.last_processed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : new Date(s.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setActivities(recentActivities);
      } catch {
        // Silently fail — notifications are not critical
      }
    };
    fetchActivities();
  }, [location.pathname]); // Refresh when navigating

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
        {getPageTitle()}
      </h1>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8 px-4">
                    No recent activity to show.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="mt-0.5 flex-shrink-0">
                          {activity.type === 'extraction' && <FileText className="w-4 h-4 text-indigo-500" />}
                          {activity.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                          {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 leading-snug">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium cursor-pointer ring-2 ring-transparent hover:ring-indigo-200 transition-all">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
