// Requirement 14.1: All data types defined in /lib/types.ts

// Enums / Union Types
export type UserRole = "student" | "admin";
export type ReportCategory = "Safety" | "Maintenance" | "Harassment" | "Lost & Found" | "Other";
export type ReportStatus = "Open" | "In Progress" | "Resolved";
export type Severity = "Low" | "Medium" | "High" | "Critical";
export type NotifType = "report_resolved" | "new_report" | "urgent_alert" | "status_change";
export type Urgency = "urgent" | "non_urgent";

// Core Interfaces
export interface User {
  id: string;
  name: string;
  email: string; // must end with @csu.fullerton.edu
  passwordHash: string;
  role: UserRole;
  avatar: string; // URL or placeholder
  isVerified: boolean;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null; // ISO timestamp or null
  notificationPrefs: NotificationPrefs;
  language: "en" | "es";
  publicProfile: boolean;
  locationPermission: boolean;
  createdAt: string; // ISO timestamp
}

export interface NotificationPrefs {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  categories: {
    safety: boolean;
    maintenance: boolean;
    harassment: boolean;
    lostAndFound: boolean;
    other: boolean;
  };
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: Severity;
  status: ReportStatus;
  location: {
    lat: number;
    lng: number;
    areaName: string;
  };
  photos: Photo[];
  isAnonymous: boolean;
  authorId: string;
  upvotedBy: string[]; // array of userIds
  submittedAt: string; // ISO timestamp
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
}

export interface Photo {
  id: string;
  url: string; // dataUrl or picsum URL
  fileType: "image/jpeg" | "image/png";
  uploadedAt: string; // ISO timestamp
}

export interface Notification {
  id: string;
  userId: string;
  type: NotifType;
  urgency: Urgency;
  category: string;
  header: string;
  body: string;
  read: boolean;
  sentAt: string; // ISO timestamp
  reportId?: string; // optional link to related report
}
