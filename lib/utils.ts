// Requirements 5.5, 5.8, 9.2, 19.3: Helper/utility functions

import { formatDistanceToNow } from "date-fns";
import type { Severity } from "./types";
import { SEVERITY_INTENSITY } from "./constants";

/**
 * Maps a severity level to its heat intensity value.
 * SR-012: Low=0.25, Medium=0.5, High=0.75, Critical=1.0
 */
export function severityToIntensity(severity: Severity): number {
  return SEVERITY_INTENSITY[severity];
}

/**
 * Returns "Anonymous" when isAnonymous is true, otherwise returns the author's name.
 * SR-007: anonymous report author concealment
 */
export function getDisplayName(authorName: string, isAnonymous: boolean): string {
  return isAnonymous ? "Anonymous" : authorName;
}

/**
 * Returns true if the report is anonymous AND was submitted less than 5 minutes ago.
 * SR-008: 5-minute location delay for anonymous reports on heat map
 */
export function isAnonymousLocationDelayed(isAnonymous: boolean, submittedAt: string): boolean {
  if (!isAnonymous) return false;
  const fiveMinutesMs = 5 * 60 * 1000;
  const submittedTime = new Date(submittedAt).getTime();
  const now = Date.now();
  return now - submittedTime < fiveMinutesMs;
}

/**
 * Formats a date string as a relative time string (e.g., "2 hours ago").
 * SR-032: relative time display using date-fns
 */
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}
