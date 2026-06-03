import { useState, useEffect, useRef } from 'react';
import {
  HiOutlineBell, HiOutlineMail, HiOutlineBriefcase,
  HiOutlineLightningBolt, HiOutlineCheckCircle, HiOutlineTrash,
  HiOutlineCheck, HiOutlineX, HiOutlineCalendar, HiOutlineSparkles
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace('/api', '');

const TYPE_CONFIG = {
  APPLICATION_RECEIVED:     { icon: '📋', color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  APPLICATION_STATUS_CHANGE:{ icon: '🚀', color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  INTERVIEW_SCHEDULED:      { icon: '📅', color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  NEW_JOB_MATCH:            { icon: '⚡', color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
  MESSAGE:                  { icon: '💬', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  SYSTEM:                   { icon: '🔔', color: 'text-slate-400',   bg: 'bg-slate-500/10' },
};

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ limit: 25 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Socket.io for real-time notification push
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.emit('join', user._id);

    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev.slice(0, 24)]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('notification_count_update', ({ unreadCount: count }) => {
      setUnreadCount(count);
    });

    return () => socket.disconnect();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { /* silent */ }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notifications cleared');
    } catch { /* silent */ }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      const n = notifications.find(n => n._id === id);
      if (!n?.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const cfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.SYSTEM;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
        className="relative p-2.5 rounded-xl bg-slate-800 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all"
      >
        <HiOutlineBell size={18} />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+10px)] w-[380px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black rounded-full uppercase">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors flex items-center gap-1">
                    <HiOutlineCheck size={10} /> Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => {
                  const c = cfg(n.type);
                  return (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                      className={`flex items-start gap-3 px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative ${!n.isRead ? 'bg-indigo-500/5' : ''}`}
                    >
                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0 text-base`}>
                        {c.icon}
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-xs font-bold truncate mb-0.5 ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[9px] text-slate-600 mt-1 font-bold">{timeAgo(n.createdAt)}</p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400"
                      >
                        <HiOutlineX size={12} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center mb-3">
                    <HiOutlineBell size={24} className="text-slate-600" />
                  </div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">All caught up!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-slate-950/50">
                <button onClick={handleClearAll}
                  className="text-[9px] font-black text-slate-500 hover:text-red-400 uppercase tracking-wider transition-colors flex items-center gap-1">
                  <HiOutlineTrash size={10} /> Clear all
                </button>
                <Link to="/profile/edit" onClick={() => setIsOpen(false)}
                  className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">
                  Notification Settings →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
