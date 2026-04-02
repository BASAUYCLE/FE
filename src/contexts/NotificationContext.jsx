import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuthOptional } from "./AuthContext";

import { NotificationContext } from "./NotificationContextBase";

const STORAGE_KEY_PREFIX = "basauycle-notifications";

function normalizeUserId(user) {
  return user?.id ?? user?.userId ?? user?.user_id ?? user?.email ?? null;
}

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

function loadFromStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // ignore
  }
  return [];
}

export function NotificationProvider({ children }) {
  const auth = useAuthOptional();
  const userId = normalizeUserId(auth?.user ?? null);
  const storageKey = getStorageKey(userId);

  const [notifications, setNotifications] = useState(() => {
    const items = loadFromStorage(storageKey);
    if (items.length > 0) return items;

    // Seed a welcome notification only for "guest" storage to avoid
    // polluting each user's inbox with duplicated demo content.
    if (!userId) {
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
      try {
        localStorage.setItem(storageKey, JSON.stringify(demo));
      } catch {
        // ignore
      }
      return demo;
    }
    return [];
  });

  useEffect(() => {
    // When user changes (login/logout/switch account), load the correct inbox.
    setNotifications(loadFromStorage(storageKey));
  }, [storageKey]);

  const saveToStorage = useCallback(
    (items) => {
      localStorage.setItem(storageKey, JSON.stringify(items));
    },
    [storageKey],
  );

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
