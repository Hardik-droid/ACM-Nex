import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Deadline, DeadlineStatus, MemberRole } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, Calendar, Plus, X, ClipboardCheck } from 'lucide-react';

export default function DeadlinesTab() {
  const {
    deadlines,
    teams,
    addDeadline,
    submitDeadlineEvidence,
    tasks,
    currentSimulatedUser
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModalId, setShowSubmitModalId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState('');
  const [relatedTaskIds, setRelatedTaskIds] = useState<string[]>([]);

  // Submission states
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionEvidence, setSubmissionEvidence] = useState('');

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    addDeadline({
      title: title.trim(),
      description,
      teamId: teamId || null,
      dueDate,
      submissionUrl: null,
      relatedTaskIds
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setTeamId('');
    setRelatedTaskIds([]);
    setShowCreateModal(false);
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModalId) return;

    submitDeadlineEvidence(showSubmitModalId, submissionUrl, submissionEvidence);

    setSubmissionUrl('');
    setSubmissionEvidence('');
    setShowSubmitModalId(null);
  };

  const getStatusBadgeClass = (status: DeadlineStatus) => {
    switch (status) {
      case DeadlineStatus.OVERDUE:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case DeadlineStatus.DUE_SOON:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case DeadlineStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case DeadlineStatus.VERIFIED:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-[#E6EFEA] text-[#1A4331] border-emerald-900/10';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
      {/* Sidebar controls */}
      <div className="lg:col-span-3 space-y-4">
        {currentSimulatedUser.role !== MemberRole.SOCIETY_MEMBER && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-[#1A4331] hover:bg-[#255C44] text-white py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" /> Declare Milestone
          </button>
        )}

        <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm text-xs text-emerald-950/70 leading-relaxed">
          <h4 className="font-bold text-[#1A4331] uppercase tracking-wider mb-2">Escalation Guidelines</h4>
          <p>
            Any milestone marked as <span className="font-bold text-rose-700">OVERDUE</span> automatically triggers warning banners in the administrative control workspace.
          </p>
          <p className="mt-2 text-[11px]">
            Please submit dynamic deliverables or Git repository links on or before the due timestamps to maintain society compliance.
          </p>
        </div>
      </div>

      {/* Main deadlines table/list */}
      <div className="lg:col-span-9 space-y-4">
        <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm">
          <div className="pb-4 border-b border-[#FAF6EE] mb-4">
            <h3 className="text-sm font-display font-bold text-[#1A4331]">ACM Society Operational Deadlines</h3>
          </div>

          <div className="space-y-4">
            {deadlines.map(dead => {
              const teamObj = teams.find(t => t.id === dead.teamId);
              const isOverdue = dead.status === DeadlineStatus.OVERDUE || new Date(dead.dueDate) < new Date();
              const displayStatus = isOverdue && dead.status !== DeadlineStatus.SUBMITTED ? DeadlineStatus.OVERDUE : dead.status;

              return (
                <div
                  key={dead.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    displayStatus === DeadlineStatus.OVERDUE 
                      ? 'bg-rose-50/40 border-rose-200' 
                      : 'bg-[#FAF6EE]/20 border-[#EBE2D4]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-emerald-950/5 mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A4331] font-display flex items-center gap-1.5">
                        {displayStatus === DeadlineStatus.OVERDUE && <AlertTriangle className="h-4 w-4 text-[#E15B3A]" />}
                        {dead.title}
                      </h4>
                      <p className="text-[10px] text-emerald-950/50 mt-0.5">Scoped Team: {teamObj?.name || 'General'}</p>
                    </div>

                    <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase border tracking-wider self-start sm:self-center ${getStatusBadgeClass(displayStatus)}`}>
                      {displayStatus}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-950/80 leading-relaxed mb-4">{dead.description}</p>

                  {/* Submission Info / Action row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-emerald-950/5 text-xs text-emerald-950/60 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#1A4331]" />
                      Due: {new Date(dead.dueDate).toLocaleString()}
                    </span>

                    <div className="flex gap-2">
                      {dead.submissionUrl && (
                        <a
                          href={dead.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border border-[#EBE2D4] hover:border-[#1A4331] text-[#1A4331] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all text-[11px]"
                        >
                          Deliverable <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {dead.status !== DeadlineStatus.SUBMITTED ? (
                        <button
                          onClick={() => setShowSubmitModalId(dead.id)}
                          className="bg-[#1A4331] hover:bg-[#255C44] text-white px-4 py-1.5 rounded-xl font-bold cursor-pointer text-[11px]"
                        >
                          Submit Evidence
                        </button>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="h-4 w-4" /> Evidence Logged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Display if exists */}
                  {dead.submissionEvidence && (
                    <div className="mt-3 p-3 bg-white border border-[#EBE2D4] rounded-xl text-[11px] text-emerald-950/80">
                      <span className="font-bold text-[#1A4331] block mb-0.5">Submission Receipt Notes:</span>
                      <p className="font-mono">{dead.submissionEvidence}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE DEADLINE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#1A4331]">Declare Milestone Deadline</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateDeadline} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">MILESTONE TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 2 Sponsorship Ledger Close"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DESCRIPTION</label>
                <textarea
                  placeholder="Define deliverables or expected outputs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">TEAM SCOPE</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  >
                    <option value="">General</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DUE TIMESTAMP</label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#EBE2D4]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#EBE2D4] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1A4331] hover:bg-[#255C44] text-white text-xs font-bold cursor-pointer"
                >
                  Declare Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT EVIDENCE MODAL */}
      {showSubmitModalId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#1A4331] flex items-center gap-1.5">
                <ClipboardCheck className="h-5 w-5 text-[#1A4331]" /> Submit Deliverable Evidence
              </h3>
              <button
                onClick={() => setShowSubmitModalId(null)}
                className="p-1 rounded-full hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitEvidence} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DELIVERABLE URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://github.com/acm/... or Google Drive link"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DELIVERY RECEIPT NOTES</label>
                <textarea
                  required
                  placeholder="Provide notes, system version hashes, or descriptions of the deliverable output..."
                  value={submissionEvidence}
                  onChange={(e) => setSubmissionEvidence(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#EBE2D4]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModalId(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#EBE2D4] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1A4331] hover:bg-[#255C44] text-white text-xs font-bold cursor-pointer"
                >
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
