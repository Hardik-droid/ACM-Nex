import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  AttendanceStatus,
  PresenceMember,
  PresenceEvent,
  PresenceScope
} from './types';
import {
  INITIAL_USERS,
  INITIAL_TEAMS,
  INITIAL_EVENTS,
  INITIAL_MEETINGS,
  INITIAL_TASKS,
  INITIAL_DEADLINES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from './initialData';
import { AuthRole, PublicAuthSession } from './auth/types';

function mapAuthRoleToMemberRole(role: AuthRole): MemberRole {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return MemberRole.PLATFORM_ADMIN;
    case 'EB_ADMIN':
      return MemberRole.EB_ADMIN;
    case 'CORE_MEMBER':
      return MemberRole.CORE_MEMBER;
    case 'REVIEWER':
      return MemberRole.REVIEWER;
    case 'THIRD_YEAR_MEMBER':
      return MemberRole.THIRD_YEAR;
    case 'SECOND_YEAR_MEMBER':
      return MemberRole.SECOND_YEAR;
    case 'FIRST_YEAR_MEMBER':
      return MemberRole.FIRST_YEAR;
    case 'GUEST_OBSERVER':
    case 'SOCIETY_MEMBER':
    default:
      return MemberRole.SOCIETY_MEMBER;
  }
}

interface AppContextProps {
  users: User[];
  teams: Team[];
  events: Event[];
  meetings: Meeting[];
  tasks: Task[];
  deadlines: Deadline[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  
  // Simulation Role state
  currentSimulatedUser: User;
  setSimulatedUserById: (userId: string) => void;
  
  // Actions
  addEvent: (event: Omit<Event, 'id' | 'ownerId' | 'isCancelled' | 'rsvps'>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  rsvpEvent: (eventId: string, userId: string, rsvpStatus: 'ACCEPTED' | 'TENTATIVE' | 'DECLINED') => void;
  
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  recordMeetingAttendance: (meetingId: string, userId: string, status: AttendanceStatus) => void;
  
  addTask: (task: Omit<Task, 'id' | 'creatorId' | 'comments' | 'attachments' | 'version'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  transitionTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  submitTaskReview: (taskId: string, reviewerId: string) => void;
  approveTask: (taskId: string, notes?: string) => void;
  requestTaskChanges: (taskId: string, feedback: string) => void;
  
  addDeadline: (deadline: Omit<Deadline, 'id' | 'status' | 'submissionEvidence'>) => void;
  updateDeadline: (deadlineId: string, updates: Partial<Deadline>) => void;
  submitDeadlineEvidence: (deadlineId: string, url: string, text: string) => void;
  
  updateUserRoleAndStatus: (userId: string, role: MemberRole, status: 'Active' | 'Deactivated') => void;
  createTeam: (name: string, description: string, leadId: string) => void;
  updateTeam: (teamId: string, name: string, description: string, leadId: string) => void;
  addTeamMember: (teamId: string, userId: string) => void;
  removeTeamMember: (teamId: string, userId: string) => void;
  
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  
  // Permission checks
  checkPermission: (permission: string, resourceTeamId?: string | null, resourceOwnerId?: string) => boolean;

  // Presence state
  onlineMembers: Map<string, PresenceMember>;
  joinNotifications: { id: string; members: string[]; createdAt: string }[];
  dismissJoinNotification: (id: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({
  children,
  authSession = null,
}: {
  children: React.ReactNode;
  authSession?: PublicAuthSession | null;
}) {
  // Load initial data from localStorage if exists, else load seed constants
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('acm_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('acm_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('acm_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('acm_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('acm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [deadlines, setDeadlines] = useState<Deadline[]>(() => {
    const saved = localStorage.getItem('acm_deadlines');
    return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('acm_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('acm_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Default simulated user: Alex Rivera (ACM Admin)
  const [simulatedUserId, setSimulatedUserId] = useState<string>(() => {
    return localStorage.getItem('acm_simulated_user_id') || 'user-alex';
  });

  const authenticatedRosterUser: User | null = authSession?.authenticated && authSession.user
    ? {
        id: authSession.user.id,
        displayName: authSession.user.full_name,
        email: authSession.user.primary_email,
        role: mapAuthRoleToMemberRole(authSession.user.role),
        academicYear: 'Verified Thapar Account',
        teams: authSession.user.team_ids || [],
        timeZone: 'Asia/Kolkata',
        status: authSession.user.account_state === 'ACTIVE' ? 'Active' : 'Deactivated',
        avatar: authSession.user.avatar_url || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200',
        lastActive: authSession.user.last_login_at || new Date().toISOString(),
      }
    : null;

  useEffect(() => {
    if (!authenticatedRosterUser) return;
    setUsers(prev => {
      const exists = prev.some(user => user.id === authenticatedRosterUser.id);
      if (!exists) return [authenticatedRosterUser, ...prev];
      return prev.map(user => user.id === authenticatedRosterUser.id ? { ...user, ...authenticatedRosterUser } : user);
    });
    setSimulatedUserId(authenticatedRosterUser.id);
  }, [authenticatedRosterUser?.id, authenticatedRosterUser?.role, authenticatedRosterUser?.status]);

  // Derived current user
  const currentSimulatedUser =
    (authenticatedRosterUser ? users.find(u => u.id === authenticatedRosterUser.id) || authenticatedRosterUser : null) ||
    users.find(u => u.id === simulatedUserId) ||
    users[0];

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('acm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('acm_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('acm_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('acm_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('acm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('acm_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem('acm_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('acm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('acm_simulated_user_id', simulatedUserId);
  }, [simulatedUserId]);

  const setSimulatedUserById = (userId: string) => {
    setSimulatedUserId(userId);
    // Update lastActive timestamp on simulated load
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, lastActive: new Date().toISOString() } : u));
  };

  // Helper helper to write audit logs
  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      actorId: currentSimulatedUser.id,
      actorName: currentSimulatedUser.displayName,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper helper to generate alerts/notifications
  const notifyUser = (userId: string, title: string, message: string) => {
    const newNotif: Notification = {
      id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Permission Logic Engine (Section 5)
  const checkPermission = (permission: string, resourceTeamId: string | null = null, resourceOwnerId?: string): boolean => {
    const role = currentSimulatedUser.role;
    const userId = currentSimulatedUser.id;
    const userTeams = currentSimulatedUser.teams;

    // Platform, EB, and legacy ACM Admin have broad authorization in the MVP.
    if ([MemberRole.PLATFORM_ADMIN, MemberRole.EB_ADMIN, MemberRole.ACM_ADMIN].includes(role)) return true;

    switch (permission) {
      case 'users.manage':
        return false; // Admins only
      case 'users.read':
        return true; // Everyone can read user profiles in simulated directory
      case 'teams.manage':
        return role === MemberRole.CORE_MEMBER; // Core members can manage their scoped teams
      case 'events.create':
        return role === MemberRole.CORE_MEMBER || role === MemberRole.REVIEWER || role === MemberRole.THIRD_YEAR;
      case 'events.edit':
        if (role === MemberRole.CORE_MEMBER) return true;
        if (resourceOwnerId === userId) return true;
        return false;
      case 'events.delete':
        return role === MemberRole.CORE_MEMBER;
      case 'tasks.create':
        return role !== MemberRole.SOCIETY_MEMBER; // 1st, 2nd, 3rd, Core, Reviewer can create tasks
      case 'tasks.assign':
        return role === MemberRole.CORE_MEMBER || role === MemberRole.REVIEWER || role === MemberRole.THIRD_YEAR;
      case 'tasks.review':
        return role === MemberRole.CORE_MEMBER || role === MemberRole.REVIEWER;
      case 'attendance.manage':
        return role === MemberRole.CORE_MEMBER || role === MemberRole.REVIEWER;
      case 'comments.create':
        return currentSimulatedUser.status === 'Active';
      default:
        return false;
    }
  };

  // ACTIONS

  // Calendar Events
  const addEvent = (eventData: Omit<Event, 'id' | 'ownerId' | 'isCancelled' | 'rsvps'>) => {
    const newId = `event-${Date.now()}`;
    const newEvent: Event = {
      ...eventData,
      id: newId,
      ownerId: currentSimulatedUser.id,
      isCancelled: false,
      rsvps: { [currentSimulatedUser.id]: 'ACCEPTED' }
    };
    
    setEvents(prev => [...prev, newEvent]);
    logAction('EVENT_CREATED', `Created Event "${newEvent.title}" (${newEvent.type})`);

    // If meeting type, spin up initial meeting details as well
    if (newEvent.type === EventType.MEETING) {
      const newMeeting: Meeting = {
        id: newId,
        agenda: [],
        minutes: '',
        decisions: [],
        attendance: {},
        status: 'SCHEDULED'
      };
      setMeetings(prev => [...prev, newMeeting]);
    }
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const titleChange = updates.title && updates.title !== e.title ? ` (Title changed to "${updates.title}")` : '';
        logAction('EVENT_UPDATED', `Updated Event "${e.title}"${titleChange}`);
        return { ...e, ...updates };
      }
      return e;
    }));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        logAction('EVENT_DELETED', `Soft deleted Event "${e.title}"`);
        return { ...e, isCancelled: true };
      }
      return e;
    }));
  };

  const rsvpEvent = (eventId: string, userId: string, rsvpStatus: 'ACCEPTED' | 'TENTATIVE' | 'DECLINED') => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const updatedRsvps = { ...e.rsvps, [userId]: rsvpStatus };
        logAction('EVENT_RSVP_UPDATE', `User ${currentSimulatedUser.displayName} marked RSVP as ${rsvpStatus} for "${e.title}"`);
        return { ...e, rsvps: updatedRsvps };
      }
      return e;
    }));
  };

  // Meetings
  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        logAction('MEETING_UPDATED', `Updated Minutes & Decisions for meeting identifier: ${meetingId}`);
        return { ...m, ...updates };
      }
      return m;
    }));
  };

  const recordMeetingAttendance = (meetingId: string, userId: string, status: AttendanceStatus) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        const updatedAttendance = { ...m.attendance, [userId]: status };
        return { ...m, attendance: updatedAttendance };
      }
      return m;
    }));
  };

  // Tasks
  const addTask = (taskData: Omit<Task, 'id' | 'creatorId' | 'comments' | 'attachments' | 'version'>) => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
      creatorId: currentSimulatedUser.id,
      comments: [],
      attachments: [],
      version: 1
    };

    setTasks(prev => [...prev, newTask]);
    logAction('TASK_CREATED', `Created Task "${newTask.title}" under priority ${newTask.priority}`);

    // Notify assignees
    taskData.assigneeIds.forEach(uid => {
      if (uid !== currentSimulatedUser.id) {
        notifyUser(uid, 'New Task Assigned 📋', `${currentSimulatedUser.displayName} assigned you to "${taskData.title}"`);
      }
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const statusLog = updates.status && updates.status !== t.status ? ` (Status: ${t.status} → ${updates.status})` : '';
        logAction('TASK_UPDATED', `Updated Task "${t.title}"${statusLog}`);
        return { ...t, ...updates, version: t.version + 1 };
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task) {
        logAction('TASK_DELETED', `Deleted Task "${task.title}"`);
      }
      return prev.filter(t => t.id !== taskId);
    });
  };

  const addTaskComment = (taskId: string, text: string) => {
    const newCommentObj = {
      id: `comm-${Date.now()}`,
      userId: currentSimulatedUser.id,
      text,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Find if someone is mentioned using standard @Regex
        const mentions = text.match(/@(\w+)/g);
        if (mentions) {
          mentions.forEach(mention => {
            const cleanName = mention.replace('@', '').toLowerCase();
            const matchedUser = users.find(u => u.displayName.toLowerCase().replace(/\s/g, '').includes(cleanName));
            if (matchedUser && matchedUser.id !== currentSimulatedUser.id) {
              notifyUser(matchedUser.id, 'Mentioned in comment 💬', `${currentSimulatedUser.displayName} mentioned you in "${t.title}"`);
            }
          });
        }
        return { ...t, comments: [...t.comments, newCommentObj] };
      }
      return t;
    }));
  };

  const transitionTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logAction('TASK_STATUS_TRANSITION', `Task "${t.title}" transitioned ${t.status} → ${newStatus}`);
        
        // Notify owner or creator if status reaches DONE
        if (newStatus === TaskStatus.DONE && t.creatorId !== currentSimulatedUser.id) {
          notifyUser(t.creatorId, 'Task Completed! 🎉', `Your created task "${t.title}" was completed by ${currentSimulatedUser.displayName}`);
        }
        
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const submitTaskReview = (taskId: string, reviewerId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logAction('TASK_REVIEW_SUBMITTED', `Task "${t.title}" submitted for review to reviewer`);
        notifyUser(reviewerId, 'Task review requested 👀', `${currentSimulatedUser.displayName} submitted "${t.title}" for review`);
        return { ...t, status: TaskStatus.IN_REVIEW, reviewerId };
      }
      return t;
    }));
  };

  const approveTask = (taskId: string, notes?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logAction('TASK_APPROVED', `Approved Task "${t.title}". Notes: ${notes || 'No notes'}`);
        t.assigneeIds.forEach(uid => {
          notifyUser(uid, 'Task approved! ✅', `Your work on "${t.title}" was approved by ${currentSimulatedUser.displayName}`);
        });
        return { ...t, status: TaskStatus.DONE };
      }
      return t;
    }));
  };

  const requestTaskChanges = (taskId: string, feedback: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        logAction('TASK_CHANGES_REQUESTED', `Changes requested on Task "${t.title}". Feedback: ${feedback}`);
        t.assigneeIds.forEach(uid => {
          notifyUser(uid, 'Task revisions requested ⚠️', `${currentSimulatedUser.displayName} requested revisions on "${t.title}": "${feedback}"`);
        });
        return { ...t, status: TaskStatus.IN_PROGRESS };
      }
      return t;
    }));
  };

  // Deadlines
  const addDeadline = (deadlineData: Omit<Deadline, 'id' | 'status' | 'submissionEvidence'>) => {
    const newDeadline: Deadline = {
      ...deadlineData,
      id: `dead-${Date.now()}`,
      status: DeadlineStatus.UPCOMING,
      submissionEvidence: null
    };

    setDeadlines(prev => [...prev, newDeadline]);
    logAction('DEADLINE_CREATED', `Created Deadline milestones: "${newDeadline.title}"`);
  };

  const updateDeadline = (deadlineId: string, updates: Partial<Deadline>) => {
    setDeadlines(prev => prev.map(d => {
      if (d.id === deadlineId) {
        logAction('DEADLINE_UPDATED', `Updated Deadline specifications for: "${d.title}"`);
        return { ...d, ...updates };
      }
      return d;
    }));
  };

  const submitDeadlineEvidence = (deadlineId: string, url: string, text: string) => {
    setDeadlines(prev => prev.map(d => {
      if (d.id === deadlineId) {
        logAction('DEADLINE_SUBMITTED', `Evidence submitted for "${d.title}"`);
        return {
          ...d,
          submissionUrl: url,
          submissionEvidence: text,
          status: DeadlineStatus.SUBMITTED
        };
      }
      return d;
    }));
  };

  // Administrative / Users & Teams (Section 6.11)
  const updateUserRoleAndStatus = (userId: string, role: MemberRole, status: 'Active' | 'Deactivated') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const oldRole = u.role;
        const oldStatus = u.status;
        logAction('ADMIN_USER_MODIFIED', `Modified member ${u.displayName} (Role: ${oldRole} → ${role}, Status: ${oldStatus} → ${status})`);
        
        if (oldRole !== role) {
          notifyUser(userId, 'Security Role Updated 🔐', `An administrator updated your role to ${role}`);
        }
        if (oldStatus !== status && status === 'Deactivated') {
          // Send security alert
          notifyUser(userId, 'Account Suspended 🚫', 'Your membership account has been deactivated by an administrator');
        }

        return { ...u, role, status };
      }
      return u;
    }));
  };

  const createTeam = (name: string, description: string, leadId: string) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      description,
      leadId,
      isArchived: false
    };

    setTeams(prev => [...prev, newTeam]);
    logAction('TEAM_CREATED', `Created new Team "${name}" led by user identifier: ${leadId}`);

    // Update lead's user record teams
    setUsers(prev => prev.map(u => u.id === leadId ? { ...u, teams: [...u.teams, newTeam.id] } : u));
    notifyUser(leadId, 'Assigned Team Lead 🎖️', `You have been appointed as Team Lead for the newly formed "${name}"`);
  };

  const updateTeam = (teamId: string, name: string, description: string, leadId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        logAction('TEAM_UPDATED', `Updated Team "${name}" details`);
        return { ...t, name, description, leadId };
      }
      return t;
    }));

    // Ensure lead is in the team
    setUsers(prev => prev.map(u => {
      if (u.id === leadId && !u.teams.includes(teamId)) {
        return { ...u, teams: [...u.teams, teamId] };
      }
      return u;
    }));
  };

  const addTeamMember = (teamId: string, userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId && !u.teams.includes(teamId)) {
        const teamObj = teams.find(t => t.id === teamId);
        logAction('TEAM_MEMBER_ADDED', `Added ${u.displayName} to team ${teamObj?.name || teamId}`);
        notifyUser(userId, 'Added to Team 👥', `You have been added as a member of the "${teamObj?.name || 'new team'}"`);
        return { ...u, teams: [...u.teams, teamId] };
      }
      return u;
    }));
  };

  const removeTeamMember = (teamId: string, userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const teamObj = teams.find(t => t.id === teamId);
        logAction('TEAM_MEMBER_REMOVED', `Removed ${u.displayName} from team ${teamObj?.name || teamId}`);
        return { ...u, teams: u.teams.filter(tid => tid !== teamId) };
      }
      return u;
    }));
  };

  // Notifications
  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === currentSimulatedUser.id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.filter(n => n.userId !== currentSimulatedUser.id));
  };

  // ── Simulated Presence Engine ──

  const [onlineMembers, setOnlineMembers] = useState<Map<string, PresenceMember>>(() => {
    const saved = localStorage.getItem('acm_online_members');
    if (saved) {
      try {
        return new Map<string, PresenceMember>(JSON.parse(saved));
      } catch { /* ignore corrupt data */ }
    }
    return new Map();
  });

  const [joinNotifications, setJoinNotifications] = useState<
    { id: string; members: string[]; createdAt: string }[]
  >([]);

  const onlineMembersRef = useRef<Map<string, PresenceMember>>(onlineMembers);
  const presenceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const presenceHeartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const joinedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onlineMembersRef.current = onlineMembers;
  }, [onlineMembers]);

  useEffect(() => {
    const arr = Array.from(onlineMembers.entries());
    localStorage.setItem('acm_online_members', JSON.stringify(arr));
  }, [onlineMembers]);

  const userToPresence = useCallback((u: User): PresenceMember => {
    const nameParts = u.displayName.split(' ');
    return {
      id: u.id,
      name: u.displayName,
      role: u.role,
      avatarUrl: u.avatar,
      initials: nameParts.map(p => p[0]).join('').toUpperCase().slice(0, 2),
      teamId: u.teams[0],
      status: 'ONLINE',
      lastSeenAt: new Date().toISOString(),
    };
  }, []);

  const publishEvent = useCallback((event: PresenceEvent) => {
    switch (event.type) {
      case 'presence.snapshot': {
        presenceTimersRef.current.forEach(timer => clearTimeout(timer));
        presenceTimersRef.current.clear();
        const snapshotMap = new Map<string, PresenceMember>();
        event.members.forEach(m => snapshotMap.set(m.id, m));
        joinedIdsRef.current = new Set(event.members.map(m => m.id));
        setOnlineMembers(snapshotMap);
        break;
      }
      case 'presence.joined': {
        const pendingRemoval = presenceTimersRef.current.get(event.member.id);
        if (pendingRemoval) {
          clearTimeout(pendingRemoval);
          presenceTimersRef.current.delete(event.member.id);
        }

        const shouldNotify = !joinedIdsRef.current.has(event.member.id);
        setOnlineMembers(prev => {
          const next = new Map(prev);
          next.set(event.member.id, event.member);
          return next;
        });
        joinedIdsRef.current.add(event.member.id);

        if (shouldNotify) {
          const batchId = `jn-${Date.now()}`;
          setTimeout(() => {
            setJoinNotifications(prev => [...prev, {
              id: batchId,
              members: [event.member.name],
              createdAt: new Date().toISOString(),
            }]);
          }, 50);
        }
        break;
      }
      case 'presence.updated': {
        setOnlineMembers((prev: Map<string, PresenceMember>) => {
          const next = new Map(prev);
          const existing = next.get(event.memberId);
          if (existing) {
            next.set(event.memberId, {
              id: existing.id, name: existing.name, role: existing.role,
              avatarUrl: existing.avatarUrl, initials: existing.initials,
              teamId: existing.teamId, status: event.status, lastSeenAt: event.occurredAt,
            });
          }
          return next;
        });
        break;
      }
      case 'presence.left': {
        if (presenceTimersRef.current.has(event.memberId)) break;

        setOnlineMembers((prev: Map<string, PresenceMember>) => {
          const existing = prev.get(event.memberId);
          if (!existing) return prev;
          const next = new Map(prev);
          next.set(event.memberId, {
            ...existing,
            status: 'AWAY',
            lastSeenAt: event.occurredAt,
          });
          return next;
        });

        const graceMs = 30000;
        const removalTimer = setTimeout(() => {
          setOnlineMembers((prev: Map<string, PresenceMember>) => {
            const next = new Map(prev);
            next.delete(event.memberId);
            return next;
          });
          joinedIdsRef.current.delete(event.memberId);
          presenceTimersRef.current.delete(event.memberId);
        }, graceMs);

        presenceTimersRef.current.set(event.memberId, removalTimer);
        break;
      }
    }
  }, []);

  const dismissJoinNotification = useCallback((id: string) => {
    setJoinNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Simulated presence: connect "online" users on mount and rotate them
  useEffect(() => {
    const activeUsers = users.filter(u => u.status === 'Active');
    const initialOnline = activeUsers.slice(0, 5);
    const members = initialOnline.map(u => userToPresence(u));

    publishEvent({
      type: 'presence.snapshot',
      members,
      occurredAt: new Date().toISOString(),
    });

    // Simulate occasional joins (every 15s if less than 6 online)
    const simulationInterval = setInterval(() => {
      const currentOnline = onlineMembersRef.current;
      if (currentOnline.size >= 7) return;
      const offlineUsers = activeUsers.filter(u => !currentOnline.has(u.id));
      if (offlineUsers.length === 0) return;

      const randomUser = offlineUsers[Math.floor(Math.random() * offlineUsers.length)];
      const member: PresenceMember = {
        ...userToPresence(randomUser),
        status: 'JUST_JOINED',
      };

      publishEvent({ type: 'presence.joined', member, occurredAt: new Date().toISOString() });
      setTimeout(() => {
        publishEvent({ type: 'presence.updated', memberId: member.id, status: 'ONLINE', occurredAt: new Date().toISOString() });
      }, 5000);
    }, 15000);

    // Simulate occasional leaves
    const leaveInterval = setInterval(() => {
      const currentOnline = onlineMembersRef.current;
      if (currentOnline.size <= 2) return;
      const members: PresenceMember[] = Array.from(currentOnline.values() as Iterable<PresenceMember>)
        .filter((member) => member.id !== currentSimulatedUser.id);
      if (members.length === 0) return;

      const randomMember = members[Math.floor(Math.random() * members.length)];
      publishEvent({ type: 'presence.left', memberId: randomMember.id, occurredAt: new Date().toISOString() });
    }, 45000);

    return () => {
      clearInterval(simulationInterval);
      clearInterval(leaveInterval);
      presenceTimersRef.current.forEach(t => clearTimeout(t));
      presenceTimersRef.current.clear();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      users,
      teams,
      events,
      meetings,
      tasks,
      deadlines,
      auditLogs,
      notifications: notifications.filter(n => n.userId === currentSimulatedUser.id),
      
      currentSimulatedUser,
      setSimulatedUserById,
      
      addEvent,
      updateEvent,
      deleteEvent,
      rsvpEvent,
      
      updateMeeting,
      recordMeetingAttendance,
      
      addTask,
      updateTask,
      deleteTask,
      addTaskComment,
      transitionTaskStatus,
      submitTaskReview,
      approveTask,
      requestTaskChanges,
      
      addDeadline,
      updateDeadline,
      submitDeadlineEvidence,
      
      updateUserRoleAndStatus,
      createTeam,
      updateTeam,
      addTeamMember,
      removeTeamMember,
      
      markNotificationRead,
      markAllNotificationsRead,
      clearAllNotifications,

      checkPermission,

      onlineMembers,
      joinNotifications,
      dismissJoinNotification
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
