import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { AttendanceStatus, Meeting, Event, TaskPriority, TaskStatus } from '../types';
import { X, Users, CheckSquare, Plus, FileText, CheckCircle2, AlertTriangle, ArrowRight, ClipboardCheck } from 'lucide-react';

interface MeetingOutcomesModalProps {
  eventId: string;
  onClose: () => void;
}

export default function MeetingOutcomesModal({ eventId, onClose }: MeetingOutcomesModalProps) {
  const {
    events,
    meetings,
    users,
    updateMeeting,
    recordMeetingAttendance,
    addTask
  } = useApp();

  const eventItem = events.find(e => e.id === eventId);
  const meetingItem = meetings.find(m => m.id === eventId);

  // States for updating outcomes
  const [minutes, setMinutes] = useState(meetingItem?.minutes || '');
  const [agenda, setAgenda] = useState<string[]>(meetingItem?.agenda || []);
  const [decisions, setDecisions] = useState<string[]>(meetingItem?.decisions || []);

  // Action Item deployment state
  const [actionTitle, setActionTitle] = useState('');
  const [actionAssignee, setActionAssignee] = useState('');
  const [actionPriority, setActionPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [actionDueDate, setActionDueDate] = useState('');
  
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!eventItem || !meetingItem) {
    return null;
  }

  // Get users who are in the rsvp list or general members to populate attendance sheet
  const activeMembers = users.filter(u => u.status === 'Active');

  const handleAddAgenda = () => {
    if (!newAgendaItem.trim()) return;
    const updated = [...agenda, newAgendaItem.trim()];
    setAgenda(updated);
    updateMeeting(eventId, { agenda: updated });
    setNewAgendaItem('');
  };

  const handleAddDecision = () => {
    if (!newDecision.trim()) return;
    const updated = [...decisions, newDecision.trim()];
    setDecisions(updated);
    updateMeeting(eventId, { decisions: updated });
    setNewDecision('');
  };

  const handleSaveOutcomes = () => {
    updateMeeting(eventId, {
      minutes,
      status: 'COMPLETED'
    });
    setSuccessMsg('Meeting minutes and decisions saved successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDeployActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !actionAssignee) return;

    addTask({
      title: `[Action Item] ${actionTitle.trim()}`,
      description: `Action item spun off from meeting "${eventItem.title}" on ${new Date(eventItem.startsAt).toLocaleDateString()}.`,
      assigneeIds: [actionAssignee],
      reviewerId: eventItem.ownerId,
      teamId: eventItem.teamId,
      status: TaskStatus.TODO,
      priority: actionPriority,
      dueDate: actionDueDate || new Date().toISOString().split('T')[0],
      subtasks: [],
      dependencies: [],
      attachments: []
    });

    setSuccessMsg(`Action task deployed successfully to ${users.find(u => u.id === actionAssignee)?.displayName}!`);
    setActionTitle('');
    setActionAssignee('');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6EFEA] flex items-center justify-center text-[#1A4331]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-[#1A4331]">{eventItem.title}</h3>
              <p className="text-xs text-emerald-950/60 font-mono">Outcomes, Minutes & Action Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white hover:bg-[#1A4331]/10 text-emerald-950/60 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success / Alert Banners */}
        {successMsg && (
          <div className="bg-[#E6EFEA] text-[#1A4331] px-6 py-2.5 text-xs font-bold border-b border-[#1A4331]/10 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Agenda, Attendance, and Minutes */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Agenda Editor */}
            <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4331] mb-3 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4" /> Agenda Topics
              </h4>
              <div className="space-y-1.5 mb-3 max-h-[120px] overflow-y-auto">
                {agenda.length === 0 ? (
                  <p className="text-xs text-emerald-950/40 italic">No topics specified yet.</p>
                ) : (
                  agenda.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-emerald-950/80 bg-[#FAF6EE] px-3 py-1.5 rounded-lg border border-[#FAF6EE]">
                      <span className="font-bold text-[#1A4331]">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new agenda topic..."
                  value={newAgendaItem}
                  onChange={(e) => setNewAgendaItem(e.target.value)}
                  className="flex-1 p-2 bg-[#FAF6EE] text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                />
                <button
                  onClick={handleAddAgenda}
                  className="bg-[#1A4331] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#255C44] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Attendance Matrix */}
            <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4331] mb-3 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Attendance Register
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                {activeMembers.map(member => {
                  const status = meetingItem.attendance[member.id] || AttendanceStatus.UNKNOWN;
                  return (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF6EE] border border-[#EBE2D4]">
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-emerald-950/90 truncate max-w-[100px]">{member.displayName}</span>
                      </div>
                      <select
                        value={status}
                        onChange={(e) => recordMeetingAttendance(eventId, member.id, e.target.value as AttendanceStatus)}
                        className="text-[10px] bg-white border border-[#EBE2D4] rounded-lg p-1 text-[#1A4331] font-medium"
                      >
                        <option value={AttendanceStatus.UNKNOWN}>Unknown</option>
                        <option value={AttendanceStatus.PRESENT}>Present</option>
                        <option value={AttendanceStatus.ABSENT}>Absent</option>
                        <option value={AttendanceStatus.EXCUSED}>Excused</option>
                        <option value={AttendanceStatus.LATE}>Late</option>
                        <option value={AttendanceStatus.REMOTE}>Remote</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Minutes & Summaries */}
            <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4331] mb-2 flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Discussion Minutes
              </h4>
              <textarea
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="Draft notes here. Support markdown or plain-text summaries of discussions, arguments, and follow-ups."
                rows={4}
                className="w-full p-3 text-xs bg-[#FAF6EE] border border-[#EBE2D4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1A4331] resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] text-emerald-950/40">Status: {meetingItem.status}</span>
                <button
                  onClick={handleSaveOutcomes}
                  className="bg-[#1A4331] hover:bg-[#255C44] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Discussion Notes
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Decisions & Deploy Tasks */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Decisions List */}
            <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4331] mb-3">
                🔑 Key Decisions Taken
              </h4>
              <div className="space-y-1.5 mb-3 max-h-[110px] overflow-y-auto">
                {decisions.length === 0 ? (
                  <p className="text-xs text-emerald-950/40 italic">No formal decisions recorded yet.</p>
                ) : (
                  decisions.map((decision, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-emerald-950/80 bg-[#E6EFEA]/30 p-2 rounded-lg border border-[#1A4331]/5">
                      <span className="font-bold text-[#1A4331]">✓</span>
                      <span>{decision}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add key decision..."
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  className="flex-1 p-2 bg-[#FAF6EE] text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                />
                <button
                  onClick={handleAddDecision}
                  className="bg-[#1A4331] text-white p-2 rounded-xl hover:bg-[#255C44] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Item Deployer - matches Section 6.7 requirements */}
            <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col gap-1 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4331]">
                  🚀 Spin-off Action Items
                </h4>
                <p className="text-[10px] text-emerald-950/50">Convert meeting outcomes directly into tracked tasks.</p>
              </div>

              <form onSubmit={handleDeployActionItem} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">TASK TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Write deployment shell script"
                    value={actionTitle}
                    onChange={(e) => setActionTitle(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6EE] text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#1A4331] mb-1">ASSIGNEE</label>
                    <select
                      required
                      value={actionAssignee}
                      onChange={(e) => setActionAssignee(e.target.value)}
                      className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331] text-emerald-950/80"
                    >
                      <option value="">Select Member</option>
                      {activeMembers.map(u => (
                        <option key={u.id} value={u.id}>{u.displayName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#1A4331] mb-1">PRIORITY</label>
                    <select
                      value={actionPriority}
                      onChange={(e) => setActionPriority(e.target.value as TaskPriority)}
                      className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331] text-emerald-950/80"
                    >
                      <option value={TaskPriority.CRITICAL}>Critical</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.LOW}>Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DUE DATE</label>
                  <input
                    type="date"
                    required
                    value={actionDueDate}
                    onChange={(e) => setActionDueDate(e.target.value)}
                    className="w-full p-2 bg-[#FAF6EE] text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1A4331] hover:bg-[#255C44] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  Deploy Task to Board <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
