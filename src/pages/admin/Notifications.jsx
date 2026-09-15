import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '../../components/ui/Tabs';
import { AlertTriangle, CreditCard, Flag, Bell, Shield, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/api';
import FeedbackModal from '../../components/ui/FeedbackModal';

const notifTypeInfo = {
  payment: { icon: <CreditCard className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
  dispute: { icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
  user: { icon: <Shield className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
  contract: { icon: <Flag className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  system: { icon: <Bell className="w-5 h-5" />, color: 'bg-slate-100 text-slate-600' },
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  const days = Math.floor(secs / 86400);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
};

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications();
      const list = Array.isArray(data) ? data : data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      console.error('Fetch admin notifications error:', err);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setFeedbackMessage(err?.message || 'Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      setFeedbackMessage(err?.message || 'Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
  ];

  const filtered =
    activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <FeedbackModal open={Boolean(feedbackMessage)} onClose={() => setFeedbackMessage('')} title="Could not update notifications" message={feedbackMessage} variant="error" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Notifications</h1>
          <p className="text-slate-500 mt-1">System alerts and platform events requiring admin attention.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 border-b border-slate-200 bg-slate-50">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm">Loading admin notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-semibold text-slate-700">No admin notifications</p>
            <p className="text-sm text-slate-400 mt-1">All systems are quiet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((note) => {
              const nid = note._id || note.id;
              const typeConfig = notifTypeInfo[note.type] || notifTypeInfo.system;

              return (
                <div
                  key={nid}
                  onClick={() => !note.isRead && handleMarkRead(nid)}
                  className={`p-6 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !note.isRead ? 'bg-indigo-50/25' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}
                  >
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                      <div className="flex items-center gap-3">
                        <h3
                          className={`text-base ${
                            !note.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {note.title}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        {formatTime(note.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        !note.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {note.message || note.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!note.isRead && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(nid);
                      }}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
