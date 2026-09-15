import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { messageService, notificationService } from '../services/api';
import { useAuth } from './AuthContext';

const BadgeContext = createContext(null);

export const BadgeProvider = ({ children }) => {
  const { user } = useAuth();

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadTypes, setUnreadTypes] = useState({
    proposal: false,
    contract: false,
    payment: false,
    job: false,
    dispute: false,
    system: false
  });

  // Track attended paths in state & localStorage
  const [attendedPaths, setAttendedPaths] = useState(() => {
    try {
      const saved = localStorage.getItem('attended_sidebar_paths');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchBadgeData = useCallback(async () => {
    if (!user) {
      setUnreadMessagesCount(0);
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      // 1. Fetch unread messages count across all conversations
      const conversations = await messageService.getConversations().catch(() => []);
      if (Array.isArray(conversations)) {
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnread);
      }
    } catch (err) {
      console.error('Error fetching unread messages count:', err);
    }

    try {
      // 2. Fetch notifications count & categories
      const res = await notificationService.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 }));
      const notifications = res?.notifications || (Array.isArray(res) ? res : []);
      const count = res?.unreadCount !== undefined ? res.unreadCount : notifications.filter(n => !n.isRead).length;
      setUnreadNotificationsCount(count);

      // Analyze unread notification types to mark unattended tabs
      const unreadNotifs = notifications.filter(n => !n.isRead);
      const types = {
        proposal: unreadNotifs.some(n => n.type === 'proposal' || n.relatedType === 'Proposal'),
        contract: unreadNotifs.some(n => n.type === 'contract' || n.relatedType === 'Contract'),
        payment: unreadNotifs.some(n => n.type === 'payment' || n.relatedType === 'Payment'),
        job: unreadNotifs.some(n => n.type === 'job' || n.relatedType === 'Job'),
        dispute: unreadNotifs.some(n => n.type === 'dispute' || n.relatedType === 'Dispute'),
        system: unreadNotifs.some(n => n.type === 'system')
      };
      setUnreadTypes(types);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchBadgeData();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchBadgeData, 10000);
    return () => clearInterval(interval);
  }, [fetchBadgeData]);

  const markPathAttended = (path) => {
    setAttendedPaths((prev) => {
      const updated = { ...prev, [path]: Date.now() };
      try {
        localStorage.setItem('attended_sidebar_paths', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const hasUnattendedBadge = (path, name) => {
    const lowerName = name.toLowerCase();

    // Messages tab: ALWAYS show indicator as long as unreadMessagesCount > 0
    if (lowerName.includes('message')) {
      return unreadMessagesCount > 0;
    }

    // Notifications tab: show if unreadNotificationsCount > 0
    if (lowerName.includes('notification')) {
      return unreadNotificationsCount > 0;
    }

    // Category-specific unattended dots based on unread notification types
    if (lowerName.includes('proposal') && unreadTypes.proposal) {
      return !attendedPaths[path];
    }
    if (lowerName.includes('contract') && unreadTypes.contract) {
      return !attendedPaths[path];
    }
    if (lowerName.includes('payment') && unreadTypes.payment) {
      return !attendedPaths[path];
    }
    if (lowerName.includes('dispute') && unreadTypes.dispute) {
      return !attendedPaths[path];
    }
    if (lowerName.includes('job') && unreadTypes.job) {
      return !attendedPaths[path];
    }

    return false;
  };

  return (
    <BadgeContext.Provider value={{
      unreadMessagesCount,
      unreadNotificationsCount,
      unreadTypes,
      hasUnattendedBadge,
      markPathAttended,
      refreshBadges: fetchBadgeData
    }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadges = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    return {
      unreadMessagesCount: 0,
      unreadNotificationsCount: 0,
      hasUnattendedBadge: () => false,
      markPathAttended: () => {},
      refreshBadges: () => {}
    };
  }
  return context;
};

export default BadgeContext;
