import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import { Notification } from '../../types/hcm';
import { Bell, LogOut, Sparkles, User, Check, X } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAIChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, onOpenAIChat }) => {
  const { user, employee, settings, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await ApiClient.getNotifications();
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await ApiClient.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  // 4-5 single-line clean navigation links based on user role
  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'employees', label: 'Directory' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'payroll', label: 'Payroll' },
        { id: 'setup', label: 'Settings' }
      ];
    }
    if (user?.role === 'hr') {
      return [
        { id: 'dashboard', label: 'HR Dashboard' },
        { id: 'employees', label: 'Employees' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'leave', label: 'Leaves' },
        { id: 'payroll', label: 'Payroll' }
      ];
    }
    return [
      { id: 'dashboard', label: 'My Hub' },
      { id: 'attendance', label: 'Check-In' },
      { id: 'leave', label: 'Leave' },
      { id: 'payroll', label: 'Payslips' },
      { id: 'profile', label: 'Profile' }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            onTabChange('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
        >
          {settings?.companyName || 'HCM Lite'}
        </a>
        <span className="text-[11px] font-medium text-slate-400 border-l border-slate-200 pl-2.5 uppercase tracking-wider">
          {user?.role}
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => onTabChange(link.id)}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
              currentTab === link.id
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5'
                : 'text-slate-600'
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-3 shrink-0">
        {/* AI Assistant button */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200/70 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[11px] text-slate-400">{unreadCount} unread</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No notifications yet</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs border ${
                        n.read
                          ? 'bg-slate-50/50 border-slate-100 text-slate-500'
                          : 'bg-indigo-50/50 border-indigo-100 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{n.title}</span>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
              {user?.name || user?.email}
            </div>
            <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
