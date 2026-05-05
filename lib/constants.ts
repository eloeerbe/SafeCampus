// Requirements 9.1, 9.2, 18.1: Design tokens and configuration constants

import type { Severity } from "./types";

// --- Map Configuration (Req 9.1) ---

export const CSUF_CENTER = { lat: 33.8823, lng: -117.8851 } as const;
export const DEFAULT_MAP_ZOOM = 15;
export const CAMPUS_MAP_MIN_ZOOM = 15;
export const CAMPUS_MAP_MAX_ZOOM = 18;

// Exact rectangular CSUF campus bounds used for panning, fitting, masking, and
// report location validation.
export const CSUF_BOUNDS: [[number, number], [number, number]] = [
  [33.8769, -117.8909], // southwest / bottom-left
  [33.8890, -117.8802], // northeast / top-right
];

// --- Severity-to-Heat Intensity Mapping (Req 9.2) ---

export const SEVERITY_INTENSITY: Record<Severity, number> = {
  Low: 0.25,
  Medium: 0.5,
  High: 0.75,
  Critical: 1.0,
};

// --- Severity-to-Color Mapping (Req 9.2) ---

export const SEVERITY_COLOR: Record<Severity, string> = {
  Low: "#16A34A",
  Medium: "#EAB308",
  High: "#F59E0B",
  Critical: "#DC2626",
};

// --- Route Constants (Req 18.1) ---

export const ROUTES = {
  LOGIN: "/",
  SIGNUP: "/signup",
  VERIFY: "/verify",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  MAP: "/map",
  REPORT_NEW: "/report/new",
  REPORT_DETAIL: "/report/[id]",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  ADMIN: "/admin",
  ADMIN_REPORT_DETAIL: "/admin/report/[id]",
} as const;

// --- Public Routes (Req 18.2) ---

export const PUBLIC_ROUTES: string[] = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.VERIFY,
  ROUTES.FORGOT_PASSWORD,
];

// --- Admin Routes (Req 18.3) ---

export const ADMIN_ROUTES: string[] = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_REPORT_DETAIL,
];
