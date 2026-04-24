// Requirements: 12.1, 12.4, 12.5, 16.3
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification } from "../types";

export interface NotificationState {
  notifications: Notification[];
  push: (notification: Omit<Notification, "id" | "sentAt" | "read">) => void;
  markRead: (notificationId: string) => void;
  markAllRead: (userId: string) => void;
  unreadCount: (userId: string) => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      // Req 12.1: Push notification with generated id, current sentAt, read=false
      push: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          sentAt: new Date().toISOString(),
          read: false,
        };

        set({ notifications: [...get().notifications, newNotification] });
      },

      // Req 12.4: Mark a specific notification as read
      markRead: (notificationId: string) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        });
      },

      // SR-017: Mark all notifications belonging to a userId as read
      markAllRead: (userId: string) => {
        set({
          notifications: get().notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        });
      },

      // Req 12.2: Return count of unread notifications for a userId
      unreadCount: (userId: string) => {
        return get().notifications.filter(
          (n) => n.userId === userId && !n.read
        ).length;
      },
    }),
    {
      name: "notification-storage", // Req 16.3: localStorage key
    }
  )
);
