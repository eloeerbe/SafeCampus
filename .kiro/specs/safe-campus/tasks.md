# Implementation Plan: SafeCampus

## Overview

Incremental implementation of the SafeCampus Next.js 14 App Router application — a fully client-side campus safety reporting platform for CSUF. Tasks progress from foundational types and configuration through Zustand stores, UI components, page routes, and finally integration wiring. All state is mocked via Zustand + localStorage with no external backend.

## Tasks

- [x] 1. Set up project foundation, types, schemas, and constants
  - [x] 1.1 Initialize Next.js 14 project with TypeScript, Tailwind CSS v3, and configure custom design tokens
    - Create `tailwind.config.ts` with custom colors: primary "#00244D", accent "#FF7900", danger "#DC2626", warning "#F59E0B", caution "#EAB308", safe "#16A34A"
    - Configure Inter font via `next/font/google` in root layout with body 14px, h1 24px, h2 18px
    - Set border-radius tokens: lg (8px) for Cards, md (6px) for Inputs
    - Set shadow tokens: shadow-sm for Cards, shadow-md for modals/dialogs
    - Install dependencies: zustand, react-leaflet, leaflet, leaflet.heat, react-hook-form, zod, @hookform/resolvers, lucide-react, sonner, date-fns, shadcn/ui primitives
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [x] 1.2 Create `/lib/types.ts` with all TypeScript interfaces and type aliases
    - Define UserRole, ReportCategory, ReportStatus, Severity, NotifType, Urgency union types
    - Define User, NotificationPrefs, Report, Photo, Notification interfaces exactly as specified in design
    - _Requirements: 14.1_

  - [x] 1.3 Create `/lib/schemas.ts` with all zod validation schemas
    - Implement csuEmailSchema, passwordSchema, otpSchema, reportFormSchema, signupSchema, loginSchema, resetPasswordSchema
    - Ensure error messages match requirements exactly ("Only CSUF emails are allowed", "Password must be at least 8 characters and include a symbol", "Invalid verification code.", etc.)
    - _Requirements: 1.2, 1.4, 3.3, 4.5, 5.3, 14.2, 14.3, 20.1_

  - [ ]* 1.4 Write property tests for zod schemas (Properties 1, 2, 3, 7, 10, 21)
    - **Property 1: CSUF Email Validation** — Generate random strings, verify csuEmailSchema accepts iff ends with @csu.fullerton.edu
    - **Validates: Requirements 1.2**
    - **Property 2: Password Strength Validation** — Generate random strings, verify passwordSchema accepts iff ≥8 chars with symbol
    - **Validates: Requirements 1.4**
    - **Property 3: Required Field Validation** — Generate form inputs with random missing fields, verify schemas reject with correct field list
    - **Validates: Requirements 1.5, 2.4, 5.3, 20.4**
    - **Property 7: OTP Validation** — Generate random strings, verify otpSchema accepts iff exactly 7 numeric digits
    - **Validates: Requirements 3.2, 3.3, 4.5**
    - **Property 10: Photo Type Validation** — Generate random MIME type strings, verify only jpeg/png accepted
    - **Validates: Requirements 5.4, 5.6**
    - **Property 21: Category and Severity Enum Validation** — Generate random strings, verify category/severity schemas accept only valid enum values
    - **Validates: Requirements 14.2, 14.3**

  - [x] 1.5 Create `/lib/constants.ts` with design tokens and configuration
    - Define CSUF_CENTER coordinates (33.8823, -117.8851), map zoom level, severity-to-heat intensity mapping, severity-to-color mapping
    - Define route constants for all 12 routes, public routes list, admin routes list
    - _Requirements: 9.1, 9.2, 18.1_

  - [x] 1.6 Create `/lib/utils.ts` with helper functions
    - Implement severityToIntensity mapping (Low=0.25, Medium=0.5, High=0.75, Critical=1.0)
    - Implement getDisplayName function returning "Anonymous" when isAnonymous is true
    - Implement isAnonymousLocationDelayed function (5-minute delay check)
    - Implement relative time formatting using date-fns formatDistanceToNow
    - _Requirements: 5.5, 5.8, 9.2, 19.3_

  - [ ]* 1.7 Write property tests for utility functions (Properties 11, 12)
    - **Property 11: Anonymous Report Author Concealment** — Generate anonymous reports, verify display name is always "Anonymous"
    - **Validates: Requirements 5.5, 7.3**
    - **Property 12: Anonymous Report Location Delay** — Generate anonymous reports with various timestamps, verify 5-min delay filter
    - **Validates: Requirements 5.8**

- [x] 2. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement Zustand stores with localStorage persistence
  - [x] 3.1 Implement `authStore` in `/lib/store/authStore.ts`
    - Implement login with credential validation, role-based redirect logic, failedLoginAttempts tracking, and 15-minute lockout after 3 failures
    - Implement signup with CSUF email validation, duplicate email check, and new user creation
    - Implement verifyOTP accepting any 7-digit numeric string
    - Implement resetPassword with OTP validation and password update
    - Implement logout clearing currentUser
    - Implement toggleMFA inverting mfaEnabled
    - Implement updateProfile and updateNotifPrefs
    - Configure Zustand persist middleware with localStorage
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.5, 2.6, 3.2, 4.4, 13.2, 13.3, 16.1_

  - [ ]* 3.2 Write property tests for authStore (Properties 4, 5, 6, 8, 19, 20)
    - **Property 4: Successful Login Sets Session** — Generate valid user credentials, verify login sets currentUser and role determines redirect
    - **Validates: Requirements 2.1, 2.2**
    - **Property 5: Failed Login Increments Counter** — Generate wrong passwords for existing users, verify counter increments without granting access
    - **Validates: Requirements 2.3**
    - **Property 6: Account Lockout After Three Failed Attempts** — Generate users, fail 3 times, verify lockout; attempt login while locked, verify rejection
    - **Validates: Requirements 2.5, 2.6**
    - **Property 8: Duplicate Signup Prevention** — Generate existing users, attempt re-signup, verify rejection with correct error message
    - **Validates: Requirements 1.3**
    - **Property 19: Notification Preferences Persistence** — Generate random NotificationPrefs, update and read back, verify equivalence
    - **Validates: Requirements 13.2**
    - **Property 20: MFA Toggle Involution** — Generate users with random mfaEnabled, toggle twice, verify original restored
    - **Validates: Requirements 13.3**

  - [x] 3.3 Implement `reportsStore` in `/lib/store/reportsStore.ts`
    - Implement addReport setting status "Open", empty upvotedBy, current timestamp for submittedAt, null for resolvedAt/resolvedBy/resolutionNotes
    - Implement upvoteReport with idempotence check (no duplicate entries) and self-upvote prevention (authorId !== userId)
    - Implement removeUpvote
    - Implement markResolved setting status "Resolved", resolvedAt, resolvedBy, resolutionNotes
    - Implement getByCategory returning filtered reports
    - Implement getSortedByUpvotes with descending upvote count and submittedAt tiebreaker
    - Configure Zustand persist middleware with localStorage
    - _Requirements: 5.2, 6.1, 6.2, 6.3, 8.1, 8.2, 8.5, 11.2, 16.2_

  - [ ]* 3.4 Write property tests for reportsStore (Properties 9, 13, 14, 15, 22)
    - **Property 9: Report Creation Defaults** — Generate valid report data, call addReport, verify status "Open", empty upvotedBy, valid submittedAt, null resolved fields
    - **Validates: Requirements 5.2**
    - **Property 13: Report Feed Sorting** — Generate report arrays with random upvote counts and timestamps, verify sort order (upvotes DESC, submittedAt DESC tiebreaker)
    - **Validates: Requirements 6.1, 6.2**
    - **Property 14: Category Filter** — Generate report arrays and random category, verify getByCategory returns only matching reports
    - **Validates: Requirements 6.3, 9.5**
    - **Property 15: Upvote Idempotence and Self-Upvote Prevention** — Generate user/report combos, verify upvote adds once, rejects duplicates, prevents self-upvote
    - **Validates: Requirements 8.1, 8.2, 8.5**
    - **Property 22: Report JSON Round-Trip** — Generate valid Report objects, JSON.parse(JSON.stringify(report)), verify deep equality
    - **Validates: Requirements 14.4, 16.5**

  - [x] 3.5 Implement `notificationStore` in `/lib/store/notificationStore.ts`
    - Implement push adding notification with generated id, current sentAt, read=false
    - Implement markRead setting read=true for a specific notification
    - Implement markAllRead setting read=true for all notifications belonging to a userId
    - Implement unreadCount returning count of unread notifications for a userId
    - Configure Zustand persist middleware with localStorage
    - _Requirements: 12.1, 12.4, 12.5, 16.3_

  - [ ]* 3.6 Write property tests for notificationStore (Properties 17, 18)
    - **Property 17: Notification Sorting** — Generate notification arrays, verify sorted by sentAt DESC
    - **Validates: Requirements 12.3**
    - **Property 18: Mark All Read** — Generate mixed read/unread notifications, call markAllRead, verify all belonging to user are read; other users' notifications unchanged
    - **Validates: Requirements 12.5**

  - [x] 3.7 Implement `uiStore` in `/lib/store/uiStore.ts`
    - Implement setMapFilters, setFeedFilter, setActiveModal, dismissDemoBanner
    - Configure Zustand persist middleware with localStorage (demoBannerDismissed only persists per session)
    - _Requirements: 6.3, 9.5, 19.2_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create mock data seed file and store initialization
  - [x] 5.1 Create `/lib/mockData.ts` with seed data
    - Define 4 Student users and 1 Admin user with all User fields populated
    - Define 10 reports at CSUF campus coordinates: 8 "Open", 1 "In Progress", 1 "Resolved" with a mix of categories and severities
    - Ensure the 10 seeded reports include at least 3 High, 3 Medium, and 3 Low priority values so the admin priority filter demo is populated
    - Define 6 notifications with a mix of types and urgencies
    - Use picsum.photos placeholder URLs for report photos
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 5.2 Implement store initialization logic with localStorage-first loading
    - In each store, check localStorage for existing data before seeding with mockData
    - If persisted data exists, load from localStorage; otherwise seed with mockData
    - _Requirements: 15.5, 16.4_

  - [ ]* 5.3 Write property test for localStorage persistence (Property 23)
    - **Property 23: LocalStorage Persistence Does Not Overwrite Existing Data** — Pre-populate localStorage, initialize store, verify persisted data preserved
    - **Validates: Requirements 15.5**

- [x] 6. Implement shared UI components
  - [x] 6.1 Create shadcn/ui primitives in `/components/ui/`
    - Set up Button, Card, Dialog, Input, Badge, Tabs, Select, Textarea, Avatar, Switch components via shadcn/ui CLI or manual creation
    - Apply shadow-sm to Card, shadow-md to Dialog, border-radius lg to Card, md to Input
    - _Requirements: 17.3, 17.4_

  - [x] 6.2 Implement `AuthGuard` component in `/components/AuthGuard.tsx`
    - Read currentUser from authStore; redirect unauthenticated users to /
    - If requiredRole is "admin" and user role is "student", redirect to /dashboard
    - Allow admins to access student routes: Admin users CAN access /dashboard, /map, /report/new — only Student users are redirected away from /admin routes. This satisfies Req 18.4
    - _Requirements: 18.2, 18.3, 18.4_

  - [ ]* 6.3 Write property tests for AuthGuard logic (Properties 24, 25)
    - **Property 24: Unauthenticated Access Redirect** — Generate unauthenticated state + protected routes, verify redirect to /
    - **Validates: Requirements 18.2**
    - **Property 25: Admin Route Access Control** — Generate student users + admin routes, verify redirect to /dashboard; admin users get access
    - **Validates: Requirements 10.6, 18.3**

  - [x] 6.4 Implement `DemoBanner` component in `/components/DemoBanner.tsx`
    - Display dismissible banner at top of every page indicating demo mode
    - On dismiss, set demoBannerDismissed in uiStore; hide for remainder of session
    - _Requirements: 19.1, 19.2_

  - [x] 6.5 Implement `ReportCard` component in `/components/ReportCard.tsx`
    - Render title, CategoryBadge, SeverityBadge, StatusBadge, upvote count, relative time (date-fns), author name or "Anonymous"
    - Include UpvoteButton with self-upvote prevention (disabled when authorId === currentUserId)
    - _Requirements: 6.5, 8.5_

  - [x] 6.6 Implement badge components: `SeverityBadge`, `CategoryBadge`, `StatusBadge`
    - SeverityBadge: color-coded by severity (safe/caution/warning/danger)
    - CategoryBadge: label badge for report category
    - StatusBadge: label badge for report status
    - _Requirements: 6.5, 9.2_

  - [x] 6.7 Implement `UpvoteButton` component in `/components/UpvoteButton.tsx`
    - On click: if not already upvoted and not self-authored, add userId to upvotedBy
    - If already upvoted, show toast "You have already upvoted this report"
    - If report no longer exists, show toast "This report is no longer available"
    - Disable button when authorId === currentUserId
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 6.8 Implement `PhotoUploader` component in `/components/PhotoUploader.tsx`
    - Accept only image/jpeg and image/png; reject others with toast "Only JPG and PNG files are accepted"
    - Convert files to dataUrl via FileReader
    - Enforce max 3 photos; show toast "Maximum 3 photos per report" and disable upload beyond limit
    - _Requirements: 5.4, 5.6, 5.7_

  - [x] 6.9 Implement `LocationPicker` component in `/components/LocationPicker.tsx`
    - Render react-leaflet MapContainer centered on CSUF coordinates
    - Allow user to click map to select location (lat, lng, areaName)
    - _Requirements: 5.1 (step 4)_

  - [x] 6.10 Implement `OtpInput` component in `/components/OtpInput.tsx`
    - Render 7 individual digit input boxes with auto-focus on next box
    - Call onComplete when all 7 digits entered
    - Display error message when provided
    - _Requirements: 3.1_

  - [x] 6.11 Implement `StepperForm` component in `/components/StepperForm.tsx`
    - 7-step wizard: (1) Title & Description, (2) Category, (3) Severity, (4) Location, (5) Photos, (6) Privacy/Anonymous toggle, (7) Review & Submit
    - Each step validates via zod before allowing progression
    - Integrate react-hook-form with @hookform/resolvers/zod
    - _Requirements: 5.1, 5.2, 5.3, 20.1, 20.2, 20.3_

  - [x] 6.12 Implement `NotificationBell` component in `/components/NotificationBell.tsx`
    - Display bell icon (lucide-react) with red badge showing unreadCount when > 0
    - Navigate to /notifications on click
    - _Requirements: 12.2_

  - [x] 6.13 Implement `NotificationItem` component in `/components/NotificationItem.tsx`
    - Display icon (AlertTriangle for urgent, Bell for non_urgent) → category → header → body
    - Enforce layout order: icon → category → header, with header truncated to 60 characters max per SR-036
    - Visually distinguish unread from read notifications
    - On click, mark notification as read
    - _Requirements: 12.1, 12.4, 12.7_

  - [x] 6.14 Implement `SkeletonLoader` component in `/components/SkeletonLoader.tsx`
    - Provide skeleton placeholders for loading states across pages
    - _Requirements: 17.6_

  - [x] 6.15 Implement `HeatMap` component in `/components/HeatMap.tsx`
    - Render react-leaflet MapContainer centered on CSUF (33.8823, -117.8851) with OpenStreetMap tiles
    - Generate leaflet.heat heat layer from non-resolved reports with severity-based intensity
    - Filter out reports with status === 'Resolved' from the heat layer; resolved reports never appear on the map
    - Apply color gradient: green → yellow → orange → red
    - Filter out anonymous reports within 5-minute delay window
    - Support category and severity filters
    - Show popup on cluster/marker click with report title, category, severity, and link to detail
    - Show "No active reports to display" overlay when no reports match
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 6.16 Implement `AdminReportTable` component in `/components/AdminReportTable.tsx`
    - Render table with columns: title, category, severity, status, submission date, priority
    - Support priority filter (High/Medium/Low), status filter (All/Open/In Progress/Resolved), and date sort toggle
    - Display clickable photo thumbnails for reports with photos
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement page routes — Authentication pages
  - [x] 8.1 Implement Login page at `/app/page.tsx`
    - Render login form with email and password fields using react-hook-form + loginSchema
    - On valid student login, redirect to /dashboard; on valid admin login, redirect to /admin
    - On MFA-enabled user login, redirect to /verify
    - Display inline errors for validation failures and wrong credentials
    - Display account lockout message with remaining time
    - Include links to /signup and /forgot-password
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.4, 20.1, 20.2, 20.3_

  - [x] 8.2 Implement Signup page at `/app/signup/page.tsx`
    - Render signup form with name, email, password fields using react-hook-form + signupSchema
    - Validate CSUF email, password strength, duplicate email
    - On success, create user in authStore and navigate to /verify
    - Display inline errors matching exact requirement messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 20.1, 20.2, 20.3_

  - [x] 8.3 Implement OTP Verification page at `/app/verify/page.tsx`
    - Render OtpInput component with 7-digit input
    - On valid OTP, mark user as isVerified in authStore and redirect to /dashboard
    - Display error "Invalid verification code." for invalid input
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 8.4 Implement Forgot Password page at `/app/forgot-password/page.tsx`
    - Step 1: Email input — show confirmation message regardless of email existence, then show OTP input
    - Step 2: OTP validation — on valid 7-digit OTP, show new password form
    - Step 3: New password + confirm password — validate strength, update passwordHash in authStore, redirect to login
    - Display inline errors for empty email, invalid OTP, weak password
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Implement page routes — Student pages
  - [x] 9.1 Implement Dashboard page at `/app/dashboard/page.tsx`
    - Wrap with AuthGuard
    - Display list of ReportCard components for all non-resolved reports sorted by upvotes (getSortedByUpvotes)
    - Implement category filter dropdown; update feedFilter in uiStore
    - Show placeholder message when no reports match filter
    - Re-sort feed when upvote counts change
    - Include a floating action button (FAB, bottom-right, fixed position) labeled "+ New Report" linking to /report/new
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.4_

  - [x] 9.2 Implement Report Submission page at `/app/report/new/page.tsx`
    - Wrap with AuthGuard (student only, verified)
    - Render StepperForm component
    - On submit, call addReport in reportsStore and redirect to /dashboard
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 9.3 Implement Report Detail page at `/app/report/[id]/page.tsx`
    - Wrap with AuthGuard
    - Display full report details: title, description, category, severity, status, location areaName, submission time, photos, upvote count
    - Show "Report not found" with link to dashboard for non-existent reportId
    - Show "Anonymous" for anonymous reports
    - Include UpvoteButton
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.5_

  - [x] 9.4 Implement Map page at `/app/map/page.tsx`
    - Wrap with AuthGuard
    - Render HeatMap component with reports from reportsStore
    - Wire category and severity filters from uiStore
    - Heat layer updates reactively when new reports are added
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 9.5 Implement Notifications page at `/app/notifications/page.tsx`
    - Wrap with AuthGuard
    - Display all notifications for current user sorted by sentAt DESC
    - Visually distinguish unread from read
    - On notification click, mark as read
    - Implement "Mark all as read" button calling markAllRead
    - Play soft success sound on report_resolved notification
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [x] 9.6 Implement Profile page at `/app/profile/page.tsx`
    - Wrap with AuthGuard
    - Display user name, email, role, avatar
    - Editable settings: notification preferences (emailEnabled, inAppEnabled, category toggles), language ("en"/"es"), public profile toggle, location permission toggle
    - MFA toggle with confirmation toast
    - "Reset Demo Data" button reloading all stores with mockData, showing success toast
    - Persist all changes via authStore with sonner toasts
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 10. Implement page routes — Admin pages
  - [x] 10.1 Implement Admin Dashboard page at `/app/admin/page.tsx`
    - Wrap with AuthGuard (requiredRole="admin")
    - Render AdminReportTable with all reports
    - Wire priority filter, status filter, and date sort toggle
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 10.2 Implement Admin Report Detail page at `/app/admin/report/[id]/page.tsx`
    - Wrap with AuthGuard (requiredRole="admin")
    - Display full report details and resolution form with textarea and "Resolve" button
    - On resolve: update report via markResolved in reportsStore, push report_resolved notification
    - Validate resolution notes are not empty; show error "Resolution notes are required"
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 10.3 Write property test for report resolution (Property 16)
    - **Property 16: Report Resolution Updates All Required Fields** — Generate reports and resolution notes, verify status "Resolved", resolvedAt set, resolvedBy set, resolutionNotes set, notification pushed
    - **Validates: Requirements 11.2**

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Wire root layout, navigation, and integration
  - [x] 12.1 Implement root layout at `/app/layout.tsx`
    - Configure Inter font via next/font/google
    - Include Toaster (sonner) provider
    - Include DemoBanner component
    - Include navigation bar with NotificationBell, links to dashboard/map/profile, and logout
    - Set mobile-first responsive layout starting at 375px baseline
    - _Requirements: 17.2, 17.5, 19.1_

  - [x] 12.2 Wire store rehydration to ensure all Zustand stores load from localStorage before rendering protected routes
    - Implement hydration check to prevent flash of unauthenticated content
    - _Requirements: 16.4_

  - [x] 12.3 Wire report submission to notification system
    - When a report is resolved via admin, push report_resolved notification to author
    - Resolution notifications SHALL still fire to the Report's authorId even when isAnonymous is true; the notification is private to the author
    - Ensure notification appears in notification center within 5 seconds
    - _Requirements: 11.2, 12.1_

  - [x] 12.4 Wire heat map reactivity
    - Ensure new reports added to reportsStore appear on heat map without page reload
    - Ensure filter changes in uiStore update heat layer reactively
    - _Requirements: 9.6_

  - [ ]* 12.5 Write integration tests for end-to-end flows
    - Test: Student signup → verify → login → submit report → appears in feed and map
    - Test: Admin login → view reports → resolve report → student receives notification
    - Test: Upvote updates feed sort order
    - Test: Demo data reset restores all stores
    - _Requirements: 1.1, 2.1, 5.2, 8.4, 11.2, 12.1, 13.4_

  - [x] 12.6 Create `/README.md` with setup instructions, demo credentials, and traceability matrix
    - Include quickstart: `npm install && npm run dev`
    - List demo credentials: student1@csu.fullerton.edu / password123, admin@csu.fullerton.edu / admin123
    - Include a feature-to-requirement trace matrix mapping UR-001–UR-012 and SR-001–SR-036 to specific components and routes
    - _Requirements: N/A (grader deliverable)_

  - [x] 12.7 Add inline requirement-ID comments throughout codebase
    - Add comments referencing specific SR/UR IDs at each enforcement point (e.g., `// SR-019: heat map color density`, `// SR-024: prevent self-upvote`, `// SR-002: lock after 3 failed attempts`)
    - Cover all major enforcement points across stores, components, and pages
    - _Requirements: N/A (grader deliverable)_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- All state is client-side via Zustand + localStorage — no backend or API calls needed
- The design document contains full component interfaces, store interfaces, and zod schemas to reference during implementation
