# ACM Internal Calendar, Meeting & Task Management Platform

> **Enterprise Product Requirements Document, Software Requirements Specification, Security Baseline, Architecture Plan, API Catalogue, Data Model, Delivery Plan, and Engineering Backlog**

| Document field | Value |
|---|---|
| Product | ACM Internal Calendar, Meeting & Task Management Platform |
| Working name | **ACM Nexus** |
| Document status | Production-oriented implementation specification |
| Submission deadline | **4 July 2026, End of Day (Asia/Kolkata)** |
| Delivery strategy | Working MVP first; hardening and advanced capabilities afterward |
| Primary stack | React + Vite, FastAPI, PostgreSQL, JWT-based authentication, Docker |
| Intended audience | Product owner, project reviewer, frontend team, backend team, QA, DevOps, security reviewer |
| Security target | OWASP ASVS 5.0 Level 2-aligned baseline |
| Accessibility target | WCAG 2.2 AA |
| Version | 1.0 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Objectives and Success Criteria](#3-objectives-and-success-criteria)
4. [Scope](#4-scope)
5. [Users, Roles, and Authorization Model](#5-users-roles-and-authorization-model)
6. [Functional Requirements](#6-functional-requirements)
7. [Business Rules](#7-business-rules)
8. [User Journeys](#8-user-journeys)
9. [Dashboard and Reporting](#9-dashboard-and-reporting)
10. [Notification and Reminder System](#10-notification-and-reminder-system)
11. [Search, Filtering, and Saved Views](#11-search-filtering-and-saved-views)
12. [File, Comment, and Collaboration Features](#12-file-comment-and-collaboration-features)
13. [AI-Assisted Features](#13-ai-assisted-features)
14. [System Architecture](#14-system-architecture)
15. [Technology Decisions](#15-technology-decisions)
16. [Backend Architecture](#16-backend-architecture)
17. [Frontend Architecture](#17-frontend-architecture)
18. [Database Design](#18-database-design)
19. [API Design](#19-api-design)
20. [Security Architecture](#20-security-architecture)
21. [Privacy and Data Governance](#21-privacy-and-data-governance)
22. [Non-Functional Requirements](#22-non-functional-requirements)
23. [Observability and Operations](#23-observability-and-operations)
24. [Deployment Architecture](#24-deployment-architecture)
25. [CI/CD and Supply-Chain Security](#25-cicd-and-supply-chain-security)
26. [Testing Strategy](#26-testing-strategy)
27. [MVP Acceptance Criteria](#27-mvp-acceptance-criteria)
28. [Implementation Backlog](#28-implementation-backlog)
29. [Compressed Delivery Plan](#29-compressed-delivery-plan)
30. [Definition of Done](#30-definition-of-done)
31. [Risk Register](#31-risk-register)
32. [Production Readiness Checklist](#32-production-readiness-checklist)
33. [Suggested Repository Structure](#33-suggested-repository-structure)
34. [Environment Configuration](#34-environment-configuration)
35. [Runbooks](#35-runbooks)
36. [Future Roadmap](#36-future-roadmap)
37. [Deliverables](#37-deliverables)
38. [Standards and References](#38-standards-and-references)

---

# 1. Executive Summary

ACM Nexus is an internal collaboration platform for managing society activities, including events, meetings, deadlines, tasks, assignments, reminders, attendance, and progress reporting.

The platform is **not a public appointment-booking or Calendly clone**. Its primary purpose is to provide one controlled internal source of truth for ACM operations. It must support multiple teams and member levels, enforce role-based permissions, provide auditable changes, and remain usable on desktop and mobile browsers.

The delivery is divided into two tracks:

1. **Submission MVP:** a stable, demonstrable application that covers authentication, authorization, dashboard, calendar, meetings, deadlines, task assignment, status tracking, and essential notifications.
2. **Production evolution:** security hardening, durable background jobs, file storage, audit reporting, analytics, advanced workflows, SSO, high availability, disaster recovery, and optional AI features.

The system will use a modular monolith architecture for the first production version. This provides clear module boundaries without the operational cost of premature microservices. Modules may later be separated if scale, ownership, or reliability requirements justify it.

---

# 2. Product Vision

## 2.1 Vision Statement

Create a secure and reliable internal operating system for ACM society coordination where every authorized member can see relevant schedules, responsibilities, deadlines, meeting outcomes, and team progress without relying on scattered chats, spreadsheets, or personal calendars.

## 2.2 Product Principles

- **Functionality before decoration:** core workflows must work correctly before advanced visual effects.
- **Least privilege:** users receive only the permissions required by their role and team.
- **One source of truth:** tasks, events, deadlines, and attendance must have canonical records.
- **Accountability by design:** important actions must be attributable through audit logs and change history.
- **Secure defaults:** insecure configuration must require deliberate action rather than being the default.
- **Progressive enhancement:** the MVP should evolve without requiring a rewrite.
- **Accessible and responsive:** primary workflows must support keyboard navigation and mobile layouts.
- **Time-zone correctness:** all timestamps are stored in UTC and displayed in the user's configured time zone.
- **Explicit ownership:** every task, event, meeting, and deadline has a responsible owner.
- **Graceful failure:** failed reminders, email delivery, or attachment processing must not corrupt core records.

---

# 3. Objectives and Success Criteria

## 3.1 Primary Objectives

- Centralize ACM meetings, events, deadlines, and assigned work.
- Make ownership and due dates visible.
- Reduce missed deadlines and untracked action items.
- Provide role-aware access to sensitive administrative functions.
- Give reviewers and core members visibility into progress.
- Support a clear transition from MVP to production.

## 3.2 MVP Success Criteria

The MVP is successful when:

- A user can register or be invited, sign in, sign out, and reset a password.
- An admin can activate, deactivate, and assign roles to users.
- Authorized users can create, edit, view, and delete events and meetings.
- Authorized users can create, assign, update, and complete tasks.
- Deadlines appear on the calendar and dashboard.
- Users see only records permitted by role, team, ownership, or participation.
- The dashboard accurately shows upcoming events, deadlines, pending tasks, overdue tasks, and completed tasks.
- Reminder records are generated and visible in the application.
- Critical actions create audit events.
- The application runs using Docker with documented setup instructions.
- A clean database can be initialized using migrations and seed data.
- Automated tests cover critical authentication and authorization paths.

## 3.3 Production Success Metrics

Suggested metrics after real usage begins:

| Metric | Target |
|---|---:|
| Monthly active users among enabled members | ≥ 80% |
| Tasks completed by due date | ≥ 85% |
| Meeting reminders successfully processed | ≥ 99% |
| API successful-request availability | ≥ 99.9% monthly |
| p95 read API latency under normal load | < 500 ms |
| p95 write API latency under normal load | < 800 ms |
| Critical authorization defects in production | 0 |
| Recovery Point Objective | ≤ 15 minutes |
| Recovery Time Objective | ≤ 4 hours |
| Accessibility issues blocking a core workflow | 0 |
| Unresolved critical vulnerabilities at release | 0 |

---

# 4. Scope

## 4.1 In Scope for MVP

- User authentication and session management
- User profile and time-zone preference
- Role-based and object-level authorization
- Organization and team membership
- Monthly, weekly, and agenda calendar views
- Event CRUD
- Meeting CRUD
- Deadline CRUD or deadline representation through tasks/events
- Task CRUD
- Task assignment
- Task status and completion
- Task priority
- Meeting participants
- Basic attendance status
- Dashboard summaries
- In-app notifications
- Basic email reminder integration or development mail capture
- Search and filtering
- Audit logging for high-risk actions
- Dockerized local and deployment setup
- Database migrations
- Seed users and demonstration data
- Unit, integration, and selected end-to-end tests

## 4.2 Production Scope

- Recurring events and meetings
- Kanban board
- Subtasks and task dependencies
- Comments, mentions, and activity feed
- Secure file attachments
- Saved filters and custom dashboard widgets
- Detailed attendance and RSVP workflows
- Calendar import/export using iCalendar
- External calendar synchronization
- Analytics and exportable reports
- Durable notification queue with retry and dead-letter handling
- Organization-level SSO through OpenID Connect
- MFA for privileged accounts
- Fine-grained permission policies
- Advanced audit reporting
- Feature flags
- High availability, backup verification, and disaster-recovery drills
- Optional AI meeting summaries and task suggestions

## 4.3 Explicit Non-Goals for Initial Release

- Public availability-booking pages
- Payment processing
- Payroll, financial accounting, or reimbursements
- Full HR management
- Public social network functionality
- Native Android or iOS applications
- Unrestricted cross-organization data sharing
- Real-time video conferencing implementation
- Autonomous AI actions without human approval

---

# 5. Users, Roles, and Authorization Model

## 5.1 Authorization Strategy

Use **RBAC plus contextual authorization**:

- **RBAC:** grants broad capabilities according to role.
- **Team scope:** restricts access to a team, committee, chapter, or working group.
- **Object relationship:** considers creator, owner, assignee, reviewer, participant, or watcher.
- **Record classification:** restricts confidential or administrative records.
- **Explicit grants:** supports temporary additional permissions where required.

A role alone must never be treated as sufficient for access to every record. Every protected endpoint must enforce both functional permission and object-level scope.

## 5.2 Recommended Roles

| Role | Purpose |
|---|---|
| Platform Admin | Technical administration, emergency access, security configuration |
| ACM Admin | Society-level administration, user and team management |
| Core Member | Operational leadership and broad management privileges |
| Reviewer | Review tasks, approve/reject work, comment, and view relevant reports |
| Third Year Member | Senior member with delegated coordination capabilities |
| Second Year Member | Standard contributor with limited creation and assignment privileges |
| First Year Member | Contributor with access to assigned and shared team work |
| Society Member | Generic member for cases not mapped to academic year |
| Guest/Observer | Read-only access to explicitly shared records; optional |
| Service Account | Non-human integration identity with narrowly scoped permissions |

The assignment's named roles remain supported. “Platform Admin” and “Guest/Observer” are additional production roles and may be omitted from the MVP UI.

## 5.3 Permission Vocabulary

Use permissions rather than hard-coded role checks:

```text
users.read
users.manage
roles.read
roles.manage
teams.read
teams.manage
events.read
events.create
events.update.own
events.update.team
events.update.any
events.delete.own
events.delete.any
meetings.read
meetings.create
meetings.update.own
meetings.update.team
meetings.delete.any
tasks.read
tasks.create
tasks.assign
tasks.update.own
tasks.update.assigned
tasks.update.team
tasks.delete.any
tasks.review
attendance.read
attendance.manage
comments.create
comments.moderate
attachments.upload
attachments.delete.own
attachments.delete.any
reports.read.team
reports.read.organization
audit.read
settings.manage
notifications.manage
```

## 5.4 Baseline Permission Matrix

Legend: **A** = all in organization, **T** = team-scoped, **O** = own/assigned/participating records, **R** = read only, **—** = denied by default.

| Capability | ACM Admin | Core Member | Reviewer | Third Year | Second Year | First Year | Society Member |
|---|---:|---:|---:|---:|---:|---:|---:|
| View users | A | T | T | T | T | O/T | O/T |
| Manage users and roles | A | — | — | — | — | — | — |
| Manage teams | A | T | — | — | — | — | — |
| View shared calendar | A | A | T | T | T | T | T |
| Create organization event | A | A | — | — | — | — | — |
| Create team event | A | T | T with policy | T with policy | Limited | — | Limited |
| Edit own event | A | O/T | O | O | O | O | O |
| Delete event | A | O/T | O if permitted | O if permitted | O if permitted | — | — |
| Schedule meeting | A | T/A | T | T | T | O/T | O/T |
| Create task | A | T/A | T | T | T | Limited | Limited |
| Assign task to others | A | T | T | T | Limited | — | — |
| Update assigned task | A | T/A | T | O/T | O/T | O | O |
| Review/approve task | A | T | T | Delegated | — | — | — |
| Manage attendance | A | T | T | Delegated | — | — | — |
| View team analytics | A | A | T | T | Limited | O | O |
| View audit logs | A | Limited | — | — | — | — | — |
| Manage system settings | A | — | — | — | — | — | — |

## 5.5 Authorization Rules

- Deny access by default.
- Every API query must be scoped server-side.
- Frontend hiding is a usability feature, not a security control.
- A user cannot assign a task to a person outside the permitted organization or team.
- A deactivated user cannot authenticate, refresh a token, or receive new assignments.
- Role changes invalidate existing privileged sessions or force permission re-evaluation.
- Admins cannot silently modify their own security-sensitive privileges without an audit event.
- Platform emergency access must be time-limited and fully audited.
- Confidential records require an explicit classification check in addition to normal role checks.
- Bulk actions must authorize every affected record, not only the first record.

---

# 6. Functional Requirements

## 6.1 Identity, Authentication, and Account Lifecycle

### Required

- Invitation-based account creation for production.
- Optional self-registration restricted to approved ACM email domains.
- Email verification.
- Login using email and password.
- Logout from current session.
- Logout from all sessions.
- Password reset with single-use, expiring token.
- Account lockout or progressive delay for repeated failed attempts.
- Session list showing device, created time, last activity, and revocation control.
- Account activation and deactivation by admin.
- Profile fields:
  - Display name
  - Email
  - Member role
  - Academic year
  - Team memberships
  - Time zone
  - Preferred language
  - Notification preferences
  - Avatar
- Last login and last active timestamps.
- Terms/privacy acknowledgement version.
- Optional MFA, mandatory for admins in production.

### Acceptance Rules

- Password reset responses must not reveal whether an account exists.
- Reset tokens must expire and become invalid after use.
- Deactivated users must be blocked even if they possess an unexpired access token.
- Email changes require re-verification.
- Sensitive account changes require recent authentication.

## 6.2 Organization and Team Management

- Create and update organization profile.
- Create teams, committees, project groups, and working groups.
- Add or remove members from teams.
- Assign team lead and optional deputy.
- Set team visibility:
  - Organization visible
  - Members only
  - Private
- Archive teams without deleting historical work.
- Define team-specific default permissions.
- Filter calendar and task views by team.
- Prevent deletion of a team that owns active records; archive instead.
- Transfer team ownership.

## 6.3 Calendar

### Views

- Month view
- Week view
- Day/agenda view
- List view
- Mobile agenda view
- Personal calendar
- Team calendar
- Organization calendar

### Event Types

- General event
- Meeting
- Deadline
- Workshop
- Contest
- Recruitment activity
- Review session
- Social activity
- Custom administrator-defined types

### Event Fields

- Title
- Description
- Type
- Owner
- Team
- Start date/time
- End date/time
- All-day flag
- Time zone
- Location
- Online meeting URL
- Visibility
- Color/category
- Participant list
- Capacity
- RSVP requirement
- Reminder configuration
- Recurrence rule
- Attachments
- Related tasks
- Status
- Cancellation reason
- Created by, updated by, created at, updated at

### Event Operations

- Create
- View
- Edit
- Cancel
- Delete/soft-delete
- Duplicate
- Move or resize in calendar
- Invite participants
- RSVP: accepted, tentative, declined
- Export as `.ics`
- Import validated `.ics`
- Add related tasks
- View activity history
- Restore soft-deleted events if authorized

### Recurrence

Support:

- Daily
- Weekly
- Monthly
- Yearly
- Custom interval
- End after number of occurrences
- End on date
- Edit one occurrence
- Edit this and following occurrences
- Edit entire series
- Exception dates

Store recurrence using an RFC 5545-compatible rule where practical.

### Calendar Conflict Rules

- Warn on overlapping meetings for mandatory participants.
- Allow authorized override with reason.
- Do not block overlap for optional participants.
- Do not treat all-day informational events as blocking unless configured.
- Use participant time zones when displaying conflicts.
- Avoid double reminders for a recurring-event exception.

## 6.4 Task Management

### Task Fields

- Title
- Description
- Organization
- Team/project
- Creator
- Owner
- One or more assignees
- Reviewer
- Status
- Priority
- Start date
- Due date/time
- Estimated effort
- Actual effort
- Labels/tags
- Parent task
- Subtasks
- Dependencies
- Acceptance criteria
- Attachments
- Comments
- Watchers
- Completion timestamp
- Archived timestamp
- Custom fields
- Version number for optimistic locking

### Default Status Workflow

```text
BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → DONE
                     ↘ BLOCKED ↗
```

Additional terminal states:

- CANCELLED
- DUPLICATE
- ARCHIVED

### Task Operations

- Create
- View
- Edit
- Assign and reassign
- Change status
- Set priority
- Add/remove labels
- Add comments and mentions
- Add attachments
- Add subtasks
- Link dependencies
- Mark blocked and record reason
- Submit for review
- Approve
- Request changes
- Mark complete
- Reopen
- Archive
- Duplicate
- Bulk update where authorized
- Export filtered tasks

### Priority Levels

- Critical
- High
- Medium
- Low
- None

### Task Rules

- A task must have at least one owner or assignee before entering `IN_PROGRESS`.
- A task cannot enter `DONE` while required subtasks remain incomplete unless an authorized reviewer overrides it.
- A dependent task cannot enter `IN_PROGRESS` when a blocking dependency is incomplete, unless override permission is granted.
- Due-date changes after work begins create an audit event.
- Reopening a completed task records the actor and reason.
- Deleting a task with activity history should soft-delete it.
- Completion must be idempotent.
- Users must not change fields outside their permission scope through mass assignment.

## 6.5 Kanban Board

Production feature; simplified version may be included in MVP.

- Columns mapped to task status.
- Drag-and-drop with server authorization.
- Optimistic UI update with rollback on failure.
- Filters by assignee, team, priority, label, and due date.
- Swimlanes by assignee, project, or priority.
- Work-in-progress limits.
- Quick create.
- Keyboard-accessible movement controls.
- Column totals and overdue indicators.
- Saved board views.

## 6.6 Deadlines

Deadlines may be represented as dedicated records or a specialized calendar event linked to tasks. A dedicated `deadlines` entity is recommended when deadlines need approval, submission evidence, or multiple associated tasks.

### Deadline Fields

- Title
- Description
- Owner
- Team
- Due date/time
- Time zone
- Severity
- Status
- Related tasks
- Submission URL
- Submission evidence
- Reminder schedule
- Escalation policy
- Visibility
- Completion/fulfilment timestamp

### Deadline Status

- Upcoming
- At risk
- Due soon
- Overdue
- Submitted
- Verified
- Waived
- Cancelled

### Deadline Rules

- Deadline status is computed server-side from due date, completion state, and risk flag.
- Overdue records remain visible until completed, waived, or cancelled.
- Deadline changes after the original due date must preserve historical values.
- Escalations must not expose confidential task content to unauthorized recipients.

## 6.7 Meeting Management

### Meeting Fields

- Title
- Description
- Organizer
- Team
- Start/end
- Time zone
- Location or conferencing link
- Agenda
- Participants
- Optional participants
- RSVP status
- Reminder policy
- Attendance
- Minutes
- Decisions
- Action items
- Recording/transcript reference
- Related event/tasks
- Visibility
- Status

### Meeting Lifecycle

```text
DRAFT → SCHEDULED → IN_PROGRESS → COMPLETED
                   ↘ CANCELLED
```

### Meeting Features

- Create and schedule.
- Edit before meeting.
- Reschedule with participant notification.
- Cancel with reason.
- Add agenda items.
- Allow participants to propose agenda items.
- Track RSVP.
- Take attendance.
- Capture minutes and decisions.
- Convert action items to tasks.
- Assign action-item owners and deadlines.
- Send reminder.
- Send follow-up summary.
- Generate optional AI summary from approved transcript.
- Maintain version history for minutes.

### Attendance Values

- Present
- Absent
- Excused
- Late
- Remote
- Unknown

### Meeting Security

- Private minutes are visible only to participants and authorized leaders.
- Transcript and recording links use stricter access than ordinary event descriptions.
- AI summarization is opt-in and must not process content beyond the approved data boundary.

## 6.8 Comments, Mentions, and Activity

- Threaded or flat comments.
- Markdown-safe comment formatting.
- `@mention` users with permission to view the parent record.
- Edit history for comments.
- Soft-delete with moderation marker.
- Reactions are optional.
- Activity entries for assignment, status, due-date, and priority changes.
- Notification generated for mentions and relevant changes.
- Do not notify users who cannot access the record.
- Sanitize rendered content to prevent XSS.

## 6.9 Attachments

- Attach files to tasks, meetings, events, deadlines, and comments.
- Upload using pre-signed object-storage URLs in production.
- Restrict size, MIME type, extension, and file count.
- Generate random storage keys; never trust user filenames as paths.
- Store original filename separately.
- Malware scan before marking file available.
- Quarantine failed or unscanned files.
- Download through short-lived authorized links.
- Audit upload and download of sensitive attachments.
- Prevent inline execution of active content.
- Support file deletion and retention rules.
- Optional versioning for meeting minutes or deliverables.

## 6.10 Notifications

Channels:

- In-app
- Email
- Optional browser push
- Optional chat/webhook integrations

Notification types:

- Assignment
- Due soon
- Overdue
- Mention
- Comment
- Meeting invite
- Meeting changed
- Meeting cancelled
- RSVP update
- Review requested
- Review decision
- Deadline escalation
- Role changed
- Security alert
- System announcement

Users can configure non-security notification preferences. Mandatory security notifications cannot be disabled.

## 6.11 Administration

- User directory.
- Invite users.
- Activate/deactivate accounts.
- Assign roles.
- Manage teams.
- Manage event/task categories.
- Manage status workflow if enabled.
- Manage notification templates.
- View audit logs.
- Configure retention periods.
- Configure allowed email domains.
- Configure attachment limits.
- Configure organization time zone.
- Manage feature flags.
- Export organization data.
- Review failed background jobs.
- Review security events.
- Trigger session revocation.
- Configure SSO and MFA policy in production.

---

# 7. Business Rules

## 7.1 Time and Date Rules

- Store timestamps as UTC with time-zone-aware database types.
- Store the original event time zone separately.
- Display dates in the user's selected time zone.
- All-day events use date semantics and must not shift because of UTC conversion.
- The organization default time zone is `Asia/Kolkata`, but users may override display time zone.
- Date calculations must account for daylight-saving changes for users in other time zones.
- Server time must be synchronized using a trusted time source.
- Reminder scheduling must be idempotent.

## 7.2 Deletion Rules

- Use soft deletion for business records with history.
- Hard deletion is restricted to retention jobs or privacy workflows.
- Deletion must not break foreign-key references.
- Deleted records are excluded from normal queries.
- Authorized users may restore records within the retention window.
- Audit logs are append-only and are not deleted through standard UI actions.

## 7.3 Concurrency Rules

- Use optimistic locking for frequently edited records.
- Reject stale updates with `409 Conflict`.
- Include a version or updated-at token in write requests.
- Drag-and-drop actions must handle concurrent updates safely.
- Bulk changes must provide per-record results.

## 7.4 Data Ownership Rules

- Every business record belongs to one organization.
- Team-owned records belong to a team within the same organization.
- Cross-organization references are forbidden.
- A user must be an active organization member to become an assignee or participant.
- Historical records remain attributed to deactivated users.
- Ownership transfer is required before deleting an organization or team.

## 7.5 Audit Rules

Audit at minimum:

- Authentication success and failure
- Password reset request and completion
- MFA changes
- Session revocation
- User invitation, activation, deactivation
- Role and permission changes
- Team membership changes
- Event/meeting/task/deadline creation and deletion
- Due-date, assignee, status, or visibility changes
- Attendance changes
- Attachment access for sensitive records
- Data export
- Configuration changes
- Emergency administrative access

Audit records include actor, action, target type, target identifier, timestamp, request ID, IP-derived security metadata where lawful, user agent summary, result, and a structured change summary. Secrets and full sensitive content must not be logged.

---

# 8. User Journeys

## 8.1 First-Year Member

1. Accept invitation.
2. Verify email and set password.
3. Sign in.
4. See team events, assigned tasks, and deadlines.
5. Open a task.
6. Add progress comment.
7. Move task from `TODO` to `IN_PROGRESS`.
8. Upload permitted evidence.
9. Submit task for review.
10. Receive reviewer decision.

## 8.2 Reviewer

1. Sign in.
2. See review queue.
3. Filter by team and due date.
4. Open submitted task.
5. Review comments and attachments.
6. Approve or request changes.
7. Add review note.
8. See audit history for relevant status changes.

## 8.3 Core Member

1. Create an ACM event.
2. Add participants and reminders.
3. Create preparatory tasks.
4. Assign tasks by team.
5. Monitor completion from dashboard.
6. Conduct meeting.
7. record attendance, decisions, and action items.
8. Convert action items to assigned tasks.
9. Review event outcome analytics.

## 8.4 Admin

1. Invite members.
2. Assign roles and teams.
3. Configure allowed categories.
4. Review system activity.
5. Deactivate a departing member.
6. Transfer open assignments.
7. Revoke sessions.
8. Export audit evidence if required.

---

# 9. Dashboard and Reporting

## 9.1 Personal Dashboard

Display:

- Next five upcoming events
- Meetings today
- Deadlines due in 7 days
- Overdue tasks
- Assigned tasks by status
- Tasks waiting for review
- Recently completed tasks
- Notifications
- Personal completion trend
- Quick actions

## 9.2 Team Dashboard

Display based on permission:

- Work by status
- Work by assignee
- Overdue tasks
- At-risk deadlines
- Upcoming team meetings
- Unassigned tasks
- Review queue
- Attendance trend
- Completion velocity
- Workload distribution

## 9.3 Admin Dashboard

- Active and inactive users
- Pending invitations
- Role distribution
- Failed login summary
- Background job health
- Email delivery health
- Storage usage
- Audit-event trends
- Failed webhooks
- Database and queue status indicators
- Feature-flag status

## 9.4 Reporting Rules

- Analytics must use authorization-filtered data.
- Counts must match list views using the same filters.
- Exports are generated asynchronously for large data sets.
- Reports include generation time, filters, and requesting user.
- CSV formula injection must be prevented.
- Sensitive exports require recent authentication.
- Export download links must expire.

---

# 10. Notification and Reminder System

## 10.1 Architecture

Use a durable background-job system for production:

```text
API transaction
   ├── writes business record
   └── writes outbox event in same database transaction

Outbox processor
   └── publishes job to queue

Worker
   ├── sends in-app notification
   ├── sends email
   └── records delivery result
```

This transactional outbox approach avoids losing notifications between database commit and queue publication.

## 10.2 Reminder Rules

- Default event reminders: 24 hours and 30 minutes before.
- Default deadline reminders: 72 hours, 24 hours, and at due time.
- Users may customize within policy.
- Avoid duplicate sends using an idempotency key.
- Retry transient failures with exponential backoff and jitter.
- Route permanently failed jobs to a dead-letter queue.
- Do not retry invalid recipient addresses indefinitely.
- Record provider message IDs where available.
- Do not include confidential content in email subject lines.
- Provide a link to the application rather than exposing full sensitive data.

## 10.3 Notification Status

- Pending
- Processing
- Delivered
- Failed
- Suppressed
- Read
- Archived

---

# 11. Search, Filtering, and Saved Views

## 11.1 Global Search

Search across authorized:

- Tasks
- Meetings
- Events
- Deadlines
- Teams
- Users
- Comments, if permitted

## 11.2 Filters

- Date range
- Status
- Priority
- Assignee
- Creator
- Reviewer
- Team
- Event type
- Deadline state
- Labels
- Completion state
- Attendance
- Has attachment
- Updated date

## 11.3 Search Security

- Apply authorization before returning results.
- Do not reveal restricted record titles through autocomplete.
- Limit query length and complexity.
- Escape or parameterize all search input.
- Rate limit expensive search endpoints.
- Log aggregate performance, not raw sensitive query text.
- Use PostgreSQL full-text search for initial production scale.
- Introduce a dedicated search engine only after measured need.

---

# 12. File, Comment, and Collaboration Features

## 12.1 Collaboration Model

Each primary record has:

- Activity history
- Comments
- Mentions
- Watchers
- Attachments
- Related records
- Permission-aware subscribers

## 12.2 Real-Time Updates

For MVP, use periodic refetch or query invalidation.

For production, optionally use:

- Server-Sent Events for notification counts and activity updates.
- WebSocket only where bidirectional real-time behavior is required.
- Connection authorization and revalidation.
- Backpressure and per-user connection limits.

Do not make core data consistency dependent on real-time transport.

---

# 13. AI-Assisted Features

AI is optional and must remain outside the MVP critical path.

## 13.1 Permitted Use Cases

- Generate a draft meeting summary from an approved transcript.
- Extract proposed action items.
- Suggest task titles and due dates.
- Detect possibly conflicting deadlines.
- Produce a natural-language weekly digest.
- Suggest labels or priority.
- Improve agenda structure.

## 13.2 Mandatory AI Safeguards

- Human review before saving generated content as authoritative.
- Clear “AI-generated draft” label.
- No automatic task assignment or deletion.
- Do not send private content to an external model without approved configuration.
- Redact secrets and unnecessary personal data.
- Maintain model/provider/version metadata.
- Log prompt template identifiers, not unrestricted sensitive prompts.
- Protect against prompt injection from transcripts and attachments.
- Restrict tools available to the model.
- Validate structured output against a schema.
- Set request size and cost limits.
- Allow organization-wide disabling.
- Define retention and training-use terms for external providers.
- Provide deterministic fallback when AI is unavailable.

---

# 14. System Architecture

## 14.1 Recommended Architecture

```mermaid
flowchart LR
    U[Browser User] --> RP[Reverse Proxy / TLS]
    RP --> FE[React Static Frontend]
    RP --> API[FastAPI Application]

    API --> PG[(PostgreSQL)]
    API --> R[(Redis / Queue)]
    API --> OBJ[(S3-Compatible Object Storage)]
    API --> MAIL[Email Provider]
    API --> OBS[Logs / Metrics / Traces]

    W[Background Worker] --> R
    W --> PG
    W --> OBJ
    W --> MAIL
    W --> OBS

    S[Scheduler] --> R
```

## 14.2 Deployment Units

- Frontend static bundle
- FastAPI web service
- Background worker
- Scheduler
- PostgreSQL
- Redis or equivalent queue/cache
- Object storage
- Reverse proxy/load balancer
- Observability stack
- Optional mail-capture service in development

## 14.3 Architectural Style

Use a **modular monolith**:

- One deployable backend initially.
- Separate modules and service interfaces.
- Shared transaction boundary where needed.
- Internal domain events.
- No direct cross-module table manipulation outside repositories/services.
- Easy extraction of notifications, analytics, or AI later.

## 14.4 Module Boundaries

```text
identity
organizations
teams
authorization
calendar
events
meetings
tasks
deadlines
attendance
comments
attachments
notifications
search
analytics
audit
integrations
ai
administration
```

---

# 15. Technology Decisions

## 15.1 Backend

- FastAPI
- Pydantic for validated schemas
- SQLAlchemy 2.x style ORM or SQLModel with disciplined repository patterns
- Alembic migrations
- PostgreSQL driver with asynchronous support where useful
- Background worker using Celery, Dramatiq, ARQ, or equivalent
- Redis for production queue and ephemeral coordination
- Structured JSON logging
- OpenTelemetry-compatible instrumentation
- Pytest

## 15.2 Frontend

- React
- Vite
- TypeScript in strict mode
- React Router
- TanStack Query or equivalent server-state library
- React Hook Form or equivalent
- Schema validation using Zod or equivalent
- Accessible component system
- Calendar library with keyboard and mobile support
- Vitest and React Testing Library
- Playwright for end-to-end tests

## 15.3 Database

- PostgreSQL
- UUID primary keys
- `timestamptz` for timestamps
- JSONB only for bounded extensibility, not as a substitute for schema design
- GIN indexes for full-text search or JSONB where justified
- Partial indexes for active records
- Row-level security as defense in depth for high-value tenant-scoped tables
- Dedicated migration and runtime roles

## 15.4 Deployment

- Docker multi-stage builds
- Docker Compose for development and demonstration
- Production deployment on a managed container platform, hardened VM, or orchestrator
- Managed PostgreSQL preferred
- TLS termination at a trusted reverse proxy/load balancer
- Separate development, staging, and production environments

---

# 16. Backend Architecture

## 16.1 Layering

```text
API Router
  ↓
Application Service / Use Case
  ↓
Domain Policy and Authorization
  ↓
Repository
  ↓
Database / External Adapter
```

### Responsibilities

- **Router:** HTTP parsing, dependency injection, response mapping.
- **Application service:** transaction coordination and use-case orchestration.
- **Domain policy:** state transitions, authorization conditions, invariants.
- **Repository:** persistence queries with organization/team scoping.
- **Adapter:** email, object storage, queue, AI provider, calendar integration.

## 16.2 Transaction Rules

- One transaction per state-changing use case.
- Audit and outbox records written in the same transaction as business changes.
- External network calls occur after commit through background jobs where possible.
- Idempotency keys supported for retryable create operations.
- Database deadlocks and serialization failures handled with bounded retry.
- No long-running file or email processing inside API transactions.

## 16.3 Error Model

Standard error response:

```json
{
  "error": {
    "code": "TASK_VERSION_CONFLICT",
    "message": "The task was updated by another user.",
    "details": {
      "current_version": 8
    },
    "request_id": "01J..."
  }
}
```

Rules:

- Do not return stack traces in production.
- Use stable machine-readable codes.
- Localize user-facing messages in the frontend.
- Return validation errors without exposing internal models.
- Map authorization denial to `403`; hide existence with `404` where appropriate.
- Use `409` for state or version conflict.
- Use `422` for semantically invalid input.
- Use `429` for rate limit.
- Use `503` for temporary dependency failure.

## 16.4 API Versioning

- Prefix public APIs with `/api/v1`.
- Keep additive changes backward compatible.
- Deprecate fields with documented timelines.
- Version webhooks separately where required.
- Generate OpenAPI documentation.
- Protect production API docs behind authentication or disable public access.

---

# 17. Frontend Architecture

## 17.1 Route Map

```text
/login
/forgot-password
/reset-password
/invitations/:token

/app
/app/dashboard
/app/calendar
/app/events/:id
/app/meetings
/app/meetings/:id
/app/tasks
/app/tasks/board
/app/tasks/:id
/app/deadlines
/app/notifications
/app/teams
/app/teams/:id
/app/profile
/app/settings/notifications

/app/admin/users
/app/admin/roles
/app/admin/teams
/app/admin/audit
/app/admin/settings
/app/admin/jobs
```

## 17.2 Frontend Principles

- Treat API as the source of truth.
- Never authorize solely in the client.
- Centralize API client and error handling.
- Keep access token in memory when using the recommended token design.
- Use secure cookies for refresh/session material.
- Avoid sensitive data in `localStorage`.
- Cancel stale requests.
- Prevent duplicate form submission.
- Use optimistic updates only when rollback is reliable.
- Provide empty, loading, error, and permission-denied states.
- Support keyboard use and visible focus.
- Avoid color-only status indicators.
- Use semantic HTML and accessible labels.
- Preserve unsaved form work where practical.

## 17.3 State Categories

- **Server state:** query library cache.
- **Form state:** form library.
- **Session state:** minimal authenticated-user context.
- **UI state:** local component or small scoped store.
- **URL state:** filters, sort, pagination, selected date.

Avoid one global store containing all fetched business data.

---

# 18. Database Design

## 18.1 Core Entity Relationship Diagram

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : has
    USERS ||--o{ ORGANIZATION_MEMBERS : joins
    ORGANIZATIONS ||--o{ TEAMS : contains
    TEAMS ||--o{ TEAM_MEMBERS : has
    USERS ||--o{ TEAM_MEMBERS : joins

    ORGANIZATIONS ||--o{ EVENTS : owns
    TEAMS ||--o{ EVENTS : scopes
    EVENTS ||--o{ EVENT_PARTICIPANTS : includes
    USERS ||--o{ EVENT_PARTICIPANTS : participates

    EVENTS ||--o| MEETINGS : specializes
    MEETINGS ||--o{ MEETING_ATTENDANCE : tracks
    USERS ||--o{ MEETING_ATTENDANCE : attends

    ORGANIZATIONS ||--o{ TASKS : owns
    TEAMS ||--o{ TASKS : scopes
    TASKS ||--o{ TASK_ASSIGNMENTS : has
    USERS ||--o{ TASK_ASSIGNMENTS : receives
    TASKS ||--o{ TASK_DEPENDENCIES : depends
    TASKS ||--o{ COMMENTS : discussed
    TASKS ||--o{ ATTACHMENTS : contains

    ORGANIZATIONS ||--o{ DEADLINES : owns
    DEADLINES ||--o{ DEADLINE_TASKS : links
    TASKS ||--o{ DEADLINE_TASKS : linked

    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ SESSIONS : authenticates
    USERS ||--o{ AUDIT_LOGS : acts
```

## 18.2 Recommended Tables

### Identity and Access

- `users`
- `user_emails`
- `password_credentials`
- `sessions`
- `refresh_tokens`
- `mfa_methods`
- `password_reset_tokens`
- `email_verification_tokens`
- `organizations`
- `organization_members`
- `roles`
- `permissions`
- `role_permissions`
- `member_roles`
- `teams`
- `team_members`
- `explicit_grants`

### Calendar and Meetings

- `events`
- `event_occurrences`
- `event_participants`
- `event_reminders`
- `meetings`
- `meeting_agenda_items`
- `meeting_minutes`
- `meeting_decisions`
- `meeting_attendance`

### Work Management

- `tasks`
- `task_assignments`
- `task_watchers`
- `task_dependencies`
- `task_status_history`
- `task_labels`
- `labels`
- `deadlines`
- `deadline_tasks`

### Collaboration and Platform

- `comments`
- `comment_mentions`
- `attachments`
- `attachment_links`
- `notifications`
- `notification_deliveries`
- `notification_preferences`
- `outbox_events`
- `background_jobs`
- `audit_logs`
- `saved_views`
- `feature_flags`
- `webhook_endpoints`
- `webhook_deliveries`

## 18.3 Common Columns

Business tables should generally include:

```text
id UUID PRIMARY KEY
organization_id UUID NOT NULL
created_at TIMESTAMPTZ NOT NULL
created_by UUID
updated_at TIMESTAMPTZ NOT NULL
updated_by UUID
deleted_at TIMESTAMPTZ NULL
deleted_by UUID NULL
version INTEGER NOT NULL DEFAULT 1
```

## 18.4 Important Constraints

- Unique normalized email.
- Membership uniqueness per user and organization.
- Team membership uniqueness.
- End time must be after start time.
- Due date cannot be earlier than valid start date.
- Self-dependency on tasks is forbidden.
- Duplicate dependency edges are forbidden.
- Cross-organization foreign references are forbidden.
- Attendance uniqueness per meeting and participant.
- Active invitation token hash uniqueness.
- Refresh token family and token identifier uniqueness.
- Event recurrence exceptions unique per occurrence date.

## 18.5 Indexing Plan

- `users(lower(email))`
- `organization_members(organization_id, user_id)`
- `team_members(team_id, user_id)`
- `events(organization_id, starts_at, ends_at)` where not deleted
- `tasks(organization_id, status, due_at)` where not deleted
- `task_assignments(user_id, task_id)`
- `notifications(user_id, read_at, created_at desc)`
- `audit_logs(organization_id, created_at desc)`
- Full-text index on authorized searchable text
- Partial index for overdue/open tasks
- Partial index for unprocessed outbox events

Indexes must be based on measured query plans, not added indiscriminately.

## 18.6 Row-Level Security

For production, evaluate PostgreSQL RLS on tenant-scoped tables:

- Set an organization context for each transaction.
- Enforce `organization_id` match.
- Use a runtime database role that cannot bypass RLS.
- Use `FORCE ROW LEVEL SECURITY` where appropriate.
- Keep application authorization as the primary policy layer.
- Test RLS directly.
- Ensure migrations and backup roles are separately controlled.

---

# 19. API Design

## 19.1 General Conventions

- JSON request and response.
- UTF-8.
- ISO 8601 timestamps with offsets.
- Cursor pagination for large/changeable collections.
- Explicit sort fields.
- Maximum page size.
- Idempotency key for selected POST endpoints.
- ETag or version field for concurrency control.
- Request ID returned in every response.
- Consistent authorization errors.
- Input schemas reject unknown security-sensitive fields.

## 19.2 Authentication Endpoints

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/logout-all
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/change-password
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/{session_id}
POST   /api/v1/auth/mfa/enroll
POST   /api/v1/auth/mfa/verify
DELETE /api/v1/auth/mfa/{method_id}
```

## 19.3 User and Team Endpoints

```text
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users
POST   /api/v1/users/invitations
GET    /api/v1/users/{user_id}
PATCH  /api/v1/users/{user_id}
POST   /api/v1/users/{user_id}/activate
POST   /api/v1/users/{user_id}/deactivate
PUT    /api/v1/users/{user_id}/roles

GET    /api/v1/teams
POST   /api/v1/teams
GET    /api/v1/teams/{team_id}
PATCH  /api/v1/teams/{team_id}
POST   /api/v1/teams/{team_id}/archive
GET    /api/v1/teams/{team_id}/members
POST   /api/v1/teams/{team_id}/members
DELETE /api/v1/teams/{team_id}/members/{user_id}
```

## 19.4 Event and Calendar Endpoints

```text
GET    /api/v1/calendar
GET    /api/v1/events
POST   /api/v1/events
GET    /api/v1/events/{event_id}
PATCH  /api/v1/events/{event_id}
DELETE /api/v1/events/{event_id}
POST   /api/v1/events/{event_id}/restore
POST   /api/v1/events/{event_id}/cancel
POST   /api/v1/events/{event_id}/duplicate
POST   /api/v1/events/{event_id}/rsvp
GET    /api/v1/events/{event_id}/activity
GET    /api/v1/events/{event_id}/export
POST   /api/v1/events/import
```

## 19.5 Task Endpoints

```text
GET    /api/v1/tasks
POST   /api/v1/tasks
GET    /api/v1/tasks/{task_id}
PATCH  /api/v1/tasks/{task_id}
DELETE /api/v1/tasks/{task_id}
POST   /api/v1/tasks/{task_id}/restore
POST   /api/v1/tasks/{task_id}/assignments
DELETE /api/v1/tasks/{task_id}/assignments/{user_id}
POST   /api/v1/tasks/{task_id}/transition
POST   /api/v1/tasks/{task_id}/submit-review
POST   /api/v1/tasks/{task_id}/approve
POST   /api/v1/tasks/{task_id}/request-changes
POST   /api/v1/tasks/{task_id}/complete
POST   /api/v1/tasks/{task_id}/reopen
POST   /api/v1/tasks/{task_id}/dependencies
DELETE /api/v1/tasks/{task_id}/dependencies/{dependency_id}
GET    /api/v1/tasks/{task_id}/activity
POST   /api/v1/tasks/bulk
```

## 19.6 Meeting Endpoints

```text
GET    /api/v1/meetings
POST   /api/v1/meetings
GET    /api/v1/meetings/{meeting_id}
PATCH  /api/v1/meetings/{meeting_id}
POST   /api/v1/meetings/{meeting_id}/reschedule
POST   /api/v1/meetings/{meeting_id}/cancel
PUT    /api/v1/meetings/{meeting_id}/agenda
PUT    /api/v1/meetings/{meeting_id}/attendance
PUT    /api/v1/meetings/{meeting_id}/minutes
POST   /api/v1/meetings/{meeting_id}/decisions
POST   /api/v1/meetings/{meeting_id}/action-items
POST   /api/v1/meetings/{meeting_id}/generate-summary
```

## 19.7 Collaboration Endpoints

```text
GET    /api/v1/{resource}/{id}/comments
POST   /api/v1/{resource}/{id}/comments
PATCH  /api/v1/comments/{comment_id}
DELETE /api/v1/comments/{comment_id}

POST   /api/v1/attachments/upload-intents
POST   /api/v1/attachments/{attachment_id}/complete
GET    /api/v1/attachments/{attachment_id}/download
DELETE /api/v1/attachments/{attachment_id}
```

## 19.8 Notification and Dashboard Endpoints

```text
GET    /api/v1/dashboard/me
GET    /api/v1/dashboard/teams/{team_id}
GET    /api/v1/notifications
POST   /api/v1/notifications/{notification_id}/read
POST   /api/v1/notifications/read-all
GET    /api/v1/notification-preferences
PUT    /api/v1/notification-preferences
```

## 19.9 Admin Endpoints

```text
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/jobs
POST   /api/v1/admin/jobs/{job_id}/retry
GET    /api/v1/admin/security-events
GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings
GET    /api/v1/admin/feature-flags
PATCH  /api/v1/admin/feature-flags/{flag_key}
POST   /api/v1/admin/exports
```

---

# 20. Security Architecture

## 20.1 Security Baseline

Target OWASP ASVS 5.0 Level 2 controls for the production application, with additional controls for privileged administration, file handling, and AI processing. Use OWASP API Security Top 10 as an API threat checklist.

## 20.2 Threat Model

Primary threats:

- Credential stuffing and brute-force login
- Broken object-level authorization
- Broken function-level authorization
- Privilege escalation
- JWT validation errors
- Refresh-token theft or replay
- Cross-site scripting
- Cross-site request forgery
- SQL injection
- Mass assignment
- Insecure file upload
- SSRF through URLs, imports, or integrations
- Email or notification abuse
- Rate-limit bypass and resource exhaustion
- Sensitive-data exposure through logs and exports
- Supply-chain compromise
- Misconfigured CORS or reverse proxy
- Weak secrets management
- Unauthorized administrative action
- Insider misuse
- Prompt injection and data exfiltration through AI features

## 20.3 Authentication Design

Recommended browser architecture:

- Short-lived signed JWT access token.
- Access token lifetime approximately 10–15 minutes.
- Access token kept in frontend memory, not persistent browser storage.
- Long-lived refresh token represented by high-entropy opaque value.
- Refresh token stored in `Secure`, `HttpOnly`, appropriately scoped `SameSite` cookie.
- Store only a hash of the refresh token in the database.
- Rotate refresh token on every use.
- Detect reuse of an invalidated token and revoke the token family.
- Bind refresh tokens to a session record.
- Validate issuer, audience, expiration, not-before, token type, key ID, and allowed algorithm.
- Use asymmetric signing such as EdDSA or RS256; protect private keys.
- Publish or internally expose controlled public verification keys.
- Support signing-key rotation.
- Reject algorithm confusion and unrecognized algorithms.
- Include a unique token ID and session ID.
- Do not place confidential data in JWT claims.
- Recheck account activation and permission version on sensitive actions.
- Require recent authentication for password, MFA, email, export, and role changes.

Alternative: a secure server-managed session cookie is acceptable and can be simpler for a same-origin internal web application. Do not use JWT merely because it is listed in the stack; document the reason for the chosen design.

## 20.4 Password Security

- Hash passwords using Argon2id with calibrated cost.
- Never encrypt passwords reversibly.
- Allow long passphrases.
- Block known compromised passwords where feasible.
- Do not silently truncate.
- Do not require arbitrary periodic changes unless compromise is suspected.
- Rate limit authentication.
- Use generic failure messages.
- Alert on suspicious account behavior.
- Protect password-reset tokens as secrets.
- Invalidate reset tokens after use.
- Revoke sessions after password reset unless policy explicitly says otherwise.

## 20.5 MFA

Production requirements:

- Mandatory for Platform Admin and ACM Admin.
- TOTP or WebAuthn/passkeys.
- Recovery codes shown once and stored hashed.
- MFA reset requires a controlled recovery process.
- Audit all enrollment, removal, reset, and failed challenges.
- Apply step-up authentication for high-risk operations.

## 20.6 Authorization

- Central authorization service/policy functions.
- Permission checks in application-service layer.
- Scoped repository queries.
- Object-level checks for every identifier.
- Field-level restrictions for sensitive updates.
- No role names embedded throughout route code.
- Test every permission boundary.
- Deny by default.
- Avoid exposing sequential identifiers.
- Treat bulk and export endpoints as high risk.
- Validate team and organization relationship server-side.

## 20.7 CSRF

When cookies authenticate any state-changing request:

- Use `SameSite` cookies as a defense-in-depth control.
- Use synchronizer token or signed double-submit token.
- Verify `Origin` and, where useful, `Referer`.
- Do not use `GET` for state changes.
- Require custom headers for SPA state-changing calls.
- Protect refresh, logout, and account-management endpoints.

## 20.8 CORS

- Explicit allowlist of frontend origins.
- No wildcard origin with credentials.
- Restrict methods and headers.
- Different configuration by environment.
- Validate reverse-proxy host headers.
- Do not use CORS as an authorization mechanism.

## 20.9 Input and Output Security

- Validate all request bodies, paths, query parameters, and headers.
- Set maximum lengths.
- Reject unknown privileged fields.
- Use parameterized SQL/ORM expressions.
- Encode output by context.
- Sanitize user-authored rich text.
- Use restrictive Content Security Policy.
- Prevent open redirects.
- Validate URLs and schemes.
- Block access to local/private network ranges for server-side URL fetches.
- Restrict and sandbox file parsing.

## 20.10 Security Headers

Recommended:

```text
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
```

Use frame protection through CSP `frame-ancestors`. Verify compatibility before enabling strict cross-origin isolation.

## 20.11 Rate Limiting and Abuse Prevention

Rate limits by endpoint risk:

- Login: per account and per network source.
- Password reset: per account, destination, and network source.
- Refresh: per session.
- Search: per user.
- File upload: per user and organization quota.
- Export: low frequency and asynchronous.
- AI endpoints: per user, organization, and budget.
- Email invitation: low limit with admin authorization.

Use a trusted proxy configuration so client IP cannot be spoofed. Return `429` and `Retry-After`.

## 20.12 File Security

- Allowlist MIME types and extensions.
- Verify actual file signature.
- Maximum size and count.
- Random object key.
- Malware scan.
- Quarantine until scan passes.
- Serve from separate origin or force download.
- Set safe `Content-Disposition`.
- Prevent SVG/HTML script execution.
- No direct filesystem path from user input.
- Short-lived download authorization.
- Per-organization storage quotas.
- Retention and deletion workflow.

## 20.13 Database Security

- Application runtime user is not a superuser or owner.
- Separate migration role.
- Least-privilege grants.
- TLS for database connections outside a trusted local boundary.
- Encryption at rest through managed storage or disk encryption.
- Sensitive field encryption where threat model requires it.
- Parameterized queries.
- RLS defense in depth.
- Statement and lock timeouts.
- Connection pool limits.
- Backups encrypted and access controlled.
- Restore tests on a schedule.
- Database not directly exposed to the public internet.

## 20.14 Secrets Management

- No secrets in Git.
- No production secrets baked into images.
- Use a secrets manager or protected runtime secret mechanism.
- Rotate credentials.
- Separate secrets per environment.
- Restrict human access.
- Audit secret access where supported.
- Use short-lived cloud credentials through workload identity/OIDC where available.
- Provide `.env.example` with placeholders only.
- Treat logs, build output, and crash reports as possible leak channels.

## 20.15 Logging Security

- Structured logs.
- Correlation/request IDs.
- Security event category.
- No passwords, tokens, reset links, cookies, full authorization headers, or encryption keys.
- Redact sensitive personal content.
- Protect logs from unauthorized modification.
- Retain according to policy.
- Alert on repeated failures, role changes, export spikes, and token reuse.
- Restrict audit-log access.

## 20.16 Container Security

- Minimal base images.
- Pin dependencies and image digests for release.
- Run as non-root.
- Read-only root filesystem where possible.
- Drop unnecessary Linux capabilities.
- No privileged containers.
- Do not mount Docker socket into application containers.
- Resource limits.
- Health checks.
- Separate networks.
- Vulnerability scanning.
- Signed images and provenance/attestations where feasible.
- Regular rebuilds for base-image patches.

## 20.17 Secure Development Lifecycle

- Threat modeling before high-risk features.
- Mandatory code review.
- Branch protection.
- Secret scanning.
- Dependency scanning.
- Static analysis.
- Container scanning.
- Software Bill of Materials.
- Dynamic security testing on staging.
- Authorization test suite.
- Security acceptance gate.
- Documented vulnerability response process.
- Critical vulnerabilities block release unless formally risk-accepted.

---

# 21. Privacy and Data Governance

## 21.1 Data Classification

| Class | Examples | Handling |
|---|---|---|
| Public | Public event title approved for publication | May be publicly shared only through approved flow |
| Internal | Standard tasks, internal schedules | Authenticated organization members |
| Confidential | Private minutes, review notes, member contact data | Explicit role/team/participant access |
| Restricted | Credentials, recovery codes, signing keys | Dedicated secure stores; never exposed in normal UI |

## 21.2 Data Minimization

- Collect only necessary member data.
- Avoid storing unnecessary personal addresses or identification data.
- Make optional profile fields clearly optional.
- Do not place sensitive content in notification previews.
- Separate analytics identifiers from direct personal data where practical.

## 21.3 Retention

Example policy, adjustable by ACM:

- Active business records: retained while operationally required.
- Soft-deleted tasks/events: purge after 90 days unless on hold.
- Audit logs: 1 year minimum, based on policy.
- Authentication security logs: 180 days minimum.
- Failed job payloads: 30 days after resolution.
- Attachments: follow parent record and retention policy.
- Invitations and reset tokens: purge shortly after expiry.
- AI prompts/outputs: shortest practical period and configurable.

## 21.4 Data Subject and Administrative Workflows

- Export user profile and authored content where policy requires.
- Correct inaccurate profile data.
- Deactivate account while preserving organizational records.
- Anonymize data where deletion is required and retention is not justified.
- Record legal or administrative holds.
- Restrict export to authorized admins.

---

# 22. Non-Functional Requirements

## 22.1 Availability and Reliability

- Production target: 99.9% monthly API availability.
- Stateless API instances.
- Graceful shutdown.
- Health and readiness probes.
- Queue retry with dead-letter handling.
- Idempotent scheduled tasks.
- No single local disk dependency for durable data.
- Database backups and point-in-time recovery where available.

## 22.2 Performance

Under agreed normal load:

- p95 dashboard load API < 800 ms.
- p95 list read < 500 ms.
- p95 write < 800 ms excluding file processing.
- Initial frontend shell usable within 3 seconds on reasonable campus internet.
- Paginate lists.
- Avoid N+1 queries.
- Cache only data safe to cache.
- Generate large reports asynchronously.

## 22.3 Scalability

Initial design target:

- 10,000 registered users
- 2,000 monthly active users
- 200 concurrent active users
- 1 million tasks/events combined over lifecycle
- 100 notifications per second burst through queue

These are design targets, not claims of tested capacity. Load testing must establish real limits.

## 22.4 Accessibility

Target WCAG 2.2 AA:

- Keyboard-accessible navigation.
- Visible focus.
- Semantic headings and landmarks.
- Form labels and error association.
- Sufficient contrast.
- No color-only meaning.
- Accessible modal focus management.
- Screen-reader announcements for important async updates.
- Calendar has an accessible list/agenda alternative.
- Drag-and-drop has keyboard alternative.
- Reduced-motion support.

## 22.5 Browser Support

- Current and previous major versions of Chrome, Edge, Firefox, and Safari.
- Responsive layout for modern mobile browsers.
- Document exceptions after testing.

## 22.6 Maintainability

- Type checking.
- Linting and formatting.
- Modular boundaries.
- API schema generation.
- Database migrations reviewed.
- Architecture decision records.
- Testable services.
- No business logic duplicated between route handlers.
- Dependency update policy.

---

# 23. Observability and Operations

## 23.1 Metrics

- Request count, latency, error rate.
- Database connection usage.
- Query latency.
- Queue depth and age.
- Job retries and failures.
- Email delivery outcomes.
- Notification generation delay.
- Login success/failure.
- Rate-limit events.
- File scan outcomes.
- Storage usage.
- AI usage and failures if enabled.

## 23.2 Logs

- JSON logs.
- Timestamp, level, service, environment.
- Request ID and trace ID.
- User/session pseudonymous identifier where appropriate.
- Route template rather than raw sensitive URL.
- Sanitized error code.
- Audit logs separated logically from operational logs.

## 23.3 Tracing

Trace:

- Incoming API request.
- Database calls.
- Queue publish.
- Worker job.
- External email/object-storage calls.

Use sampling and avoid putting sensitive payloads into spans.

## 23.4 Alerts

Alert examples:

- Error-rate spike.
- API unavailable.
- Database storage or connections near limit.
- Queue age beyond reminder SLA.
- Repeated token reuse detection.
- Large failed-login spike.
- Backup failure.
- Certificate expiry.
- Object-storage or email-provider outage.
- Dead-letter queue growth.
- Critical vulnerability detected in release image.

---

# 24. Deployment Architecture

## 24.1 Environments

- Local development
- Automated test
- Staging
- Production

No production credentials or data in lower environments.

## 24.2 Local Docker Compose

Suggested services:

```text
frontend
api
worker
scheduler
postgres
redis
minio
mailpit
```

## 24.3 Production Topology

```mermaid
flowchart TB
    Internet --> WAF[Optional WAF / CDN]
    WAF --> LB[TLS Load Balancer / Reverse Proxy]
    LB --> FE[Frontend Static Hosting]
    LB --> API1[API Instance 1]
    LB --> API2[API Instance 2]

    API1 --> DB[(Managed PostgreSQL)]
    API2 --> DB
    API1 --> Q[(Managed Redis/Queue)]
    API2 --> Q

    W1[Worker 1] --> Q
    W2[Worker 2] --> Q
    W1 --> DB
    W2 --> DB

    API1 --> S3[(Object Storage)]
    API2 --> S3
    W1 --> S3
    W2 --> S3

    API1 --> O[Observability]
    API2 --> O
    W1 --> O
    W2 --> O
```

## 24.4 Release Strategy

- Build immutable images.
- Run migrations as controlled release step.
- Deploy to staging.
- Run smoke and security checks.
- Require approval for production.
- Use rolling or blue/green deployment.
- Keep rollback artifact.
- Migrations must be backward compatible during rollout.
- Separate destructive migration into later release.

## 24.5 Backup and Disaster Recovery

- Automated database backups.
- Point-in-time recovery if supported.
- Object-storage versioning or backup.
- Encrypted backups.
- Cross-location copy where appropriate.
- Quarterly restore test.
- Document RPO and RTO.
- Keep infrastructure configuration in version control.
- Maintain emergency contact and incident checklist.

---

# 25. CI/CD and Supply-Chain Security

## 25.1 Pull Request Pipeline

- Format check
- Lint
- Type check
- Unit tests
- Integration tests with PostgreSQL
- Frontend component tests
- Migration validation
- Static security analysis
- Dependency vulnerability scan
- Secret scan
- License policy check
- Build frontend and backend images
- Generate SBOM
- Container scan

## 25.2 Main Branch Pipeline

- Repeat required checks.
- Build immutable versioned artifacts.
- Sign artifacts where supported.
- Publish to registry.
- Deploy to staging.
- Apply migrations.
- Run API smoke tests.
- Run selected end-to-end tests.
- Run DAST baseline.
- Manual approval for production.
- Deploy production.
- Run post-deploy smoke tests.
- Monitor error budget and rollback if needed.

## 25.3 Pipeline Security

- Pin third-party actions.
- Minimal workflow permissions.
- Protect deployment environments.
- Use OIDC/workload identity for cloud access instead of long-lived keys.
- Prevent untrusted pull-request code from receiving secrets.
- Review dependency updates.
- Restrict artifact write access.
- Record provenance.

---

# 26. Testing Strategy

## 26.1 Test Pyramid

### Unit Tests

- Domain status transitions
- Reminder time calculation
- Permission policy functions
- Date/time conversions
- Token validation helpers
- File validation
- Search filter parsing

### Integration Tests

- API plus PostgreSQL
- Authentication and refresh rotation
- RLS policies
- Task assignment rules
- Calendar conflict detection
- Outbox creation
- Worker delivery behavior
- Object-storage adapter
- Email adapter
- Migrations from empty database

### End-to-End Tests

Critical paths:

1. Invite, register, login.
2. Admin assigns role.
3. Core member creates event.
4. Member sees permitted event.
5. Core member assigns task.
6. Assignee updates and submits task.
7. Reviewer approves.
8. Meeting created and attendance recorded.
9. Unauthorized user is denied.
10. Logout and token refresh invalidation.

## 26.2 Security Tests

- BOLA tests for every resource.
- Function-level role tests.
- Cross-organization access attempts.
- Mass-assignment tests.
- JWT invalid algorithm, issuer, audience, expiry.
- Refresh-token replay.
- CSRF checks.
- CORS configuration.
- Rate limit.
- SQL injection payloads.
- XSS in comments and descriptions.
- File upload bypass attempts.
- SSRF URL tests.
- Export authorization.
- Audit event creation.
- Deactivated-user access.
- Privilege change session behavior.

## 26.3 Performance Tests

Scenarios:

- Dashboard load.
- Calendar range query.
- Task list with filters.
- Kanban board.
- Concurrent status updates.
- Notification burst.
- Large audit search.
- Large CSV export.
- Attachment upload intent.

## 26.4 Test Data

- Seed deterministic users for every role.
- Seed multiple teams.
- Include records across authorization boundaries.
- Include overdue, future, recurring, cancelled, and deleted records.
- Do not use production personal data.

---

# 27. MVP Acceptance Criteria

## 27.1 Authentication

- [ ] User can log in with valid credentials.
- [ ] Invalid login uses generic error.
- [ ] User can log out.
- [ ] Passwords are securely hashed.
- [ ] Protected routes reject unauthenticated requests.
- [ ] Deactivated user is denied.
- [ ] Access and refresh behavior is documented.
- [ ] Authentication endpoints are rate limited.

## 27.2 Roles

- [ ] Admin can assign one of the required roles.
- [ ] First Year Member cannot access admin routes.
- [ ] Reviewer can review only permitted tasks.
- [ ] Core Member can manage team records.
- [ ] Server enforces object-level access.
- [ ] Authorization tests cover positive and negative cases.

## 27.3 Calendar and Events

- [ ] Month and week views render.
- [ ] Authorized user can create event.
- [ ] Authorized user can edit event.
- [ ] Authorized user can cancel or delete event.
- [ ] Unauthorized user cannot change event.
- [ ] Deadline appears on calendar.
- [ ] Time-zone display is correct.

## 27.4 Tasks

- [ ] Authorized user can create task.
- [ ] Task can be assigned.
- [ ] Assignee can update allowed fields.
- [ ] Status can transition through supported workflow.
- [ ] Task can be completed.
- [ ] Due date and priority are visible.
- [ ] Overdue task is identified.
- [ ] Reviewer flow works.

## 27.5 Meetings

- [ ] Authorized user can schedule meeting.
- [ ] Participants can be added.
- [ ] Meeting details are visible to permitted participants.
- [ ] Reminder is created.
- [ ] Meeting can be rescheduled and cancelled.
- [ ] Attendance can be recorded by authorized user.

## 27.6 Dashboard

- [ ] Upcoming events shown.
- [ ] Upcoming deadlines shown.
- [ ] Assigned tasks shown.
- [ ] Completed tasks shown.
- [ ] Pending and overdue tasks shown.
- [ ] Counts match corresponding list filters.

## 27.7 Delivery

- [ ] Docker setup works from documented commands.
- [ ] Migrations initialize clean database.
- [ ] Seed command creates demo data.
- [ ] API documentation is available in development.
- [ ] Automated tests pass.
- [ ] README includes setup and credentials guidance.
- [ ] No real secrets are committed.
- [ ] Basic deployment is demonstrated.

---

# 28. Implementation Backlog

Priority:

- **P0:** required for submission MVP.
- **P1:** production essential immediately after MVP.
- **P2:** valuable enterprise enhancement.
- **P3:** optional/future.

## 28.1 Foundation

- [ ] **ARC-001 P0** Create monorepo or clearly linked frontend/backend repositories.
- [ ] **ARC-002 P0** Define coding conventions and branch strategy.
- [ ] **ARC-003 P0** Add backend formatting, linting, and type checking.
- [ ] **ARC-004 P0** Add frontend formatting, linting, and TypeScript strict mode.
- [ ] **ARC-005 P0** Add Docker Compose development environment.
- [ ] **ARC-006 P0** Add PostgreSQL and migration framework.
- [ ] **ARC-007 P0** Add environment configuration validation.
- [ ] **ARC-008 P0** Add structured logging and request IDs.
- [ ] **ARC-009 P0** Add health and readiness endpoints.
- [ ] **ARC-010 P1** Add Redis and background worker.
- [ ] **ARC-011 P1** Add outbox processor.
- [ ] **ARC-012 P1** Add object-storage adapter.
- [ ] **ARC-013 P1** Add feature-flag framework.
- [ ] **ARC-014 P1** Add architecture decision record directory.

## 28.2 Identity and Authentication

- [ ] **IAM-001 P0** Create user schema and migration.
- [ ] **IAM-002 P0** Implement password hashing.
- [ ] **IAM-003 P0** Implement login endpoint.
- [ ] **IAM-004 P0** Implement short-lived access token.
- [ ] **IAM-005 P0** Implement refresh session and rotation.
- [ ] **IAM-006 P0** Implement logout and token revocation.
- [ ] **IAM-007 P0** Implement current-user endpoint.
- [ ] **IAM-008 P0** Implement protected frontend routes.
- [ ] **IAM-009 P0** Implement admin user list.
- [ ] **IAM-010 P0** Implement account activation/deactivation.
- [ ] **IAM-011 P0** Implement role assignment.
- [ ] **IAM-012 P0** Rate limit authentication.
- [ ] **IAM-013 P1** Invitation flow.
- [ ] **IAM-014 P1** Email verification.
- [ ] **IAM-015 P1** Forgot/reset password.
- [ ] **IAM-016 P1** Session management UI.
- [ ] **IAM-017 P1** Refresh-token replay detection.
- [ ] **IAM-018 P1** MFA for admins.
- [ ] **IAM-019 P2** WebAuthn/passkeys.
- [ ] **IAM-020 P2** OpenID Connect SSO.

## 28.3 Authorization

- [ ] **AUTHZ-001 P0** Define permission constants.
- [ ] **AUTHZ-002 P0** Map required roles to permissions.
- [ ] **AUTHZ-003 P0** Build authorization dependency/policy layer.
- [ ] **AUTHZ-004 P0** Add organization scope to repositories.
- [ ] **AUTHZ-005 P0** Add team and ownership checks.
- [ ] **AUTHZ-006 P0** Add negative authorization tests.
- [ ] **AUTHZ-007 P0** Prevent mass assignment.
- [ ] **AUTHZ-008 P1** Add explicit temporary grants.
- [ ] **AUTHZ-009 P1** Add PostgreSQL RLS defense in depth.
- [ ] **AUTHZ-010 P2** Build admin permission editor.

## 28.4 Organization and Teams

- [ ] **ORG-001 P0** Create organization and membership tables.
- [ ] **ORG-002 P0** Seed default ACM organization.
- [ ] **ORG-003 P0** Create team tables.
- [ ] **ORG-004 P0** Team list and detail API.
- [ ] **ORG-005 P0** Team membership management.
- [ ] **ORG-006 P0** Team selector in frontend.
- [ ] **ORG-007 P1** Team archive workflow.
- [ ] **ORG-008 P1** Ownership transfer.
- [ ] **ORG-009 P2** Private team support.

## 28.5 Calendar and Events

- [ ] **CAL-001 P0** Event schema and migration.
- [ ] **CAL-002 P0** Event create API.
- [ ] **CAL-003 P0** Event list/range API.
- [ ] **CAL-004 P0** Event detail API.
- [ ] **CAL-005 P0** Event edit API.
- [ ] **CAL-006 P0** Event cancel/delete API.
- [ ] **CAL-007 P0** Event authorization tests.
- [ ] **CAL-008 P0** Month calendar view.
- [ ] **CAL-009 P0** Week calendar view.
- [ ] **CAL-010 P0** Event form.
- [ ] **CAL-011 P0** Event detail page/modal.
- [ ] **CAL-012 P0** Deadline display on calendar.
- [ ] **CAL-013 P0** Time-zone conversion tests.
- [ ] **CAL-014 P1** Participant RSVP.
- [ ] **CAL-015 P1** Conflict detection.
- [ ] **CAL-016 P1** Recurrence rules.
- [ ] **CAL-017 P1** Recurrence exceptions.
- [ ] **CAL-018 P2** iCalendar export.
- [ ] **CAL-019 P2** iCalendar import.
- [ ] **CAL-020 P2** External calendar synchronization.

## 28.6 Tasks

- [ ] **TASK-001 P0** Task schema and migration.
- [ ] **TASK-002 P0** Task create API.
- [ ] **TASK-003 P0** Task list/filter API.
- [ ] **TASK-004 P0** Task detail API.
- [ ] **TASK-005 P0** Task edit API.
- [ ] **TASK-006 P0** Task delete/archive API.
- [ ] **TASK-007 P0** Assignment API.
- [ ] **TASK-008 P0** Status transition service.
- [ ] **TASK-009 P0** Complete and reopen actions.
- [ ] **TASK-010 P0** Priority and deadline fields.
- [ ] **TASK-011 P0** Task list UI.
- [ ] **TASK-012 P0** Task create/edit form.
- [ ] **TASK-013 P0** Task detail UI.
- [ ] **TASK-014 P0** My tasks filter.
- [ ] **TASK-015 P0** Overdue indicator.
- [ ] **TASK-016 P0** Reviewer approval/request-changes flow.
- [ ] **TASK-017 P0** Authorization and transition tests.
- [ ] **TASK-018 P1** Optimistic locking.
- [ ] **TASK-019 P1** Labels.
- [ ] **TASK-020 P1** Subtasks.
- [ ] **TASK-021 P1** Dependencies.
- [ ] **TASK-022 P1** Watchers.
- [ ] **TASK-023 P1** Kanban board.
- [ ] **TASK-024 P2** Bulk update.
- [ ] **TASK-025 P2** Work-in-progress limits.
- [ ] **TASK-026 P2** Recurring tasks.
- [ ] **TASK-027 P2** Custom fields.

## 28.7 Deadlines

- [ ] **DDL-001 P0** Decide dedicated deadline entity versus event specialization.
- [ ] **DDL-002 P0** Implement deadline schema.
- [ ] **DDL-003 P0** Deadline CRUD API.
- [ ] **DDL-004 P0** Deadline list UI.
- [ ] **DDL-005 P0** Dashboard due-soon and overdue logic.
- [ ] **DDL-006 P0** Link deadline to tasks.
- [ ] **DDL-007 P1** Submission evidence.
- [ ] **DDL-008 P1** Escalation rules.
- [ ] **DDL-009 P2** Deadline risk scoring.

## 28.8 Meetings and Attendance

- [ ] **MTG-001 P0** Meeting schema.
- [ ] **MTG-002 P0** Schedule meeting API.
- [ ] **MTG-003 P0** Meeting list/detail API.
- [ ] **MTG-004 P0** Edit/reschedule/cancel API.
- [ ] **MTG-005 P0** Participant management.
- [ ] **MTG-006 P0** Meeting form UI.
- [ ] **MTG-007 P0** Meeting detail UI.
- [ ] **MTG-008 P0** Basic reminder record.
- [ ] **MTG-009 P0** Attendance schema and update API.
- [ ] **MTG-010 P0** Attendance UI.
- [ ] **MTG-011 P1** Agenda items.
- [ ] **MTG-012 P1** Minutes and decisions.
- [ ] **MTG-013 P1** Action-item-to-task conversion.
- [ ] **MTG-014 P1** Follow-up notification.
- [ ] **MTG-015 P2** Transcript/recording references.
- [ ] **MTG-016 P3** AI summary draft.

## 28.9 Dashboard and Analytics

- [ ] **DASH-001 P0** Personal dashboard summary API.
- [ ] **DASH-002 P0** Upcoming events widget.
- [ ] **DASH-003 P0** Upcoming deadlines widget.
- [ ] **DASH-004 P0** Assigned/pending/completed task widgets.
- [ ] **DASH-005 P0** Overdue widget.
- [ ] **DASH-006 P0** Dashboard query performance tests.
- [ ] **DASH-007 P1** Team dashboard.
- [ ] **DASH-008 P1** Review queue.
- [ ] **DASH-009 P2** Completion trends.
- [ ] **DASH-010 P2** Workload analytics.
- [ ] **DASH-011 P2** Exportable reports.

## 28.10 Notifications

- [ ] **NOTIF-001 P0** In-app notification schema.
- [ ] **NOTIF-002 P0** Notification list API.
- [ ] **NOTIF-003 P0** Mark read/unread.
- [ ] **NOTIF-004 P0** Notification center UI.
- [ ] **NOTIF-005 P0** Create assignment notification.
- [ ] **NOTIF-006 P0** Create due-soon notification.
- [ ] **NOTIF-007 P0** Basic scheduled reminder execution.
- [ ] **NOTIF-008 P1** Transactional outbox.
- [ ] **NOTIF-009 P1** Durable queue worker.
- [ ] **NOTIF-010 P1** Email provider integration.
- [ ] **NOTIF-011 P1** Retry and dead-letter queue.
- [ ] **NOTIF-012 P1** User preferences.
- [ ] **NOTIF-013 P2** Browser push.
- [ ] **NOTIF-014 P2** Webhook/chat integration.

## 28.11 Comments and Attachments

- [ ] **COLLAB-001 P1** Comment schema and API.
- [ ] **COLLAB-002 P1** Comment UI.
- [ ] **COLLAB-003 P1** Mention parsing and authorization.
- [ ] **COLLAB-004 P1** Activity feed.
- [ ] **FILE-001 P1** Attachment metadata schema.
- [ ] **FILE-002 P1** Object-storage upload flow.
- [ ] **FILE-003 P1** Authorized download.
- [ ] **FILE-004 P1** Size and type validation.
- [ ] **FILE-005 P1** Malware scan and quarantine.
- [ ] **FILE-006 P2** File versioning.
- [ ] **FILE-007 P2** Organization quota.

## 28.12 Search and Saved Views

- [ ] **SEARCH-001 P0** Task filters.
- [ ] **SEARCH-002 P0** Event date/type/team filters.
- [ ] **SEARCH-003 P0** Meeting participant/date filters.
- [ ] **SEARCH-004 P1** Global authorized search.
- [ ] **SEARCH-005 P1** PostgreSQL full-text index.
- [ ] **SEARCH-006 P2** Saved filters.
- [ ] **SEARCH-007 P2** Saved boards.

## 28.13 Audit and Security

- [ ] **SEC-001 P0** Threat model.
- [ ] **SEC-002 P0** Audit-log schema.
- [ ] **SEC-003 P0** Audit role and user changes.
- [ ] **SEC-004 P0** Audit task/event deletion and due-date changes.
- [ ] **SEC-005 P0** Security headers.
- [ ] **SEC-006 P0** Production CORS allowlist.
- [ ] **SEC-007 P0** Input length and body limits.
- [ ] **SEC-008 P0** Authentication rate limits.
- [ ] **SEC-009 P0** Secret scanning.
- [ ] **SEC-010 P0** Dependency scanning.
- [ ] **SEC-011 P0** Authorization test matrix.
- [ ] **SEC-012 P1** CSRF implementation for cookie-authenticated operations.
- [ ] **SEC-013 P1** Admin MFA.
- [ ] **SEC-014 P1** Audit viewer.
- [ ] **SEC-015 P1** Export step-up authentication.
- [ ] **SEC-016 P1** RLS policies.
- [ ] **SEC-017 P1** Container hardening.
- [ ] **SEC-018 P1** SBOM and image signing.
- [ ] **SEC-019 P2** Security-event dashboard.
- [ ] **SEC-020 P2** External penetration test.

## 28.14 DevOps and Reliability

- [ ] **OPS-001 P0** Backend Dockerfile.
- [ ] **OPS-002 P0** Frontend Dockerfile.
- [ ] **OPS-003 P0** Docker Compose.
- [ ] **OPS-004 P0** Database migration command.
- [ ] **OPS-005 P0** Seed command.
- [ ] **OPS-006 P0** CI lint/test/build.
- [ ] **OPS-007 P0** Staging deployment.
- [ ] **OPS-008 P0** Production-like environment documentation.
- [ ] **OPS-009 P1** Metrics.
- [ ] **OPS-010 P1** Central logs.
- [ ] **OPS-011 P1** Tracing.
- [ ] **OPS-012 P1** Backup automation.
- [ ] **OPS-013 P1** Restore test.
- [ ] **OPS-014 P1** Alerting.
- [ ] **OPS-015 P1** Rolling deployment.
- [ ] **OPS-016 P2** High-availability API.
- [ ] **OPS-017 P2** Disaster-recovery exercise.

## 28.15 Quality and Documentation

- [ ] **QA-001 P0** Unit tests for task transitions.
- [ ] **QA-002 P0** Integration tests for auth.
- [ ] **QA-003 P0** Integration tests for RBAC/object access.
- [ ] **QA-004 P0** API tests for events/tasks/meetings.
- [ ] **QA-005 P0** End-to-end happy path.
- [ ] **QA-006 P0** End-to-end unauthorized path.
- [ ] **QA-007 P0** README.
- [ ] **QA-008 P0** API usage guide.
- [ ] **QA-009 P0** Demo script.
- [ ] **QA-010 P1** Accessibility automated checks.
- [ ] **QA-011 P1** Manual keyboard test.
- [ ] **QA-012 P1** Load test baseline.
- [ ] **QA-013 P1** Runbooks.
- [ ] **QA-014 P2** User guide.
- [ ] **QA-015 P2** Admin guide.

---

# 29. Compressed Delivery Plan

This plan assumes work begins on **1 July 2026** and submission is **4 July 2026 EOD IST**. It is intentionally aggressive. Production capabilities after P0 must not delay the working MVP.

## 1 July 2026 — Foundation and Vertical Slice

- Initialize repositories.
- Configure FastAPI, React/Vite, PostgreSQL, migrations, Docker Compose.
- Implement user model, seeded roles, password hashing, login, current-user endpoint.
- Implement authorization policy skeleton.
- Implement base layout and protected routes.
- Implement one end-to-end vertical slice: create and list a task.
- Add CI lint and unit test jobs.

**Exit condition:** application starts in Docker; login works; one authorized task flow works.

## 2 July 2026 — Core Features

- Complete task CRUD, assignment, status, priority, due date.
- Implement event CRUD and calendar range endpoint.
- Implement month/week calendar UI.
- Implement meeting CRUD and participants.
- Implement deadline model and list.
- Add key authorization tests.

**Exit condition:** core calendar, task, meeting, and deadline operations work through UI.

## 3 July 2026 — Dashboard, Roles, and Hardening

- Implement dashboard aggregates.
- Implement role assignment and admin user list.
- Add attendance.
- Add in-app notifications and simple reminder execution.
- Add audit events for sensitive actions.
- Add security headers, rate limits, validation limits, production CORS.
- Complete end-to-end test.

**Exit condition:** all assignment requirements are demonstrable and role-restricted.

## 4 July 2026 — Stabilization and Submission

- Fix critical defects.
- Verify fresh Docker setup.
- Verify clean migrations and seed data.
- Complete README, architecture diagram, credentials instructions, and demo script.
- Run test suite.
- Run dependency and secret scans.
- Prepare screenshots or short demonstration recording if requested.
- Tag release `v0.1.0-mvp`.
- Deploy submission environment.
- Freeze non-critical features before final demonstration.

**Exit condition:** reproducible MVP, documented and deployed.

## Post-Submission Sprint 1

- Durable queue and outbox.
- Email reminders.
- Comments.
- Attachments with malware scanning.
- Recurrence.
- Admin MFA.
- RLS.
- Improved audit viewer.
- Observability and backups.

## Post-Submission Sprint 2

- Kanban.
- Subtasks/dependencies.
- Saved views.
- Analytics.
- Calendar import/export.
- SSO.
- Load testing.
- Disaster-recovery validation.

---

# 30. Definition of Done

A feature is done only when:

- Acceptance criteria are met.
- Backend authorization is implemented.
- Input validation is implemented.
- Error and empty states are handled.
- Unit or integration tests exist.
- Negative permission tests exist for protected functionality.
- Migration is included when schema changes.
- Audit event is included where required.
- API schema is updated.
- UI is keyboard usable.
- Logs contain no secrets.
- Documentation is updated.
- Code review is complete.
- CI passes.
- Feature is deployable and demonstrated in staging.

---

# 31. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| Enterprise scope overwhelms 4-day deadline | High | Critical | Freeze P0 scope; use phased roadmap |
| Authorization implemented only in frontend | Medium | Critical | Central server policies and negative tests |
| JWT stored insecurely | Medium | High | Memory access token; secure refresh cookie; rotation |
| Reminder loss after restart | High in naive design | High | Outbox and durable queue after MVP |
| Calendar recurrence complexity causes defects | High | Medium | Defer custom recurrence to P1 |
| File uploads introduce malware/XSS | Medium | High | Quarantine, scan, safe download, allowlist |
| Role definitions are ambiguous | High | High | Permission vocabulary and documented matrix |
| Time-zone bugs | Medium | High | UTC storage, zone-aware display, tests |
| Database migrations block deployment | Medium | High | Backward-compatible migration process |
| Missing backup verification | Medium | Critical | Scheduled restore tests |
| Sensitive data leaks through logs | Medium | High | Structured redaction and logging policy |
| AI leaks confidential content | Medium | High | Opt-in, approved provider, redaction, human review |
| Team lacks enough time for tests | High | High | Prioritize auth/authorization and core E2E tests |
| Dependency vulnerability near deadline | Medium | Medium | Lockfile, scanning, patch policy |
| Single developer knowledge concentration | Medium | Medium | README, ADRs, runbooks, clear modules |

---

# 32. Production Readiness Checklist

## Application

- [ ] All P0 and agreed P1 acceptance criteria pass.
- [ ] No debug mode.
- [ ] Production API docs restricted.
- [ ] Error responses contain no stack traces.
- [ ] Pagination and limits enforced.
- [ ] Background jobs are idempotent.
- [ ] Time-zone tests pass.

## Security

- [ ] Threat model reviewed.
- [ ] ASVS Level 2 gap assessment performed.
- [ ] API authorization tests pass.
- [ ] MFA enabled for admins.
- [ ] Secrets are externalized.
- [ ] TLS enforced.
- [ ] CORS restricted.
- [ ] CSRF protection verified.
- [ ] Rate limits verified.
- [ ] File quarantine and scanning verified.
- [ ] Dependency/container scan has no unresolved critical findings.
- [ ] Logging redaction verified.
- [ ] Incident-response contacts documented.

## Database

- [ ] Runtime role is least privilege.
- [ ] Backups enabled.
- [ ] Restore tested.
- [ ] Connection limit configured.
- [ ] Slow-query monitoring enabled.
- [ ] Indexes reviewed.
- [ ] RLS reviewed if enabled.
- [ ] Migration rollback/forward plan documented.

## Infrastructure

- [ ] Containers run as non-root.
- [ ] Resource limits configured.
- [ ] Health/readiness checks configured.
- [ ] Registry access restricted.
- [ ] Deployment approval enabled.
- [ ] Alerts configured.
- [ ] Certificates monitored.
- [ ] No public database/Redis exposure.
- [ ] Object storage is private by default.

## Operations

- [ ] On-call or responsible contact defined.
- [ ] Backup failure alert tested.
- [ ] Queue failure runbook exists.
- [ ] Account-compromise runbook exists.
- [ ] Rollback tested.
- [ ] Data export workflow tested.
- [ ] Deactivation/session revocation tested.

---

# 33. Suggested Repository Structure

```text
acm-nexus/
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── product-spec.md
│   ├── architecture/
│   │   ├── context.md
│   │   ├── containers.md
│   │   └── decisions/
│   ├── api/
│   ├── runbooks/
│   ├── threat-model/
│   └── user-guides/
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── migrations/
│   ├── tests/
│   └── app/
│       ├── main.py
│       ├── api/
│       │   └── v1/
│       ├── core/
│       │   ├── config.py
│       │   ├── security.py
│       │   ├── logging.py
│       │   └── errors.py
│       ├── db/
│       ├── modules/
│       │   ├── identity/
│       │   ├── organizations/
│       │   ├── teams/
│       │   ├── calendar/
│       │   ├── meetings/
│       │   ├── tasks/
│       │   ├── deadlines/
│       │   ├── notifications/
│       │   ├── attachments/
│       │   ├── audit/
│       │   └── analytics/
│       ├── workers/
│       └── integrations/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tests/
│   └── src/
│       ├── app/
│       ├── routes/
│       ├── features/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── calendar/
│       │   ├── meetings/
│       │   ├── tasks/
│       │   ├── deadlines/
│       │   ├── teams/
│       │   └── admin/
│       ├── components/
│       ├── api/
│       ├── hooks/
│       ├── lib/
│       └── styles/
├── infrastructure/
│   ├── docker/
│   ├── reverse-proxy/
│   ├── monitoring/
│   └── deployment/
└── scripts/
    ├── dev.sh
    ├── seed.sh
    ├── test.sh
    ├── backup.sh
    └── restore-test.sh
```

---

# 34. Environment Configuration

Example keys only; never commit real values.

```dotenv
APP_ENV=development
APP_NAME=ACM Nexus
APP_BASE_URL=http://localhost:8080
FRONTEND_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql+asyncpg://app:change-me@postgres:5432/acm_nexus
REDIS_URL=redis://redis:6379/0

JWT_ISSUER=acm-nexus
JWT_AUDIENCE=acm-nexus-web
JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private_key
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public_key
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=14

COOKIE_SECURE=false
COOKIE_SAMESITE=lax
CSRF_SECRET_FILE=/run/secrets/csrf_secret

EMAIL_PROVIDER=console
EMAIL_FROM=no-reply@example.invalid

OBJECT_STORAGE_ENDPOINT=http://minio:9000
OBJECT_STORAGE_BUCKET=acm-nexus
OBJECT_STORAGE_ACCESS_KEY_FILE=/run/secrets/object_storage_access_key
OBJECT_STORAGE_SECRET_KEY_FILE=/run/secrets/object_storage_secret_key
MAX_ATTACHMENT_BYTES=10485760

LOG_LEVEL=INFO
OTEL_EXPORTER_OTLP_ENDPOINT=
SENTRY_DSN=

ALLOWED_EMAIL_DOMAINS=example.edu
ORGANIZATION_DEFAULT_TIMEZONE=Asia/Kolkata
```

Configuration requirements:

- Validate required variables at startup.
- Fail closed on invalid security configuration.
- Separate secret values from non-secret configuration.
- Avoid printing secret values.
- Enforce secure-cookie settings in production.
- Disallow development wildcard CORS in production.
- Do not use default credentials in a deployed environment.

---

# 35. Runbooks

## 35.1 Suspected Account Compromise

1. Disable or lock the affected account.
2. Revoke all sessions and refresh-token families.
3. Require password reset and MFA verification.
4. Review audit and authentication events.
5. Identify sensitive records accessed or changed.
6. Restore unauthorized changes where appropriate.
7. Notify responsible leadership according to policy.
8. Record timeline and remediation.

## 35.2 Failed Reminder Queue

1. Check queue depth and oldest job age.
2. Check worker health and dependency status.
3. Pause duplicate-producing scheduler if necessary.
4. Restart or scale workers.
5. Retry safe idempotent jobs.
6. Move poison jobs to dead-letter queue.
7. Verify no duplicate notifications.
8. Document incident and root cause.

## 35.3 Database Restore

1. Declare recovery event.
2. Identify recovery point.
3. Provision isolated restore target.
4. Restore database and validate checksums.
5. Apply required migrations.
6. Validate user, task, event, and audit counts.
7. Reconcile object storage and queue.
8. Switch application traffic through controlled procedure.
9. Monitor and document achieved RPO/RTO.

## 35.4 Lost JWT Signing Key

1. Disable affected key ID.
2. Rotate signing keys.
3. Revoke active sessions if key exposure is suspected.
4. Deploy verifier configuration.
5. Investigate secret access logs.
6. Notify security owner.
7. Complete post-incident review.

---

# 36. Future Roadmap

## Phase 1 — Submission MVP

- Auth and required roles
- Events/calendar
- Tasks and assignment
- Meetings
- Deadlines
- Dashboard
- Basic reminders
- Docker deployment

## Phase 2 — Production Foundation

- Durable jobs and email
- MFA
- Audit UI
- Comments
- Attachments
- Recurrence
- RLS
- Monitoring
- Backup/restore validation

## Phase 3 — Collaboration and Analytics

- Kanban
- Dependencies/subtasks
- Saved views
- Attendance analytics
- Organization reports
- Calendar import/export
- Integrations and webhooks

## Phase 4 — Enterprise Identity and Resilience

- OIDC SSO
- Passkeys
- High availability
- Disaster-recovery automation
- Advanced policy administration
- Data lifecycle automation

## Phase 5 — Governed AI

- Meeting-summary drafts
- Action-item extraction
- Task suggestions
- Weekly digest
- Model governance and quality evaluation

---

# 37. Deliverables

## Required Submission Package

- Source code.
- This product/engineering specification.
- README with local and deployment setup.
- `.env.example`.
- Dockerfiles and Docker Compose.
- Database migrations.
- Seed/demo command.
- API documentation.
- Role-permission matrix.
- Test suite.
- Deployed MVP URL if hosting is required.
- Demo accounts for each role in a non-production environment.
- Demo script.
- Known limitations.
- Security notes.
- Screenshots or recording if requested.

## Recommended Release Files

```text
README.md
PRODUCT_SPEC.md
SECURITY.md
ARCHITECTURE.md
API.md
DEPLOYMENT.md
RUNBOOKS.md
CHANGELOG.md
docker-compose.yml
.env.example
```

---

# 38. Standards and References

Use these as design and verification baselines. Review current revisions during implementation.

1. **OWASP Application Security Verification Standard 5.0.0**  
   https://github.com/OWASP/ASVS

2. **OWASP API Security Top 10 — 2023**  
   https://owasp.org/API-Security/editions/2023/en/0x00-toc/

3. **OWASP Cheat Sheet Series — Authentication**  
   https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

4. **OWASP Cheat Sheet Series — Password Storage**  
   https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

5. **OWASP Cheat Sheet Series — Session Management**  
   https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

6. **OWASP Cheat Sheet Series — CSRF Prevention**  
   https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

7. **OWASP Cheat Sheet Series — Secrets Management**  
   https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

8. **IETF RFC 8725 — JSON Web Token Best Current Practices**  
   https://datatracker.ietf.org/doc/html/rfc8725

9. **FastAPI Security Documentation**  
   https://fastapi.tiangolo.com/tutorial/security/

10. **PostgreSQL Row Security Policies**  
    https://www.postgresql.org/docs/current/ddl-rowsecurity.html

11. **W3C Web Content Accessibility Guidelines 2.2**  
    https://www.w3.org/TR/WCAG22/

12. **NIST Cybersecurity Framework 2.0**  
    https://www.nist.gov/cyberframework

13. **Docker Security Documentation**  
    https://docs.docker.com/security/

---

## Final Engineering Decision

For the deadline, implement a **secure modular-monolith MVP** rather than a superficial collection of unfinished enterprise features. The architecture, data model, permission vocabulary, audit model, and deployment boundaries in this document are designed so the MVP can be hardened and expanded without replacing its core.

The release order is:

```text
Correctness → Authorization → Core workflows → Testing → Deployment
→ Reliability → Collaboration → Analytics → Integrations → AI
```
