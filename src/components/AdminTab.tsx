import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MemberRole, User, Team } from '../types';
import { Users, Shield, Plus, ShieldAlert, History, Edit, CheckCircle2, Trash2, Inbox } from 'lucide-react';
import { PublicAuthSession } from '../auth/types';
import ApprovalInbox from './ApprovalInbox';

export default function AdminTab({ authSession }: { authSession?: PublicAuthSession | null }) {
  const {
    users,
    teams,
    auditLogs,
    updateUserRoleAndStatus,
    createTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    currentSimulatedUser
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'users' | 'teams' | 'audit'>('approvals');
  const [successMsg, setSuccessMsg] = useState('');

  // Team creation states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamLeadId, setTeamLeadId] = useState('');

  // State to add member to team
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<Record<string, string>>({});

  const handleCreateOrUpdateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamLeadId) return;

    if (editingTeamId) {
      updateTeam(editingTeamId, teamName.trim(), teamDesc.trim(), teamLeadId);
      setSuccessMsg(`Team "${teamName}" successfully updated!`);
    } else {
      createTeam(teamName.trim(), teamDesc.trim(), teamLeadId);
      setSuccessMsg(`Team "${teamName}" successfully created!`);
    }

    // Reset
    setTeamName('');
    setTeamDesc('');
    setTeamLeadId('');
    setEditingTeamId(null);
    setShowTeamModal(false);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamDesc(team.description);
    setTeamLeadId(team.leadId);
    setShowTeamModal(true);
  };

  const handleAddMemberToTeam = (teamId: string) => {
    const userId = selectedMemberToAdd[teamId];
    if (!userId) return;

    addTeamMember(teamId, userId);
    setSuccessMsg('Member added to team successfully!');
    setSelectedMemberToAdd(prev => ({ ...prev, [teamId]: '' }));
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleRemoveMemberFromTeam = (teamId: string, userId: string) => {
    removeTeamMember(teamId, userId);
    setSuccessMsg('Member removed from team.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleToggleUserStatus = (user: User) => {
    const targetStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    updateUserRoleAndStatus(user.id, user.role, targetStatus);
    setSuccessMsg(`User status updated to ${targetStatus}`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleRoleChange = (userId: string, val: MemberRole) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      updateUserRoleAndStatus(userId, val, user.status);
      setSuccessMsg(`User role scaled to ${val}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Restrict view if the evaluator simulates a low-privileged role and bypasses tab checks
  const isAdmin = [
    MemberRole.PLATFORM_ADMIN,
    MemberRole.EB_ADMIN,
    MemberRole.ACM_ADMIN,
    MemberRole.CORE_MEMBER,
  ].includes(currentSimulatedUser.role);

  if (!isAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-12 w-12 text-[#E15B3A] animate-pulse" />
        <h3 className="text-lg font-display font-bold">Administrative Privilege Refused</h3>
        <p className="text-sm max-w-md">
          Section 5 policies state that only members assigned the <strong>ACM Admin</strong> or <strong>Core Member</strong> role can access this hub.
        </p>
        <span className="text-xs text-rose-950/60 font-mono">Your Current Role: {currentSimulatedUser.role}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Admin Top bar */}
      <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-[#FAF6EE] p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'approvals' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60'
            }`}
          >
            <Inbox className="h-4 w-4" /> Approval Inbox
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'users' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60'
            }`}
          >
            <Users className="h-4 w-4" /> Member Directory
          </button>
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'teams' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60'
            }`}
          >
            <Shield className="h-4 w-4" /> Team Builder
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSubTab === 'audit' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60'
            }`}
          >
            <History className="h-4 w-4" /> Security Audit logs
          </button>
        </div>

        {/* Action Trigger */}
        {activeSubTab === 'teams' && (
          <button
            onClick={() => {
              setEditingTeamId(null);
              setTeamName('');
              setTeamDesc('');
              setTeamLeadId('');
              setShowTeamModal(true);
            }}
            className="bg-[#1A4331] hover:bg-[#255C44] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Team
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-[#E6EFEA] text-[#1A4331] px-6 py-2.5 text-xs font-bold border border-[#1A4331]/10 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* RENDER SUBTABS */}

      {activeSubTab === 'approvals' && (
        <ApprovalInbox authSession={authSession || null} />
      )}

      {/* SUBTAB 1: USER DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm">
          <div className="pb-4 border-b border-[#FAF6EE] mb-4">
            <h3 className="text-sm font-display font-bold text-[#1A4331]">ACM Society Roster & Privilege Scaler</h3>
            <p className="text-xs text-emerald-950/60 mt-0.5">Scale permissions or deactivate members.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#FAF6EE] text-[10px] font-bold uppercase tracking-wider text-emerald-950/40">
                  <th className="py-3 px-4">Member Details</th>
                  <th className="py-3 px-4">academic year</th>
                  <th className="py-3 px-4">Current Role Scope</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF6EE]">
                {users.map(user => (
                  <tr key={user.id} className="text-xs text-emerald-950/80 hover:bg-[#FAF6EE]/20 transition-all">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-bold text-[#1A4331]">{user.displayName}</p>
                        <p className="text-[10px] text-emerald-950/50 font-mono">{user.email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-emerald-950/60">{user.academicYear}</td>

                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as MemberRole)}
                        disabled={user.id === currentSimulatedUser.id} // Cannot update own simulated role from inside table
                        className="p-1.5 bg-[#FAF6EE] border border-[#EBE2D4] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 text-[#1A4331] cursor-pointer disabled:opacity-40"
                      >
                        {Object.values(MemberRole).map(roleOpt => (
                          <option key={roleOpt} value={roleOpt}>{roleOpt}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        user.status === 'Active' 
                          ? 'bg-[#E6EFEA] text-[#1A4331]' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {user.id !== currentSimulatedUser.id ? (
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            user.status === 'Active'
                              ? 'border-rose-200 hover:bg-rose-50 text-[#E15B3A]'
                              : 'border-emerald-200 hover:bg-emerald-50 text-[#1A4331]'
                          }`}
                        >
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-950/30 font-medium">Own Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: TEAM MANAGEMENT */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map(team => {
            const leadUser = users.find(u => u.id === team.leadId);
            const teamMembers = users.filter(u => u.teams.includes(team.id));
            const outsideMembers = users.filter(u => u.status === 'Active' && !u.teams.includes(team.id));

            return (
              <div key={team.id} className="bg-white border border-[#EBE2D4] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-emerald-950/5 mb-3">
                    <div>
                      <h4 className="text-sm font-display font-bold text-[#1A4331]">{team.name}</h4>
                      <p className="text-[10px] text-emerald-950/50 mt-0.5 font-medium">Lead: {leadUser?.displayName || 'Unassigned'}</p>
                    </div>
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="p-1.5 hover:bg-[#FAF6EE] rounded-lg text-emerald-950/60 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-emerald-950/80 leading-relaxed mb-4">{team.description}</p>

                  {/* Members list */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-widest">Team Members ({teamMembers.length})</h5>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF6EE]/50 border border-[#EBE2D4] text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={member.avatar}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-semibold text-emerald-950/90">{member.displayName}</span>
                          </div>
                          {member.id !== team.leadId ? (
                            <button
                              onClick={() => handleRemoveMemberFromTeam(team.id, member.id)}
                              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : (
                            <span className="text-[9px] text-[#854D0E] bg-amber-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Lead</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add member controls */}
                <div className="pt-3 border-t border-emerald-950/5 flex gap-2">
                  <select
                    value={selectedMemberToAdd[team.id] || ''}
                    onChange={(e) => setSelectedMemberToAdd(prev => ({ ...prev, [team.id]: e.target.value }))}
                    className="flex-1 p-2 bg-[#FAF6EE] text-xs border border-[#EBE2D4] rounded-xl focus:outline-none text-[#1A4331] font-semibold"
                  >
                    <option value="">Add Teammate...</option>
                    {outsideMembers.map(u => (
                      <option key={u.id} value={u.id}>{u.displayName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddMemberToTeam(team.id)}
                    disabled={!selectedMemberToAdd[team.id]}
                    className="bg-[#1A4331] hover:bg-[#255C44] disabled:bg-[#1A4331]/30 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 3: APPEND-ONLY AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm">
          <div className="pb-4 border-b border-[#FAF6EE] mb-4">
            <h3 className="text-sm font-display font-bold text-[#1A4331]">Append-Only Core Security Logs</h3>
            <p className="text-xs text-emerald-950/60 mt-0.5">Complete session audit logs for compliance verification.</p>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 bg-[#FAF6EE]/50 border border-[#EBE2D4] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#E6EFEA] text-[#1A4331] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      {log.action}
                    </span>
                    <span className="font-bold text-[#1A4331]">{log.actorName}</span>
                  </div>
                  <p className="text-emerald-950/80 mt-1 pl-1 font-medium">{log.details}</p>
                </div>
                <span className="text-[9px] text-emerald-950/40 font-mono self-start sm:self-center">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT TEAM MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#1A4331]">
                {editingTeamId ? 'Edit Committee details' : 'Draft New ACM Committee'}
              </h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-1 rounded-full hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrUpdateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">COMMITTEE NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creative Content Domain"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DESCRIPTION & MANDATE</label>
                <textarea
                  required
                  placeholder="Define domain deliverables and responsibility scopes..."
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">APPOINT CORE COMMITTEE LEAD</label>
                <select
                  required
                  value={teamLeadId}
                  onChange={(e) => setTeamLeadId(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                >
                  <option value="">Select Coordinator</option>
                  {users.filter(u => u.status === 'Active').map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#EBE2D4]">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#EBE2D4] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1A4331] hover:bg-[#255C44] text-white text-xs font-bold cursor-pointer"
                >
                  {editingTeamId ? 'Save Changes' : 'Initialize Committee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
