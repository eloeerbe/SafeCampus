"use client";

// Requirements: 12.1, 12.4, 12.7
import { AlertTriangle, Bell, CheckCircle, RefreshCw, MapPin } from "lucide-react";
import type { Notification } from "@/lib/types";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

// ── Icon + colour per notification type ───────────────────────────────────
function getIconConfig(notification: Notification): {
  Icon: React.ElementType;
  bg: string;
  color: string;
} {
  if (notification.urgency === "urgent") {
    return { Icon: AlertTriangle, bg: "rgba(226,75,74,0.15)", color: "#E24B4A" };
  }
  switch (notification.type) {
    case "report_resolved":
      return { Icon: CheckCircle, bg: "rgba(34,197,94,0.15)", color: "#22c55e" };
    case "status_change":
      return { Icon: RefreshCw, bg: "rgba(234,179,8,0.15)", color: "#eab308" };
    case "new_report":
      return { Icon: MapPin, bg: "rgba(99,102,241,0.15)", color: "#818cf8" };
    default:
      return { Icon: Bell, bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };
  }
}

// ── Relative time helper ───────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1) return "Just now";
  if (mins  < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days  <  2) return "Yesterday";
  return `${days} days ago`;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const { Icon, bg, color } = getIconConfig(notification);
  const isUnread = !notification.read;

  return (
    <button
      onClick={() => onMarkRead(notification.id)}
      className="w-full text-left rounded-xl transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2"
      aria-label={`${isUnread ? "Unread: " : ""}${notification.header}`}
    >
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-4"
        style={{
          background: "var(--color-background-secondary)",
          // Set border shorthand first, then override left side — order matters
          border: isUnread
            ? "1px solid rgba(232,93,38,0.2)"
            : "1px solid rgba(255,255,255,0.08)",
          borderLeftWidth: "3px",
          borderLeftColor: isUnread ? "#E85D26" : "transparent",
        }}
      >
        {/* Colored icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-lg mt-0.5"
          style={{ width: 40, height: 40, background: bg }}
          aria-hidden="true"
        >
          <Icon size={20} style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold leading-snug text-white">
            {notification.header}
          </p>
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {notification.body}
          </p>
          <p
            className="text-[11px] pt-0.5"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {relativeTime(notification.sentAt)}
          </p>
        </div>

        {/* Unread dot */}
        {isUnread && (
          <span
            className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full"
            style={{ background: "#E85D26" }}
            aria-label="Unread"
          />
        )}
      </div>
    </button>
  );
}
