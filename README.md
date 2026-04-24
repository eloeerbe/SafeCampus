# SafeCampus — CSUF Campus Safety Reporting

A fully client-side campus safety and issue-reporting web application for California State University, Fullerton (CSUF). Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, and react-leaflet.

## Quickstart

```bash
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

| Role    | Email                          | Password      |
|---------|--------------------------------|---------------|
| Student | student1@csu.fullerton.edu     | password123   |
| Admin   | admin@csu.fullerton.edu        | admin123      |

Additional student accounts: `student2@csu.fullerton.edu`, `student3@csu.fullerton.edu`, `student4@csu.fullerton.edu` — all use `password123`.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 with custom CSUF design tokens
- **State**: Zustand with localStorage persistence
- **Forms**: react-hook-form + zod
- **Maps**: react-leaflet + leaflet.heat (OpenStreetMap)
- **UI**: shadcn/ui primitives, lucide-react icons, sonner toasts
- **Dates**: date-fns

## Features

- Student registration with CSUF email validation and OTP verification
- Role-based login (student → /dashboard, admin → /admin) with account lockout
- 7-step report submission wizard with photo upload, location picker, and anonymous mode
- Community report feed sorted by upvotes with category filtering
- Interactive heat map with severity-based color gradient
- Admin dashboard with priority/status filters and report resolution
- In-app notification system with unread badges and mark-all-read
- User profile with notification preferences, MFA toggle, and demo data reset
- Full localStorage persistence across page reloads

## Requirement Traceability Matrix

| Requirement | Description | Components / Routes |
|-------------|-------------|---------------------|
| UR-001 | User Registration | `/signup`, `authStore.signup`, `signupSchema` |
| UR-002 | User Login & Auth | `/` (login), `authStore.login`, `loginSchema` |
| UR-003 | OTP Verification & MFA | `/verify`, `OtpInput`, `authStore.verifyOTP`, `otpSchema` |
| UR-004 | Password Reset | `/forgot-password`, `authStore.resetPassword`, `resetPasswordSchema` |
| UR-005 | Report Submission | `/report/new`, `StepperForm`, `PhotoUploader`, `LocationPicker`, `reportsStore.addReport` |
| UR-006 | Report Feed & Sorting | `/dashboard`, `ReportCard`, `reportsStore.getSortedByUpvotes` |
| UR-007 | Report Detail View | `/report/[id]`, `SeverityBadge`, `CategoryBadge`, `StatusBadge` |
| UR-008 | Upvoting Reports | `UpvoteButton`, `reportsStore.upvoteReport` |
| UR-009 | Interactive Heat Map | `/map`, `HeatMap`, `HeatMapInner`, `constants.ts` |
| UR-010 | Admin Dashboard | `/admin`, `AdminReportTable`, `AuthGuard(admin)` |
| UR-011 | Admin Report Resolution | `/admin/report/[id]`, `reportsStore.markResolved`, `notificationStore.push` |
| UR-012 | Notifications | `/notifications`, `NotificationBell`, `NotificationItem`, `notificationStore` |

| Requirement | Description | Components / Routes |
|-------------|-------------|---------------------|
| SR-001 | CSUF email validation | `csuEmailSchema`, `authStore.signup` |
| SR-002 | Account lockout after 3 failures | `authStore.login` |
| SR-003 | Password strength (8+ chars, symbol) | `passwordSchema` |
| SR-004 | 7-digit OTP validation | `otpSchema`, `authStore.verifyOTP` |
| SR-005 | Photo type validation (JPG/PNG only) | `PhotoUploader` |
| SR-006 | Max 3 photos per report | `PhotoUploader`, `reportFormSchema` |
| SR-007 | Anonymous author concealment | `getDisplayName()`, `ReportCard`, `/report/[id]` |
| SR-008 | 5-minute anonymous location delay | `isAnonymousLocationDelayed()`, `HeatMapInner` |
| SR-009 | Report defaults (Open, empty upvotes) | `reportsStore.addReport` |
| SR-010 | Feed sort: upvotes DESC, time tiebreaker | `reportsStore.getSortedByUpvotes` |
| SR-011 | Category filter | `reportsStore.getByCategory`, `/dashboard`, `/map` |
| SR-012 | Severity-to-heat intensity mapping | `severityToIntensity()`, `constants.ts` |
| SR-013 | Heat map gradient (green→red) | `HeatMapInner` |
| SR-014 | Report resolution fields | `reportsStore.markResolved` |
| SR-015 | Resolution notification to author | `/admin/report/[id]`, `notificationStore.push` |
| SR-016 | Notification sort by sentAt DESC | `/notifications` |
| SR-017 | Mark all notifications read | `notificationStore.markAllRead` |
| SR-018 | Route protection & access control | `AuthGuard`, `NavBar` |
| SR-019 | Heat map color density | `HeatMapInner`, `SEVERITY_INTENSITY` |
| SR-020 | Notification preferences persistence | `authStore.updateNotifPrefs` |
| SR-021 | MFA toggle involution | `authStore.toggleMFA` |
| SR-022 | Category/severity enum validation | `reportCategorySchema`, `severitySchema` |
| SR-023 | JSON round-trip for reports | `reportsStore` (Zustand persist) |
| SR-024 | Prevent self-upvote | `reportsStore.upvoteReport`, `UpvoteButton` |
| SR-025 | Upvote idempotence | `reportsStore.upvoteReport` |
| SR-026 | Duplicate signup prevention | `authStore.signup` |
| SR-027 | localStorage persistence | Zustand persist middleware on all stores |
| SR-028 | Store rehydration before render | `StoreInitializer`, `initializeStores` |
| SR-029 | Mock data seeding | `mockData.ts`, `initializeStores` |
| SR-030 | Demo banner dismissal | `DemoBanner`, `uiStore.dismissDemoBanner` |
| SR-031 | Demo data reset | `/profile`, Reset Demo Data button |
| SR-032 | Relative time display | `formatRelativeTime()` (date-fns) |
| SR-033 | Skeleton loading states | `SkeletonLoader` |
| SR-034 | Mobile-first responsive (375px) | Root layout `min-w-[375px]` |
| SR-035 | Notification sound on resolution | `/notifications` (Audio playback) |
| SR-036 | Notification header truncation (60 chars) | `NotificationItem` |

## Project Structure

```
/app          — Next.js 14 App Router pages (12 routes)
/components   — Reusable UI components
/components/ui — shadcn/ui primitives
/lib          — Types, schemas, constants, utilities
/lib/store    — Zustand stores (auth, reports, notifications, UI)
```
