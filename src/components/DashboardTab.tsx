import React from 'react';
import { useApp } from '../AppContext';
import { TaskStatus, EventType, DeadlineStatus } from '../types';
import LivePresenceOrbit from './LivePresenceOrbit';
import RsvpVotingWidget from './RsvpVotingWidget';
import { Calendar, CheckCircle2, Clock, Bell, Trash2, ArrowRight, ShieldAlert, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface DashboardTabProps {
  onNavigate: (tab: string) => void;
  onSelectEvent: (eventId: string) => void;
  onSelectTask: (taskId: string) => void;
}

export default function DashboardTab({ onNavigate, onSelectEvent, onSelectTask }: DashboardTabProps) {
  const {
    tasks,
    events,
    deadlines,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    currentSimulatedUser
  } = useApp();

  // Metrics calculations
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
  const completedTasksCount = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const inReviewTasksCount = tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
  
  // Overdue tasks check
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(t => t.status !== TaskStatus.DONE && t.dueDate < todayStr).length;

  // Next 5 upcoming events
  const upcomingEvents = [...events]
    .filter(e => !e.isCancelled && e.startsAt >= new Date().toISOString())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 5);

  // Active milestones/deadlines
  const activeDeadlines = deadlines.filter(d => d.status !== DeadlineStatus.VERIFIED).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
      {/* Left Column: Stats & Circle & RSVP */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Live Presence Orbit */}
        <LivePresenceOrbit
          scope={{ type: 'organization', id: 'org-acm' }}
          showJoinNotifications
          onMemberClick={(member) => {
            // Navigate to member profile or trigger action
          }}
        />

        {/* Attendance Overlap / Voter slider */}
        <RsvpVotingWidget />
      </div>

      {/* Right Column: Dynamic Hub & Lists */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Row 1: Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#EBE2D4] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-950/60 uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="h-4.5 w-4.5 text-[#2B5F4A]" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-bold text-[#1A4331]">{completedTasksCount}</span>
              <p className="text-[10px] text-emerald-950/60 mt-1">ACM tasks closed</p>
            </div>
          </div>

          <div className="bg-white border border-[#EBE2D4] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-950/60 uppercase tracking-wider">Pending</span>
              <Clock className="h-4.5 w-4.5 text-[#E2A850]" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-bold text-[#854D0E]">{pendingTasks.length}</span>
              <p className="text-[10px] text-emerald-950/60 mt-1">In progress or todo</p>
            </div>
          </div>

          <div className="bg-white border border-[#EBE2D4] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-950/60 uppercase tracking-wider">In Review</span>
              <BookOpen className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-bold text-blue-900">{inReviewTasksCount}</span>
              <p className="text-[10px] text-emerald-950/60 mt-1">Awaiting sign-off</p>
            </div>
          </div>

          <div className={`border p-4 rounded-2xl flex flex-col justify-between transition-all ${
            overdueTasksCount > 0 
              ? 'bg-rose-50 border-rose-200' 
              : 'bg-white border-[#EBE2D4]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-950/60">Overdue</span>
              <AlertCircle className={`h-4.5 w-4.5 ${overdueTasksCount > 0 ? 'text-[#E15B3A] animate-pulse' : 'text-emerald-950/20'}`} />
            </div>
            <div className="mt-4">
              <span className={`text-3xl font-display font-bold ${overdueTasksCount > 0 ? 'text-[#E15B3A]' : 'text-emerald-950/40'}`}>
                {overdueTasksCount}
              </span>
              <p className="text-[10px] text-rose-950/60 mt-1">Missed due dates</p>
            </div>
          </div>
        </div>

        {/* Row 2: Notifications / Activity Alert System */}
        <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#FAF6EE] mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-[#1A4331]" />
              <h3 className="text-sm font-display font-bold text-[#1A4331]">Your Notifications ({notifications.length})</h3>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-[#E15B3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-emerald-950/40 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-950/20" />
              <span>You are fully caught up! No unread notifications.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                    notif.isRead 
                      ? 'bg-white border-[#FAF6EE] opacity-60' 
                      : 'bg-[#E6EFEA]/30 border-[#1A4331]/10'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${notif.isRead ? 'bg-transparent' : 'bg-[#1A4331]'}`}></span>
                      <h4 className="text-xs font-bold text-[#1A4331]">{notif.title}</h4>
                    </div>
                    <p className="text-[11px] text-emerald-950/70 mt-1 pl-3.5">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-[10px] text-[#1A4331] hover:underline bg-[#E6EFEA] px-2 py-0.5 rounded-md font-medium cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 3: Calendar Peek & Deadlines Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Calendar Peeking Card */}
          <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#FAF6EE] mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-[#1A4331]" />
                  <h3 className="text-sm font-display font-bold text-[#1A4331]">Upcoming Events</h3>
                </div>
                <button
                  onClick={() => onNavigate('Calendar')}
                  className="text-xs text-[#1A4331] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  Full View <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-emerald-950/40 text-center py-6">No scheduled events in your queue.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const eventDate = new Date(event.startsAt);
                    const isMeeting = event.type === EventType.MEETING;
                    return (
                      <button
                        key={event.id}
                        onClick={() => onSelectEvent(event.id)}
                        className="w-full p-3 bg-[#FAF6EE]/50 border border-[#EBE2D4] hover:border-[#1A4331]/30 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-10 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#1A4331] line-clamp-1">{event.title}</h4>
                            <p className="text-[10px] text-emerald-950/60 mt-0.5">
                              {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at{' '}
                              {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {isMeeting && (
                          <span className="text-[8px] bg-[#E6EFEA] text-[#1A4331] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Minutes Enabled
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Milestones / Deadlines Peek Card */}
          <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#FAF6EE] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-[#E15B3A]" />
                  <h3 className="text-sm font-display font-bold text-[#1A4331]">Critical Deadlines</h3>
                </div>
                <button
                  onClick={() => onNavigate('Deadlines')}
                  className="text-xs text-[#1A4331] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  All Deadlines <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {activeDeadlines.length === 0 ? (
                <p className="text-xs text-emerald-950/40 text-center py-6">No pending operational deadlines.</p>
              ) : (
                <div className="space-y-3">
                  {activeDeadlines.map(dead => {
                    const dDate = new Date(dead.dueDate);
                    const isOverdue = dead.status === DeadlineStatus.OVERDUE || dDate < new Date();
                    return (
                      <div
                        key={dead.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isOverdue 
                            ? 'bg-rose-50/50 border-rose-100' 
                            : 'bg-[#FAF6EE]/50 border-[#EBE2D4]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#1A4331] line-clamp-1">{dead.title}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isOverdue 
                              ? 'bg-rose-100 text-[#E15B3A]' 
                              : 'bg-amber-100 text-[#854D0E]'
                          }`}>
                            {isOverdue ? 'Overdue' : dead.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-950/60 mt-1 font-medium">
                          Due: {dDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
