# Requirements Document

## Introduction

SafeCampus is a campus safety and issue-reporting web application for California State University, Fullerton (CSUF). The application enables verified CSUF students to submit safety and maintenance reports (with photos, categories, severity, and location), view a real-time heat map of active issues, upvote reports to boost visibility, and receive notifications when issues are resolved. Administrators access a separate dashboard to triage and resolve reports. The application is fully client-side with mock data persisted via Zustand/localStorage, designed for a live demo in a university software engineering course (CPSC 362).

## Glossary

- **Application**: The SafeCampus Next.js 14 web application using App Router and TypeScript
- **Student**: A registered user with the role "student" who can submit, view, and upvote reports
- **Admin**: A registered user with the role "admin" who can triage and resolve reports via the admin dashboard
- **Report**: A campus safety or maintenance issue submission containing a title, description, category, severity, location, optional photos, and anonymous flag
- **Report_Card**: A UI component displaying a summary of a Report including title, category, severity, status, upvote count, and submission time
- **Heat_Map**: An interactive Leaflet-based map displaying clustered report locations as a heat layer over CSUF campus coordinates
- **Upvote**: An action by a Student to increase the visibility priority of a Report
- **Notification**: An in-app message sent to a user about report status changes, new reports, or urgent alerts
- **OTP**: A one-time password used for email verification and two-factor authentication
- **Stepper_Form**: A multi-step form wizard used for report submission with seven sequential steps
- **Demo_Banner**: A dismissible UI banner indicating the application is running in demo mode
- **Auth_Store**: The Zustand store managing authentication state including current user, login, logout, signup, and profile operations
- **Reports_Store**: The Zustand store managing the reports array and all report-related operations
- **Notification_Store**: The Zustand store managing notifications and read/unread state
- **UI_Store**: The Zustand store managing UI state such as map filters and active modals
- **CSUF_Email**: An email address ending in "@csu.fullerton.edu"
- **Severity_Level**: One of "Low", "Medium", "High", or "Critical" indicating the urgency of a Report
- **Report_Category**: One of "Safety", "Maintenance", "Harassment", "Lost & Found", or "Other"
- **Report_Status**: One of "Open", "In Progress", or "Resolved"
- **Location_Picker**: A UI component allowing users to select a geographic location on the CSUF campus map
- **Photo_Uploader**: A UI component allowing users to attach JPEG or PNG images to a Report
- **Mock_Data**: A TypeScript seed file containing pre-populated users, reports, notifications, and placeholder photos

## Requirements

### Requirement 1: User Registration

**User Story:** As a prospective student user, I want to register for a SafeCampus account using my CSUF email, so that I can access the campus safety reporting platform.

#### Acceptance Criteria

1. WHEN a user submits the registration form with a valid CSUF_Email, a name, and a password meeting strength requirements, THE Application SHALL create a new Student account and navigate to the OTP verification page.
2. WHEN a user submits the registration form with an email that does not end in "@csu.fullerton.edu", THE Application SHALL display an inline error message "Only CSUF emails are allowed" and SHALL NOT create an account.
3. WHEN a user submits the registration form with an email that already exists in the Auth_Store, THE Application SHALL display an inline error message "An account with this email already exists" and SHALL NOT create a duplicate account.
4. WHEN a user submits the registration form with a password shorter than 8 characters or not including at least one symbol, THE Application SHALL display an inline error message "Password must be at least 8 characters and include a symbol" and SHALL NOT create an account.
5. WHEN a user submits the registration form with any required field left empty, THE Application SHALL highlight the empty fields and display a validation error for each.


### Requirement 2: User Login and Authentication

**User Story:** As a registered user, I want to log in with my credentials, so that I can access SafeCampus features appropriate to my role.

#### Acceptance Criteria

1. WHEN a Student submits valid credentials on the login page, THE Application SHALL authenticate the user, store the session in the Auth_Store, and redirect to the /dashboard route.
2. WHEN an Admin submits valid credentials on the login page, THE Application SHALL authenticate the user, store the session in the Auth_Store, and redirect to the /admin route.
3. WHEN a user submits incorrect credentials, THE Application SHALL display an error message "Invalid email or password", increment the failedLoginAttempts counter on the User record, and SHALL NOT grant access.
4. WHEN a user submits the login form with any required field left empty, THE Application SHALL display a validation error for each empty field and SHALL NOT attempt authentication.
5. WHEN a user's failedLoginAttempts reaches 3, THE Application SHALL lock the account for 15 minutes by setting the lockedUntil timestamp and SHALL display a message "Account locked. Try again in 15 minutes."
6. WHILE a User account's lockedUntil timestamp is in the future, THE Application SHALL reject all login attempts for that account and display the remaining lockout duration.

### Requirement 3: OTP Verification and Two-Factor Authentication

**User Story:** As a registered user, I want to verify my identity via a one-time password, so that my account is secured against unauthorized access.

#### Acceptance Criteria

1. WHEN a user navigates to the /verify page after registration, THE Application SHALL display a 7-digit OTP input field and a submit button.
2. WHEN a user enters a valid OTP code (mock-accepted: any 7-digit numeric input), THE Application SHALL mark the User as isVerified in the Auth_Store and redirect to the /dashboard route.
3. WHEN a user enters an invalid OTP code (fewer or more than 7 digits, or non-numeric), THE Application SHALL display an error message "Invalid verification code."
4. WHEN a user with mfaEnabled set to true logs in successfully, THE Application SHALL redirect to the /verify page before granting access to protected routes.

### Requirement 4: Password Reset

**User Story:** As a user who has forgotten my password, I want to reset it via my registered email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user submits a valid CSUF_Email on the /forgot-password page, THE Application SHALL display a confirmation message "If this email is registered, a reset link has been sent" regardless of whether the email exists, and SHALL present a 7-digit OTP input field.
2. WHEN a user submits the password reset form with an empty email field, THE Application SHALL display a validation error "Email is required."
3. WHEN a user enters a valid 7-digit OTP on the /forgot-password page, THE Application SHALL display a new-password form with password and confirm-password fields.
4. WHEN a user submits a new password meeting strength requirements (at least 8 characters including a symbol) on the /forgot-password page, THE Application SHALL update the passwordHash in the Auth_Store, display a success message, and redirect to the login page.
5. WHEN a user enters an invalid OTP (fewer or more than 7 digits, or non-numeric) on the /forgot-password page, THE Application SHALL display an error message "Invalid verification code."

### Requirement 5: Report Submission

**User Story:** As a verified Student, I want to submit a campus safety or maintenance report with details, photos, and location, so that campus issues are documented and visible to the community.

#### Acceptance Criteria

1. WHEN a verified Student navigates to /report/new, THE Application SHALL display a 7-step Stepper_Form with the following sequential steps: Title and Description entry, Category selection, Severity selection, Location selection via Location_Picker, Photo attachment via Photo_Uploader, Privacy toggle (anonymous option), and Review with Submit.
2. WHEN a Student completes all required fields and submits the Stepper_Form, THE Application SHALL create a new Report in the Reports_Store with status "Open", the current timestamp as submittedAt, and an empty upvotedBy array, and SHALL redirect to the /dashboard route.
3. WHEN a Student attempts to submit the Stepper_Form with any required field (title, description, category, severity, or location) left empty, THE Application SHALL display a validation error on the relevant step and SHALL NOT create the Report.
4. WHEN a Student attaches a photo via the Photo_Uploader, THE Application SHALL accept only files with fileType "image/jpeg" or "image/png" and store the photo as a dataUrl in the Report's photos array.
5. WHEN a Student enables the anonymous toggle during report submission, THE Application SHALL set isAnonymous to true on the Report and SHALL NOT display the author's name or identity on the Report_Card or report detail page.
6. WHEN a Student attaches a photo with a file type other than "image/jpeg" or "image/png", THE Application SHALL display an error message "Only JPG and PNG files are accepted" and SHALL NOT attach the file.
7. THE Photo_Uploader SHALL reject attachment attempts beyond 3 photos per Report and display an error message "Maximum 3 photos per report."
8. WHEN a Report is submitted with isAnonymous set to true, THE Application SHALL withhold the Report's location from the /map heat layer for 5 minutes after submittedAt, then SHALL include the location in the heat layer.

### Requirement 6: Report Feed and Sorting

**User Story:** As a Student, I want to browse a feed of campus reports sorted by relevance, so that I can see the most important issues first.

#### Acceptance Criteria

1. WHEN a Student navigates to /dashboard, THE Application SHALL display a list of Report_Card components for all non-resolved reports, sorted in descending order by upvote count (upvotedBy array length). THE Application SHALL display a floating action button (bottom-right, fixed position) labeled "+ New Report" linking to /report/new.
2. WHEN two or more reports have the same upvote count, THE Application SHALL sort those reports by submittedAt in descending order (most recent first) as a tiebreaker.
3. WHEN a Student selects a category filter on the /dashboard page, THE Application SHALL display only reports matching the selected Report_Category.
4. WHEN no reports match the active filter criteria, THE Application SHALL display a helpful placeholder message indicating no reports were found for the selected filter.
5. THE Application SHALL display each Report_Card with the report title, Report_Category badge, Severity_Level badge, Report_Status badge, upvote count, relative submission time (via date-fns), and author name (or "Anonymous" if isAnonymous is true).


### Requirement 7: Report Detail View

**User Story:** As a Student, I want to view the full details of a report, so that I can understand the issue and decide whether to upvote it.

#### Acceptance Criteria

1. WHEN a Student navigates to /report/[id] with a valid reportId, THE Application SHALL display the full Report details including title, description, category, severity, status, location area name, submission time, all attached photos, and the current upvote count.
2. WHEN a Student navigates to /report/[id] with a reportId that does not exist in the Reports_Store, THE Application SHALL display a "Report not found" message and a link to return to the dashboard.
3. WHEN a Report has isAnonymous set to true, THE Application SHALL display "Anonymous" in place of the author's name on the report detail page.

### Requirement 8: Upvoting Reports

**User Story:** As a Student, I want to upvote reports to increase their visibility, so that critical issues get prioritized by the community and administrators.

#### Acceptance Criteria

1. WHEN a Student clicks the upvote button on a Report that the Student has not previously upvoted, THE Application SHALL add the Student's userId to the Report's upvotedBy array and increment the displayed upvote count by 1.
2. WHEN a Student clicks the upvote button on a Report that the Student has already upvoted, THE Application SHALL display a message "You have already upvoted this report" and SHALL NOT add a duplicate entry to the upvotedBy array.
3. WHEN a Student clicks the upvote button on a Report that has been removed from the Reports_Store, THE Application SHALL display an error message "This report is no longer available" and SHALL NOT attempt to modify the upvotedBy array.
4. WHEN a Report's upvotedBy array changes, THE Application SHALL re-sort the report feed on /dashboard to reflect the updated upvote count ordering.
5. WHEN a Student attempts to upvote a Report where the Report's authorId equals the Student's userId, THE Application SHALL disable the upvote button and SHALL NOT modify the upvotedBy array.

### Requirement 9: Interactive Heat Map

**User Story:** As a Student, I want to view an interactive heat map of campus issues, so that I can identify areas with concentrated safety or maintenance problems.

#### Acceptance Criteria

1. WHEN a Student navigates to /map, THE Application SHALL render a react-leaflet map centered on CSUF campus coordinates (approximately 33.8823, -117.8851) with OpenStreetMap tiles and a leaflet.heat heat layer generated from all non-resolved Report locations.
2. THE heat layer SHALL use a color gradient of Green (Safe/Low) → Yellow (Caution/Medium) → Orange (Warning/High) → Red (Danger/Critical) where intensity is driven by the severity field of each Report.
3. WHEN no non-resolved reports exist in the Reports_Store, THE Application SHALL display the map centered on CSUF campus coordinates with a message overlay "No active reports to display."
4. WHEN a Student clicks on a heat map cluster or marker, THE Application SHALL display a popup or modal with the Report title, category, severity, and a link to the full report detail page.
5. WHEN a Student applies a category or severity filter on the /map page, THE Application SHALL update the heat layer to display only reports matching the selected filter criteria.
6. WHEN a new Report is added to the Reports_Store, THE Application SHALL update the heat layer on the /map page to include the new Report's location without requiring a full page reload.

### Requirement 10: Admin Dashboard

**User Story:** As an Admin, I want to view and manage all campus reports in a structured dashboard, so that I can triage and resolve issues efficiently.

#### Acceptance Criteria

1. WHEN an Admin navigates to /admin, THE Application SHALL display a table of all reports with columns for title, category, severity, status, submission date, and priority.
2. WHEN an Admin applies a priority filter on the /admin page, THE Application SHALL display only reports matching the selected priority level ("High", "Medium", or "Low").
3. THE /admin page SHALL provide a status filter allowing the Admin to filter reports by status (All / Open / In Progress / Resolved).
4. THE /admin page SHALL provide a sort toggle for submittedAt allowing the Admin to sort reports in ascending or descending order by submission date.
5. WHEN a Report has photos attached, THE Application SHALL display clickable photo thumbnails in the admin report row or detail view.
6. THE Application SHALL restrict access to /admin and /admin/report/[id] routes to users with the "admin" role; WHEN a Student attempts to access these routes, THE Application SHALL redirect to /dashboard.

### Requirement 11: Admin Report Resolution

**User Story:** As an Admin, I want to resolve reports with resolution notes, so that students are informed when their reported issues have been addressed.

#### Acceptance Criteria

1. WHEN an Admin navigates to /admin/report/[id], THE Application SHALL display the full Report details and a resolution form with a text area for resolution notes and a "Resolve" button.
2. WHEN an Admin submits the resolution form with resolution notes, THE Application SHALL update the Report's status to "Resolved", set resolvedAt to the current timestamp, set resolvedBy to the Admin's userId, store the resolutionNotes, and push a notification of type "report_resolved" to the Notification_Store for the Report's authorId. Resolution notifications SHALL still fire to the Report's authorId even when isAnonymous is true; the notification is private to the author.
3. WHEN an Admin attempts to resolve a Report without entering resolution notes, THE Application SHALL display a validation error "Resolution notes are required" and SHALL NOT update the Report status.

### Requirement 12: Notifications

**User Story:** As a user, I want to receive in-app notifications about report updates and urgent alerts, so that I stay informed about campus safety developments.

#### Acceptance Criteria

1. WHEN a notification is pushed to the Notification_Store for a user, THE Application SHALL display the notification in the notification center at /notifications within 5 seconds, showing the notification category, header, and body.
2. WHEN a user clicks the NotificationBell component in the navigation, THE Application SHALL display the current unread notification count as a badge and navigate to /notifications.
3. WHEN a user views the /notifications page, THE Application SHALL display all notifications for the current user sorted by sentAt in descending order, with unread notifications visually distinguished from read notifications.
4. WHEN a user clicks on an unread notification, THE Application SHALL mark the notification as read in the Notification_Store.
5. WHEN a user clicks "Mark all as read" on the /notifications page, THE Application SHALL set the read property to true for all notifications belonging to the current user.
6. WHEN a notification of type "report_resolved" is received, THE Application SHALL play a soft success sound effect.
7. WHEN a Notification has urgency "urgent", THE Application SHALL display a warning icon (⚠ / AlertTriangle). WHEN a Notification has urgency "non_urgent", THE Application SHALL display a neutral bell icon. Notification layout SHALL follow the order: icon → category → header, with header truncated to 60 characters maximum.


### Requirement 13: User Profile and Settings

**User Story:** As a user, I want to manage my profile and notification preferences, so that I can control my SafeCampus experience.

#### Acceptance Criteria

1. WHEN a user navigates to /profile, THE Application SHALL display the user's name, email, role, profile picture, and editable settings including notification preferences, language selection ("en" or "es"), public profile visibility toggle, and location permission toggle.
2. WHEN a user updates notification preferences (emailEnabled, inAppEnabled, category toggles), THE Application SHALL persist the changes to the Auth_Store and display a success toast via sonner.
3. WHEN a user toggles the mfaEnabled setting, THE Application SHALL update the User record in the Auth_Store and display a confirmation toast.
4. WHEN a user clicks "Reset Demo Data" on the /profile page, THE Application SHALL reload all stores (Auth_Store, Reports_Store, Notification_Store, UI_Store) with the original Mock_Data and display a success toast "Demo data has been reset."

### Requirement 14: Data Models and Type Safety

**User Story:** As a developer, I want strictly typed data models, so that the application maintains type safety and consistency across all components and stores.

#### Acceptance Criteria

1. THE Application SHALL define all data types (UserRole, ReportCategory, ReportStatus, Severity, NotifType, Urgency, User, Report, Photo, Notification) in a single /lib/types.ts file using TypeScript interfaces and type aliases.
2. THE Application SHALL enforce that every Report's category field matches one of the defined ReportCategory values ("Safety", "Maintenance", "Harassment", "Lost & Found", "Other") via zod schema validation at submission time.
3. THE Application SHALL enforce that every Report's severity field matches one of the defined Severity_Level values ("Low", "Medium", "High", "Critical") via zod schema validation at submission time.
4. FOR ALL Report objects created through the Stepper_Form, serializing the Report to JSON and deserializing it back SHALL produce an object equivalent to the original Report (round-trip property).

### Requirement 15: Mock Data Seeding

**User Story:** As a demo presenter, I want the application to launch with rich, realistic pre-populated data, so that the demo looks fully functional on first render.

#### Acceptance Criteria

1. THE Application SHALL seed the Auth_Store with exactly 4 Student users and 1 Admin user from the /lib/mockData.ts file on first launch when no persisted data exists in localStorage.
2. THE Application SHALL seed the Reports_Store with exactly 10 realistic reports at CSUF campus coordinates from the /lib/mockData.ts file on first launch, including a mix of statuses: 8 with status "Open", 1 with status "In Progress", and 1 with status "Resolved", and a mix of priorities: at least 3 "High", 3 "Medium", and 3 "Low".
3. THE Application SHALL seed the Notification_Store with exactly 6 notifications from the /lib/mockData.ts file on first launch.
4. THE Application SHALL use picsum.photos placeholder URLs for all seeded Report photos.
5. WHEN persisted data already exists in localStorage, THE Application SHALL load from localStorage and SHALL NOT overwrite with Mock_Data.

### Requirement 16: State Management with Persistence

**User Story:** As a user, I want my session, reports, and notifications to persist across page reloads, so that I do not lose data during the demo.

#### Acceptance Criteria

1. THE Application SHALL persist Auth_Store state (current user session) to localStorage using Zustand persist middleware.
2. THE Application SHALL persist Reports_Store state (all reports) to localStorage using Zustand persist middleware.
3. THE Application SHALL persist Notification_Store state (all notifications) to localStorage using Zustand persist middleware.
4. WHEN the Application loads, THE Application SHALL rehydrate all Zustand stores from localStorage before rendering protected routes.
5. FOR ALL Report objects stored in the Reports_Store, serializing the store to localStorage and deserializing it back SHALL produce a reports array equivalent to the original (round-trip property).

### Requirement 17: Design System and Visual Standards

**User Story:** As a user, I want a visually consistent and polished interface following CSUF branding, so that the application looks professional and is easy to use.

#### Acceptance Criteria

1. THE Application SHALL configure Tailwind CSS with the following custom colors: primary "#00244D", accent "#FF7900", danger "#DC2626", warning "#F59E0B", caution "#EAB308", and safe "#16A34A".
2. THE Application SHALL use the Inter font loaded via next/font/google with body text at 14px, h1 at 24px, and h2 at 18px.
3. THE Application SHALL apply border-radius "lg" (8px) to all Card components and border-radius "md" (6px) to all Input components.
4. THE Application SHALL apply shadow-sm to Card components and shadow-md to modal/dialog components.
5. THE Application SHALL render all pages with a mobile-first responsive layout starting at a 375px baseline width.
6. WHEN data is loading or unavailable, THE Application SHALL display skeleton placeholders or helpful placeholder text instead of blank empty states.

### Requirement 18: Routing and Access Control

**User Story:** As a user, I want to navigate the application through well-defined routes with appropriate access control, so that I can only access pages relevant to my role.

#### Acceptance Criteria

1. THE Application SHALL define the following 12 routes using Next.js App Router: / (login), /signup, /verify, /forgot-password, /dashboard, /map, /report/new, /report/[id], /notifications, /profile, /admin, and /admin/report/[id].
2. WHEN an unauthenticated user attempts to access any route other than /, /signup, /verify, or /forgot-password, THE Application SHALL redirect to the / (login) route.
3. WHEN a Student attempts to access /admin or /admin/report/[id], THE Application SHALL redirect to /dashboard.
4. WHEN an Admin attempts to access /dashboard, THE Application SHALL allow access (Admins can view the student feed).

### Requirement 19: Demo Mode Enhancements

**User Story:** As a demo presenter, I want demo-specific UI enhancements, so that the audience understands the application is in demo mode and can easily reset state.

#### Acceptance Criteria

1. THE Application SHALL display a dismissible Demo_Banner at the top of every page indicating the application is running in demo mode.
2. WHEN a user dismisses the Demo_Banner, THE Application SHALL hide the banner for the remainder of the session and SHALL NOT display it again until the page is fully reloaded.
3. THE Application SHALL display all timestamps as relative time strings (e.g., "2 hours ago", "3 days ago") using date-fns formatDistanceToNow or equivalent.

### Requirement 20: Form Validation

**User Story:** As a user, I want all forms to validate my input in real time, so that I receive immediate feedback on errors before submission.

#### Acceptance Criteria

1. THE Application SHALL validate all forms using react-hook-form integrated with zod schemas.
2. WHEN a user interacts with a form field and the input does not satisfy the zod schema, THE Application SHALL display an inline error message below the field within 300 milliseconds of the user leaving the field (on blur).
3. WHEN a user corrects a previously invalid field to satisfy the zod schema, THE Application SHALL remove the inline error message within 300 milliseconds.
4. FOR ALL valid Report submission form inputs, validating the input against the zod schema SHALL return a success result, and FOR ALL invalid inputs missing required fields, the schema SHALL return a failure result listing the missing fields (validation round-trip property).
