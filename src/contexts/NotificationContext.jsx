import { createContext, useState, useCallback, useMemo } from "react";

export const NotificationContext = createContext(null);

const STORAGE_KEY = "basauycle-notifications";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      const demo = [
        {
          id: Date.now(),
          title: "Welcome to BASAUYCLE",
          message: "Explore premium bicycles with great deals.",
          type: "info",
          read: false,
          createdAt: Date.now(),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      return demo;
    } catch {
      return [];
    }
  });

  const saveToStorage = useCallback((items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const item = {
        id: Date.now(),
        title: notification.title || "Notification",
        message: notification.message || "",
        type: notification.type || "info",
        read: false,
        createdAt: Date.now(),
        ...notification,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 50);
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage],
  );

  const markAsRead = useCallback(
    (id) => {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage],
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const removeNotification = useCallback(
    (id) => {
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      unreadCount,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
