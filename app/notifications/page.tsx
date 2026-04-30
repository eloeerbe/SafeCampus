"use client";

// Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
import { AuthGuard } from "@/components/AuthGuard";
import { NotificationItem } from "@/components/NotificationItem";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useAuthStore } from "@/lib/store/authStore";

export default function NotificationsPage() {
  const currentUser  = useAuthStore((s) => s.currentUser);
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead     = useNotificationStore((s) => s.markRead);
  const markAllRead  = useNotificationStore((s) => s.markAllRead);

  const userId = currentUser?.id ?? "";

  // SR-016: Notifications for current user sorted by sentAt DESC
  const userNotifications = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleMarkRead = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);

    // SR-035: Play soft success sound on report_resolved notification
    if (notification?.type === "report_resolved" && !notification.read) {
      try {
        new Audio("/notification.mp3").play().catch(() => {});
      } catch {
        // Audio playback not available
      }
    }

    markRead(notificationId);
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-6">

        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead(userId)}
              className="text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] rounded"
              style={{ color: "#E85D26" }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* ── Empty state ── */}
        {userNotifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              background: "var(--color-background-secondary)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "48px 32px",
              minHeight: "240px",
            }}
            role="status"
            aria-label="No notifications"
          >
            {/* Outline bell SVG — 48px */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4"
              style={{ color: "rgba(255,255,255,0.25)" }}
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            <p className="text-base font-bold mb-1">You&apos;re all caught up</p>
            <p
              className="text-sm max-w-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              New reports matching your notification preferences will appear here.
            </p>
          </div>
        ) : (
          /* ── Notification cards ── */
          <div className="flex flex-col gap-2">
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
