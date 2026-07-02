export enum MemberRole {
  PLATFORM_ADMIN = 'Platform Admin',
  EB_ADMIN = 'EB Admin',
  ACM_ADMIN = 'ACM Admin',
  CORE_MEMBER = 'Core Member',
  REVIEWER = 'Reviewer',
  THIRD_YEAR = 'Third Year Member',
  SECOND_YEAR = 'Second Year Member',
  FIRST_YEAR = 'First Year Member',
  SOCIETY_MEMBER = 'Society Member'
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE'
}

export enum EventType {
  GENERAL = 'General Event',
  MEETING = 'Meeting',
  DEADLINE = 'Deadline',
  WORKSHOP = 'Workshop',
  CONTEST = 'Contest',
  RECRUITMENT = 'Recruitment',
  REVIEW_SESSION = 'Review Session',
  SOCIAL = 'Social Activity'
}

export enum DeadlineStatus {
  UPCOMING = 'Upcoming',
  DUE_SOON = 'Due Soon',
  AT_RISK = 'At Risk',
  OVERDUE = 'Overdue',
  SUBMITTED = 'Submitted',
  VERIFIED = 'Verified',
  WAIVED = 'Waived'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  EXCUSED = 'Excused',
  LATE = 'Late',
  REMOTE = 'Remote',
  UNKNOWN = 'Unknown'
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: MemberRole;
  academicYear: string;
  teams: string[]; // Team IDs
  timeZone: string;
  status: 'Active' | 'Deactivated';
  avatar: string;
  lastActive: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId: string;
  isArchived: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  ownerId: string;
  teamId: string | null;
  startsAt: string;
  endsAt: string;
  location: string;
  onlineUrl: string;
  color: string;
  rsvps: Record<string, 'ACCEPTED' | 'TENTATIVE' | 'DECLINED' | 'PENDING'>; // userId -> status
  isCancelled: boolean;
}

export interface Meeting {
  id: string; // matches eventId
  agenda: string[];
  minutes: string;
  decisions: string[];
  attendance: Record<string, AttendanceStatus>; // userId -> status
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  assigneeIds: string[];
  reviewerId: string | null;
  teamId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  subtasks: { id: string; title: string; isCompleted: boolean }[];
  dependencies: string[]; // related/blocking task IDs
  attachments: { id: string; name: string; url: string; size: string }[];
  comments: Comment[];
  version: number;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  teamId: string | null;
  dueDate: string;
  status: DeadlineStatus;
  submissionUrl: string | null;
  submissionEvidence: string | null;
  relatedTaskIds: string[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type PresenceStatus = 'ONLINE' | 'AWAY' | 'JUST_JOINED';

export interface PresenceMember {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  initials: string;
  teamId?: string;
  status: PresenceStatus;
  lastSeenAt: string;
}

export type PresenceScope =
  | { type: 'organization'; id: string }
  | { type: 'team'; id: string }
  | { type: 'meeting'; id: string };

export type PresenceEvent =
  | { type: 'presence.snapshot'; members: PresenceMember[]; occurredAt: string }
  | { type: 'presence.joined'; member: PresenceMember; occurredAt: string }
  | { type: 'presence.updated'; memberId: string; status: 'ONLINE' | 'AWAY'; occurredAt: string }
  | { type: 'presence.left'; memberId: string; occurredAt: string };
