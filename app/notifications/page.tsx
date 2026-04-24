"use client";

// Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
import { AuthGuard } from "@/components/AuthGuard";
import { NotificationItem } from "@/components/NotificationItem";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useAuthStore } from "@/lib/store/authStore";

export default function NotificationsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const userId = currentUser?.id ?? "";

  // SR-016: Notifications for current user sorted by sentAt DESC
  const userNotifications = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleMarkRead = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);

    // SR-035: Play soft success sound on report_resolved notification
    if (notification && notification.type === "report_resolved" && !notification.read) {
      // Placeholder for notification sound — in production, use: new Audio('/notification.mp3').play()
      try {
        new Audio("/notification.mp3").play().catch(() => {});
      } catch {
        // Audio playback not available
      }
    }

    markRead(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllRead(userId);
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {userNotifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-1">
            {userNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
