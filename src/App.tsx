/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { MemberRole } from './types';
import { PublicAuthSession } from './auth/types';
import { fetchAuthSession, logout } from './auth/client';
import DashboardTab from './components/DashboardTab';
import CalendarTab from './components/CalendarTab';
import TasksTab from './components/TasksTab';
import DeadlinesTab from './components/DeadlinesTab';
import AdminTab from './components/AdminTab';
import AskJoinWidget from './components/AskJoinWidget';
import SignInPage from './components/SignInPage';
import PendingApprovalPage from './components/PendingApprovalPage';
import AuthStatusPage from './components/AuthStatusPage';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  ShieldAlert,
  Shield,
  Bell,
  Fingerprint,
  ChevronDown,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  LogOut
} from 'lucide-react';

function AppContent({
  authSession,
  refreshAuthSession,
}: {
  authSession: PublicAuthSession | null;
  refreshAuthSession: () => void;
}) {
  const {
    currentSimulatedUser,
    users,
    setSimulatedUserById,
    notifications
  } = useApp();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Quick navigation helpers
  const handleNavigateToEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('Calendar');
  };

  const handleNavigateToTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveTab('Tasks');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Administrative hub visibility check
  const showAdminTab =
    currentSimulatedUser.role === MemberRole.PLATFORM_ADMIN ||
    currentSimulatedUser.role === MemberRole.EB_ADMIN ||
    currentSimulatedUser.role === MemberRole.ACM_ADMIN ||
    currentSimulatedUser.role === MemberRole.CORE_MEMBER;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EBE2D4] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1A4331] flex items-center justify-center text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">SOCIETY PORTFOLIO</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif italic tracking-tighter text-[#1A4331] font-medium leading-none">ACM Nexus</h1>
              <span className="flex h-1.5 w-1.5 bg-black rounded-full"></span>
            </div>
            <p className="text-[9px] text-emerald-950/45 uppercase tracking-[0.2em] font-bold mt-1">Society Collaboration Suite</p>
          </div>
        </div>

        {/* Middle: authenticated identity summary or legacy simulator for static demos */}
        <div className="flex items-center gap-2.5 bg-[#FAF6EE] border border-[#EBE2D4] px-4 py-2 rounded-xl max-w-sm w-full">
          <Fingerprint className="h-4.5 w-4.5 text-[#1A4331] opacity-70" />
          <div className="flex-1 text-left">
            {authSession?.authenticated ? (
              <>
                <label className="block text-[8px] font-bold text-emerald-950/40 uppercase tracking-[0.15em]">Verified Thapar Session</label>
                <p className="w-full bg-transparent text-xs font-bold text-[#1A4331] pr-6 truncate">
                  {authSession.user?.primary_email}
                </p>
              </>
            ) : (
              <>
                <label className="block text-[8px] font-bold text-emerald-950/40 uppercase tracking-[0.15em]">Simulate ACM Roster Member</label>
                <div className="relative">
                  <select
                    value={currentSimulatedUser.id}
                    onChange={(e) => {
                      setSimulatedUserById(e.target.value);
                      setSelectedEventId(null);
                      setSelectedTaskId(null);
                    }}
                    className="w-full bg-transparent text-xs font-bold text-[#1A4331] pr-6 focus:outline-none cursor-pointer appearance-none"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.displayName} ({u.role}) {u.status === 'Deactivated' ? ' - DEACTIVATED' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1A4331]/60 pointer-events-none" />
                </div>
              </>
            )}
            </div>
        </div>

        {/* Right: Active Profile summary & Issue details */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col text-right border-r border-[#EBE2D4] pr-4">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-40">Issue 26</span>
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#1a1a1a]">Summer 2026</span>
          </div>

          {/* Notification Alert center */}
          <div className="relative">
            <button 
              onClick={() => setActiveTab('Dashboard')}
              className="p-2 hover:bg-[#FAF6EE] rounded-xl text-[#1A4331] transition-all cursor-pointer relative"
              aria-label="View notifications on dashboard"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <img
              src={currentSimulatedUser.avatar}
              alt=""
              className="w-9 h-9 rounded-lg object-cover border border-[#EBE2D4]"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#1E2E24]">{currentSimulatedUser.displayName}</span>
              <span className="text-[9px] text-white font-bold uppercase bg-black px-2 py-0.5 rounded mt-0.5 self-start tracking-wider">
                {currentSimulatedUser.role}
              </span>
            </div>
          </div>

          {authSession?.authenticated && (
            <button
              type="button"
              onClick={async () => {
                if (authSession.session?.csrfToken) {
                  await logout(authSession.session.csrfToken);
                }
                refreshAuthSession();
              }}
              className="p-2 hover:bg-[#FAF6EE] rounded-xl text-[#1A4331] transition-all cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

      </header>

      {/* CORE NAVIGATION RAIL */}
      <nav className="bg-white border-b border-[#EBE2D4] px-6 py-2 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-2.5">
          {[
            { id: 'Dashboard', label: 'Dashboard Hub', icon: LayoutDashboard },
            { id: 'Calendar', label: 'Calendar & Meetings', icon: Calendar },
            { id: 'Tasks', label: 'Tasks & Kanban', icon: CheckSquare },
            { id: 'Deadlines', label: 'Milestone Deadlines', icon: ShieldAlert }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedEventId(null);
                  setSelectedTaskId(null);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1A4331] text-white shadow shadow-emerald-950/10'
                    : 'text-emerald-950/60 hover:text-emerald-950 hover:bg-[#FAF6EE]/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}

          {/* Admin tab is dynamically greyed out or routed */}
          <button
            onClick={() => {
              if (showAdminTab) {
                setActiveTab('Admin');
                setSelectedEventId(null);
                setSelectedTaskId(null);
              }
            }}
            disabled={!showAdminTab}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              !showAdminTab
                ? 'opacity-40 cursor-not-allowed text-emerald-950/30'
                : activeTab === 'Admin'
                ? 'bg-[#1A4331] text-white shadow'
                : 'text-emerald-950/60 hover:text-emerald-950 hover:bg-[#FAF6EE]/50 cursor-pointer'
            }`}
          >
            <Shield className="h-4 w-4" />
            Administrative Hub
          </button>
        </div>
      </nav>

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-8 relative">
        
        {/* Welcome Callout Banner */}
        <div className="mb-6 p-4 bg-white border border-[#EBE2D4] rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6EFEA] flex items-center justify-center text-[#1A4331]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-[#1A4331]">Welcome Back to ACM Nexus</h2>
              <p className="text-xs text-emerald-950/60 mt-0.5">
                Simulating active environment scoped to <strong>{currentSimulatedUser.displayName}</strong>.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-mono text-[#1A4331]">
            <TrendingUp className="h-4 w-4" />
            <span>Active Session UTC Logged: 2026-07-01</span>
          </div>
        </div>

        {/* Tab Router Switch */}
        {activeTab === 'Dashboard' && (
          <DashboardTab
            onNavigate={setActiveTab}
            onSelectEvent={handleNavigateToEvent}
            onSelectTask={handleNavigateToTask}
          />
        )}

        {activeTab === 'Calendar' && (
          <CalendarTab
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
          />
        )}

        {activeTab === 'Tasks' && (
          <TasksTab
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        )}

        {activeTab === 'Deadlines' && <DeadlinesTab />}

        {activeTab === 'Admin' && <AdminTab authSession={authSession} />}

        {/* Floating Join Widget */}
        <AskJoinWidget />

      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-8 bg-white border-t border-[#EBE2D4] px-6 text-center text-xs text-emerald-950/40">
        <p className="font-semibold font-display text-[#1A4331]/80">© 2026 Colabs. Make plans together.</p>
        <p className="mt-1">ACM Internal Calendar, Meeting & Task Management Platform (ACM Nexus)</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [authSession, setAuthSession] = useState<PublicAuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthSession = () => {
    setLoading(true);
    fetchAuthSession()
      .then(setAuthSession)
      .catch(() => setAuthSession({ authenticated: false }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshAuthSession();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fcfaf7] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </main>
    );
  }

  const path = window.location.pathname;

  if (path.startsWith('/auth/error')) return <AuthStatusPage kind="error" />;
  if (path.startsWith('/auth/rejected')) return <AuthStatusPage kind="rejected" />;
  if (path.startsWith('/auth/suspended')) return <AuthStatusPage kind="suspended" />;
  if (path.startsWith('/auth/deactivated')) return <AuthStatusPage kind="deactivated" />;

  if (!authSession?.authenticated) return <SignInPage />;
  if (authSession.user?.account_state === 'PENDING_APPROVAL') {
    return <PendingApprovalPage session={authSession} onRefresh={refreshAuthSession} />;
  }
  if (authSession.user?.account_state !== 'ACTIVE') {
    return <AuthStatusPage kind={authSession.user?.account_state?.toLowerCase()} />;
  }

  return (
    <AppProvider authSession={authSession}>
      <AppContent authSession={authSession} refreshAuthSession={refreshAuthSession} />
    </AppProvider>
  );
}
