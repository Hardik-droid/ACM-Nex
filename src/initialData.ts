import {
  User,
  Team,
  Event,
  Meeting,
  Task,
  Deadline,
  AuditLog,
  Notification,
  MemberRole,
  TaskStatus,
  TaskPriority,
  EventType,
  DeadlineStatus,
  AttendanceStatus
} from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-alex',
    displayName: 'Alex Rivera',
    email: 'admin@acm.org',
    role: MemberRole.ACM_ADMIN,
    academicYear: '4th Year',
    teams: ['team-tech', 'team-pr', 'team-logistics'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-07-01T12:00:00-07:00'
  },
  {
    id: 'user-mau',
    displayName: 'Mau Lopez',
    email: 'mau@acm.org',
    role: MemberRole.CORE_MEMBER,
    academicYear: '3rd Year',
    teams: ['team-tech'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-07-01T12:44:00-07:00'
  },
  {
    id: 'user-clara',
    displayName: 'Clara Sterling',
    email: 'clara@acm.org',
    role: MemberRole.REVIEWER,
    academicYear: '3rd Year',
    teams: ['team-pr'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-07-01T11:30:00-07:00'
  },
  {
    id: 'user-marcelo',
    displayName: 'Marcelo Santos',
    email: 'marcelo@acm.org',
    role: MemberRole.FIRST_YEAR,
    academicYear: '1st Year',
    teams: ['team-tech'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-07-01T12:45:10-07:00'
  },
  {
    id: 'user-samantha',
    displayName: 'Samantha Green',
    email: 'samantha@acm.org',
    role: MemberRole.CORE_MEMBER,
    academicYear: '3rd Year',
    teams: ['team-logistics'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-07-01T12:15:00-07:00'
  },
  {
    id: 'user-hiroshi',
    displayName: 'Hiroshi Tanaka',
    email: 'hiroshi@acm.org',
    role: MemberRole.SECOND_YEAR,
    academicYear: '2nd Year',
    teams: ['team-tech'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-06-30T18:22:00-07:00'
  },
  {
    id: 'user-aria',
    displayName: 'Aria Patel',
    email: 'aria@acm.org',
    role: MemberRole.SOCIETY_MEMBER,
    academicYear: '2nd Year',
    teams: ['team-pr'],
    timeZone: 'Asia/Kolkata',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-07-01T09:12:00-07:00'
  },
  {
    id: 'user-deactivated',
    displayName: 'John Doe',
    email: 'john@acm.org',
    role: MemberRole.SOCIETY_MEMBER,
    academicYear: '2nd Year',
    teams: [],
    timeZone: 'Asia/Kolkata',
    status: 'Deactivated',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    lastActive: '2026-06-15T10:00:00-07:00'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-tech',
    name: 'Technical Committee',
    description: 'Manages competitive coding platform, society servers, open-source projects, and technical event infrastructure.',
    leadId: 'user-mau',
    isArchived: false
  },
  {
    id: 'team-pr',
    name: 'Public Relations & Editorial',
    description: 'Coordinates social media outreach, graphic design, newsletter, content drafting, and sponsor pitches.',
    leadId: 'user-clara',
    isArchived: false
  },
  {
    id: 'team-logistics',
    name: 'Logistics & Operations',
    description: 'Handles venue bookings, catering, physical event setup, scheduling, and coordinator resources.',
    leadId: 'user-samantha',
    isArchived: false
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-recruitment',
    title: 'ACM Society Recruitment Orientation',
    description: 'Annual introductory session for prospective ACM members. Introducing domains, project timelines, and benefits of joining.',
    type: EventType.RECRUITMENT,
    ownerId: 'user-alex',
    teamId: 'team-pr',
    startsAt: '2026-07-05T14:00:00',
    endsAt: '2026-07-05T16:00:00',
    location: 'Main Auditorium, Block C',
    onlineUrl: 'https://meet.google.com/acm-recruitment',
    color: '#E15B3A', // Peach Orange
    isCancelled: false,
    rsvps: {
      'user-alex': 'ACCEPTED',
      'user-mau': 'ACCEPTED',
      'user-clara': 'ACCEPTED',
      'user-samantha': 'ACCEPTED',
      'user-marcelo': 'TENTATIVE',
      'user-hiroshi': 'ACCEPTED',
      'user-aria': 'PENDING'
    }
  },
  {
    id: 'event-standup',
    title: 'Technical Team Sync & System Health',
    description: 'Weekly check-in on competitive contest servers, deployment load tests, and recruit web portal status.',
    type: EventType.MEETING,
    ownerId: 'user-mau',
    teamId: 'team-tech',
    startsAt: '2026-07-02T10:00:00',
    endsAt: '2026-07-02T11:00:00',
    location: 'Lab 4, Computer Science Block',
    onlineUrl: 'https://meet.google.com/acm-tech-sync',
    color: '#1A4331', // Forest Green
    isCancelled: false,
    rsvps: {
      'user-mau': 'ACCEPTED',
      'user-marcelo': 'ACCEPTED',
      'user-hiroshi': 'ACCEPTED',
      'user-alex': 'ACCEPTED'
    }
  },
  {
    id: 'event-dinner',
    title: 'ACM Core Team Friday Dinner',
    description: 'An informal dinner to celebrate the close of the academic year and build camaraderie between committees.',
    type: EventType.SOCIAL,
    ownerId: 'user-samantha',
    teamId: null,
    startsAt: '2026-07-03T19:00:00',
    endsAt: '2026-07-03T21:30:00',
    location: 'Bistro Bistro, Campus Square',
    onlineUrl: '',
    color: '#4C1D95', // Purple Plum
    isCancelled: false,
    rsvps: {
      'user-alex': 'ACCEPTED',
      'user-mau': 'ACCEPTED',
      'user-clara': 'ACCEPTED',
      'user-samantha': 'ACCEPTED',
      'user-marcelo': 'ACCEPTED',
      'user-hiroshi': 'DECLINED',
      'user-aria': 'TENTATIVE'
    }
  },
  {
    id: 'event-contest-planning',
    title: 'National Coding Contest Agenda Setting',
    description: 'Planning committee meeting to finalise problem sets, server capacity, and reward allocations.',
    type: EventType.MEETING,
    ownerId: 'user-mau',
    teamId: 'team-tech',
    startsAt: '2026-07-04T15:00:00',
    endsAt: '2026-07-04T16:30:00',
    location: 'Conference Room B',
    onlineUrl: 'https://meet.google.com/acm-contest-plan',
    color: '#1A4331', // Forest Green
    isCancelled: false,
    rsvps: {
      'user-mau': 'ACCEPTED',
      'user-marcelo': 'PENDING',
      'user-hiroshi': 'ACCEPTED',
      'user-alex': 'ACCEPTED',
      'user-clara': 'TENTATIVE'
    }
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'event-standup',
    agenda: [
      'Recruitment web portal security review',
      'Contest platform server load balancer validation',
      'Sponsorship deck sync'
    ],
    minutes: 'The technical committee reviewed deployment readiness. Mau confirmed load testing looks stable up to 10k concurrent users. Marcelo completed the responsive UI pass on the main recruiting form. Hiroshi raised a concern regarding CSRF tokens, which was resolved by implementing double-submit cookies on post requests.',
    decisions: [
      'Contest server load balancer must go live by July 3rd.',
      'Marcelo to check mobile view accessibility headers.'
    ],
    attendance: {
      'user-mau': AttendanceStatus.PRESENT,
      'user-marcelo': AttendanceStatus.PRESENT,
      'user-hiroshi': AttendanceStatus.PRESENT,
      'user-alex': AttendanceStatus.PRESENT
    },
    status: 'COMPLETED'
  },
  {
    id: 'event-contest-planning',
    agenda: [
      'Problem setters selection',
      'Platform security & anti-cheat guidelines',
      'Sponsor banner integration'
    ],
    minutes: '',
    decisions: [],
    attendance: {},
    status: 'SCHEDULED'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Verify Contest Platform Load Balancer',
    description: 'Simulate high-concurrency traffic patterns on Kubernetes ingress to prevent server crashes during the opening minutes of the national contest.',
    creatorId: 'user-mau',
    assigneeIds: ['user-marcelo', 'user-hiroshi'],
    reviewerId: 'user-mau',
    teamId: 'team-tech',
    status: TaskStatus.TODO,
    priority: TaskPriority.CRITICAL,
    dueDate: '2026-07-06',
    subtasks: [
      { id: 'sub-1-1', title: 'Spin up 5 load testing worker nodes', isCompleted: false },
      { id: 'sub-1-2', title: 'Verify TLS handshake performance under 1000 requests/sec', isCompleted: false },
      { id: 'sub-1-3', title: 'Document failover behaviors', isCompleted: false }
    ],
    dependencies: ['task-5'],
    attachments: [
      { id: 'att-1-1', name: 'ingress-controller-config.yaml', url: '#', size: '4.2 KB' }
    ],
    comments: [
      {
        id: 'comm-1-1',
        userId: 'user-mau',
        text: 'Marcelo, please coordinate with Hiroshi to launch the locust scripts from separate subnets.',
        createdAt: '2026-07-01T10:15:00-07:00'
      },
      {
        id: 'comm-1-2',
        userId: 'user-marcelo',
        text: 'Got it! I am setting up the local instances and will hook them up to our staging Grafana dashboard.',
        createdAt: '2026-07-01T11:45:00-07:00'
      }
    ],
    version: 1
  },
  {
    id: 'task-2',
    title: 'Design Recruitment Instagram Post',
    description: 'Draft, iterate, and finalise the primary social media graphic for ACM 2026 recruitments. Colors must align with the classic ACM brand guidelines.',
    creatorId: 'user-clara',
    assigneeIds: ['user-clara'],
    reviewerId: 'user-alex',
    teamId: 'team-pr',
    status: TaskStatus.IN_REVIEW,
    priority: TaskPriority.HIGH,
    dueDate: '2026-07-03',
    subtasks: [
      { id: 'sub-2-1', title: 'Design high-fidelity Figma artboards', isCompleted: true },
      { id: 'sub-2-2', title: 'Export assets in web-friendly webp format', isCompleted: true },
      { id: 'sub-2-3', title: 'Draft caption and tags list', isCompleted: true }
    ],
    dependencies: [],
    attachments: [
      { id: 'att-2-1', name: 'acm-recruitment-draft-v3.png', url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=300', size: '1.2 MB' }
    ],
    comments: [
      {
        id: 'comm-2-1',
        userId: 'user-clara',
        text: 'Submitted for final review. Artboard link is attached. Let me know if the font hierarchy is acceptable!',
        createdAt: '2026-07-01T11:32:00-07:00'
      }
    ],
    version: 2
  },
  {
    id: 'task-3',
    title: 'Book Seminar Hall for Orientation',
    description: 'Coordinate with Campus Admin to secure Block C Seminar Hall. Confirm seating arrangements, microphone audio checks, and projector connectivity.',
    creatorId: 'user-alex',
    assigneeIds: ['user-samantha'],
    reviewerId: 'user-alex',
    teamId: 'team-logistics',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: '2026-07-03',
    subtasks: [
      { id: 'sub-3-1', title: 'Submit reservation form to registrar office', isCompleted: true },
      { id: 'sub-3-2', title: 'Collect AV keys from lab manager', isCompleted: false },
      { id: 'sub-3-3', title: 'Arrange refreshments for guests', isCompleted: false }
    ],
    dependencies: [],
    attachments: [],
    comments: [],
    version: 1
  },
  {
    id: 'task-4',
    title: 'Write Competitive Coding Problems',
    description: 'Design 5 problem statements of varying difficulties (Easy, Medium, Hard) including optimal reference solutions, input/output constraints, and thorough test case generators.',
    creatorId: 'user-mau',
    assigneeIds: ['user-hiroshi'],
    reviewerId: 'user-mau',
    teamId: 'team-tech',
    status: TaskStatus.BACKLOG,
    priority: TaskPriority.CRITICAL,
    dueDate: '2026-07-07',
    subtasks: [
      { id: 'sub-4-1', title: 'Design Easy problem: Array manipulation', isCompleted: false },
      { id: 'sub-4-2', title: 'Design Medium problem: Dynamic Programming', isCompleted: false },
      { id: 'sub-4-3', title: 'Write reference solutions in C++, Java, and Python', isCompleted: false }
    ],
    dependencies: [],
    attachments: [],
    comments: [],
    version: 1
  },
  {
    id: 'task-5',
    title: 'Update ACM Society Core Website',
    description: 'Revamp the home page with the updated core team listing, interactive schedules, and a beautiful community joining portal as shown in the Colabs video.',
    creatorId: 'user-alex',
    assigneeIds: ['user-marcelo'],
    reviewerId: 'user-alex',
    teamId: 'team-tech',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: '2026-06-29',
    subtasks: [
      { id: 'sub-5-1', title: 'Code dynamic calendar and event scheduler widget', isCompleted: true },
      { id: 'sub-5-2', title: 'Optimize static assets and load times', isCompleted: true },
      { id: 'sub-5-3', title: 'Test joining forms across mobile layouts', isCompleted: true }
    ],
    dependencies: [],
    attachments: [
      { id: 'att-5-1', name: 'final-deployment-hash.txt', url: '#', size: '64 B' }
    ],
    comments: [
      {
        id: 'comm-5-1',
        userId: 'user-marcelo',
        text: 'The UI updates are fully pushed and live! Performance scores on Lighthouse show 98+.',
        createdAt: '2026-06-29T16:00:00-07:00'
      }
    ],
    version: 1
  }
];

export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'dead-1',
    title: 'Contest Platform Server Setup',
    description: 'Deploy core databases and competitive grader servers. Ensure all ports are closed outside the required sandbox limits.',
    teamId: 'team-tech',
    dueDate: '2026-07-08T18:00:00',
    status: DeadlineStatus.UPCOMING,
    submissionUrl: 'https://github.com/acm/contest-deployment',
    submissionEvidence: null,
    relatedTaskIds: ['task-1', 'task-4']
  },
  {
    id: 'dead-2',
    title: 'Recruitment Phase 1 Applications Close',
    description: 'The strict deadline for the first cohort of student registrations. We must pull all applicant submissions into our central spreadsheets.',
    teamId: 'team-pr',
    dueDate: '2026-07-04T23:59:59',
    status: DeadlineStatus.DUE_SOON,
    submissionUrl: null,
    submissionEvidence: null,
    relatedTaskIds: ['task-2']
  },
  {
    id: 'dead-3',
    title: 'Sponsorship Pitch Deck Submission',
    description: 'Deliver finalized corporate sponsorship brochure to regional sponsors. Highly critical to secure refreshments and prize allocations.',
    teamId: 'team-pr',
    dueDate: '2026-06-30T17:00:00',
    status: DeadlineStatus.OVERDUE,
    submissionUrl: 'https://drive.google.com/acm-sponsorship-deck',
    submissionEvidence: 'Pitch deck submitted via email to campus relations on June 30th.',
    relatedTaskIds: []
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    actorId: 'user-alex',
    actorName: 'Alex Rivera',
    action: 'MEMBER_INVITED',
    details: 'Invited new member Marcelo Santos (marcelo@acm.org) as First Year Member',
    createdAt: '2026-06-20T10:11:00-07:00'
  },
  {
    id: 'audit-2',
    actorId: 'user-alex',
    actorName: 'Alex Rivera',
    action: 'TEAM_CREATED',
    details: 'Created Technical Committee team and assigned Mau Lopez as Lead',
    createdAt: '2026-06-20T10:15:00-07:00'
  },
  {
    id: 'audit-3',
    actorId: 'user-mau',
    actorName: 'Mau Lopez',
    action: 'TASK_CREATED',
    details: 'Created Task "Verify Contest Platform Load Balancer" with High priority',
    createdAt: '2026-07-01T10:10:00-07:00'
  },
  {
    id: 'audit-4',
    actorId: 'user-marcelo',
    actorName: 'Marcelo Santos',
    action: 'TASK_STATUS_TRANSITION',
    details: 'Changed status of Task "Update ACM Society Core Website" to DONE',
    createdAt: '2026-06-29T16:00:00-07:00'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    userId: 'user-marcelo',
    title: 'New Task Assigned',
    message: 'Mau Lopez assigned you to task "Verify Contest Platform Load Balancer"',
    isRead: false,
    createdAt: '2026-07-01T10:10:00-07:00'
  },
  {
    id: 'not-2',
    userId: 'user-alex',
    title: 'Review Requested',
    message: 'Clara Sterling submitted "Design Recruitment Instagram Post" for your review',
    isRead: false,
    createdAt: '2026-07-01T11:32:00-07:00'
  },
  {
    id: 'not-3',
    userId: 'user-marcelo',
    title: 'Orientation Update',
    message: 'Alex Rivera changed orientation location to Block C Auditorium',
    isRead: true,
    createdAt: '2026-06-28T14:15:00-07:00'
  }
];
