"use client";

// Requirements: 12.1, 12.4, 12.7
import { AlertTriangle, Bell } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Notification } from "@/lib/types";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = notification.urgency === "urgent" ? AlertTriangle : Bell;
  const truncatedHeader =
    notification.header.length > 60
      ? notification.header.slice(0, 60) + "…"
      : notification.header;

  return (
    <button
      onClick={() => onMarkRead(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", notification.urgency === "urgent" ? "text-warning" : "text-gray-400")}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{notification.category}</span>
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-sm font-medium truncate">{truncatedHeader}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
      </div>
    </button>
  );
}
