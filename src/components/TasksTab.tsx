import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Task, TaskStatus, TaskPriority, MemberRole } from '../types';
import { Plus, ListTodo, Kanban, ChevronRight, X, AlertCircle, CheckSquare, MessageSquare, Paperclip, User, Calendar, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';

interface TasksTabProps {
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

export default function TasksTab({ selectedTaskId, onSelectTask }: TasksTabProps) {
  const {
    tasks,
    users,
    teams,
    addTask,
    updateTask,
    deleteTask,
    addTaskComment,
    transitionTaskStatus,
    submitTaskReview,
    approveTask,
    requestTaskChanges,
    currentSimulatedUser,
    checkPermission
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create Task form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  // Comment state inside details
  const [commentText, setCommentText] = useState('');
  
  // Review flow inputs
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  // Attachment mock state
  const [mockFileName, setMockFileName] = useState('');

  // Handle task drag & drop simulation (clicking buttons to transition columns works perfectly in all browsers)
  const handleMoveTask = (taskId: string, currentStatus: TaskStatus, direction: 'forward' | 'backward') => {
    const statusOrder = [
      TaskStatus.BACKLOG,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      TaskStatus.DONE
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (targetIndex >= 0 && targetIndex < statusOrder.length) {
      transitionTaskStatus(taskId, statusOrder[targetIndex]);
    }
  };

  // Subtask completion toggling
  const handleToggleSubtask = (taskItem: Task, subtaskId: string) => {
    const updatedSubtasks = taskItem.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, isCompleted: !sub.isCompleted };
      }
      return sub;
    });
    updateTask(taskItem.id, { subtasks: updatedSubtasks });
  };

  // Add mock subtask
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const handleAddSubtask = (taskItem: Task) => {
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false
    };
    updateTask(taskItem.id, { subtasks: [...taskItem.subtasks, newSub] });
    setNewSubtaskTitle('');
  };

  // Submit Comments with Mentions check
  const handleSubmitComment = (taskId: string) => {
    if (!commentText.trim()) return;
    addTaskComment(taskId, commentText);
    setCommentText('');
  };

  // Simulated File Uploader
  const handleSimulateUpload = (taskItem: Task) => {
    if (!mockFileName.trim()) return;
    const newAtt = {
      id: `att-${Date.now()}`,
      name: mockFileName.trim(),
      url: '#',
      size: '245 KB'
    };
    updateTask(taskItem.id, { attachments: [...taskItem.attachments, newAtt] });
    setMockFileName('');
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesTeam = teamFilter === 'all' || t.teamId === teamFilter;
    return matchesSearch && matchesPriority && matchesTeam;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedAssignees.length === 0) return;

    addTask({
      title: title.trim(),
      description,
      assigneeIds: selectedAssignees,
      reviewerId: null,
      teamId: teamId || null,
      status: TaskStatus.TODO,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      subtasks: [],
      dependencies: []
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setSelectedAssignees([]);
    setPriority(TaskPriority.MEDIUM);
    setDueDate('');
    setTeamId('');
    setShowCreateForm(false);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Search & Toolbar Row */}
      <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Filters and Inputs */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 bg-[#FAF6EE] text-xs border border-[#EBE2D4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1A4331] w-full max-w-xs"
          />

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-2 bg-[#FAF6EE] border border-[#EBE2D4] rounded-xl text-xs text-emerald-950/80 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            {Object.values(TaskPriority).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="p-2 bg-[#FAF6EE] border border-[#EBE2D4] rounded-xl text-xs text-emerald-950/80 focus:outline-none"
          >
            <option value="all">All Committees</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* View toggles & Create Button */}
        <div className="flex items-center gap-3">
          <div className="bg-[#FAF6EE] p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60'
              }`}
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                viewMode === 'list' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60'
              }`}
            >
              <ListTodo className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#1A4331] hover:bg-[#255C44] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>

      </div>

      {/* RENDER TASKS */}
      {viewMode === 'kanban' ? (
        /* Kanban Layout */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {[
            TaskStatus.BACKLOG,
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.IN_REVIEW,
            TaskStatus.DONE
          ].map(statusCol => {
            const columnTasks = filteredTasks.filter(t => t.status === statusCol);
            return (
              <div key={statusCol} className="bg-[#FAF6EE]/50 border border-[#FAF6EE] p-3 rounded-2xl min-w-[200px] flex flex-col gap-3 min-h-[400px]">
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 border-b border-emerald-950/5">
                  <span className="text-[10px] font-bold text-emerald-950/50 uppercase tracking-widest">{statusCol}</span>
                  <span className="text-xs font-display font-bold text-[#1A4331] bg-white px-2 py-0.5 rounded-full shadow-sm">{columnTasks.length}</span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3.5">
                  {columnTasks.map(task => {
                    const isOverdue = task.status !== TaskStatus.DONE && task.dueDate < new Date().toISOString().split('T')[0];
                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className={`bg-white p-4 rounded-2xl border border-[#EBE2D4] shadow-sm hover:border-[#1A4331]/30 transition-all cursor-pointer space-y-3 relative group`}
                      >
                        {/* Priority Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            task.priority === TaskPriority.CRITICAL
                              ? 'bg-rose-100 text-rose-700'
                              : task.priority === TaskPriority.HIGH
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {task.priority}
                          </span>
                          
                          {/* Column controllers */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {statusCol !== TaskStatus.BACKLOG && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, task.status, 'backward');
                                }}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 p-0.5 rounded cursor-pointer"
                              >
                                ◀
                              </button>
                            )}
                            {statusCol !== TaskStatus.DONE && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveTask(task.id, task.status, 'forward');
                                }}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 p-0.5 rounded cursor-pointer"
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#1A4331] font-display line-clamp-2">{task.title}</h4>
                          <p className="text-[10px] text-emerald-950/60 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                        </div>

                        {/* Bottom Metadata row */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#FAF6EE] text-[10px] text-emerald-950/40">
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#E15B3A] font-bold' : ''}`}>
                            <Calendar className="h-3.5 w-3.5" /> {task.dueDate}
                          </span>
                          <div className="flex items-center gap-2">
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" /> {task.comments.length}</span>
                            )}
                            {task.subtasks.length > 0 && (
                              <span className="flex items-center gap-0.5">
                                <CheckSquare className="h-3 w-3" />{' '}
                                {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <div className="bg-white border border-[#EBE2D4] rounded-3xl overflow-hidden shadow-sm">
          {filteredTasks.length === 0 ? (
            <p className="p-12 text-center text-xs text-emerald-950/40">No active tasks specified.</p>
          ) : (
            <div className="divide-y divide-[#EBE2D4]">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className="p-4 hover:bg-[#FAF6EE]/50 flex items-center justify-between gap-4 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      task.status === TaskStatus.DONE
                        ? 'bg-[#E6EFEA] text-[#1A4331]'
                        : 'bg-[#FAF6EE] border border-[#EBE2D4] text-emerald-950/80'
                    }`}>
                      {task.status}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A4331]">{task.title}</h4>
                      <p className="text-[10px] text-emerald-950/60 mt-0.5 line-clamp-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[10px] bg-amber-50 text-[#854D0E] font-bold px-2 py-0.5 rounded-full">
                      {task.priority}
                    </span>
                    <span className="text-xs font-mono font-medium text-emerald-950/50">{task.dueDate}</span>
                    <ChevronRight className="h-4 w-4 text-emerald-950/30" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TASK DETAIL DRAWER MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <div>
                <span className="text-[9px] bg-[#E6EFEA] text-[#1A4331] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Task Identifier: {selectedTask.id}
                </span>
                <h3 className="text-base font-display font-bold text-[#1A4331] mt-1">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => onSelectTask(null)}
                className="p-1.5 rounded-full bg-white hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Description, Subtasks, Comments */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-widest mb-1.5">Description</h4>
                  <p className="text-xs leading-relaxed text-emerald-950/90 bg-white p-3.5 border border-[#EBE2D4] rounded-2xl shadow-inner">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Subtask Checklists (Section 6.4) */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-widest">Subtask Checklist</h4>
                  
                  {/* List of subtasks */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {selectedTask.subtasks.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleToggleSubtask(selectedTask, sub.id)}
                        className="w-full text-left p-2.5 bg-white hover:bg-emerald-50/20 border border-[#EBE2D4] rounded-xl flex items-center gap-2.5 cursor-pointer text-xs transition-all"
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={sub.isCompleted}
                          className="rounded text-[#1A4331] focus:ring-[#1A4331]"
                        />
                        <span className={sub.isCompleted ? 'line-through text-emerald-950/40' : 'text-emerald-950/90 font-medium'}>
                          {sub.title}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Add Subtask box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add subtask requirement..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 p-2 bg-white text-xs border border-[#EBE2D4] rounded-xl focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddSubtask(selectedTask)}
                      className="bg-[#1A4331] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#255C44] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Comments & Mention Section (Section 6.8) */}
                <div className="space-y-3 pt-4 border-t border-[#EBE2D4]">
                  <h4 className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-widest">Discussion Thread</h4>
                  
                  {/* Comments feed */}
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {selectedTask.comments.length === 0 ? (
                      <p className="text-[10px] text-center text-emerald-950/30 py-3 italic">No comments in this thread.</p>
                    ) : (
                      selectedTask.comments.map(comm => {
                        const commenter = users.find(u => u.id === comm.userId);
                        return (
                          <div key={comm.id} className="p-3 bg-white border border-[#EBE2D4] rounded-2xl space-y-1">
                            <div className="flex items-center gap-2">
                              <img
                                src={commenter?.avatar}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="text-[10px] font-bold text-[#1A4331]">{commenter?.displayName}</span>
                              <span className="text-[8px] text-emerald-950/40 font-mono">
                                {new Date(comm.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-950/85 pl-7">{comm.text}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Write comment with Mentions tips */}
                  <div className="space-y-1">
                    <textarea
                      placeholder="Leave a comment... use @mau or @marcelo to mention and alert teammates."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-xs bg-white border border-[#EBE2D4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1A4331] resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-emerald-950/40">Markdown formatting supported</span>
                      <button
                        onClick={() => handleSubmitComment(selectedTask.id)}
                        className="bg-[#1A4331] hover:bg-[#255C44] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Settings & Review Workflows */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Task Metadata details */}
                <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-950/50">Status:</span>
                    <span className="font-bold text-[#1A4331] font-mono">{selectedTask.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-950/50">Priority:</span>
                    <span className="font-bold text-amber-800">{selectedTask.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-950/50">Due Date:</span>
                    <span className="font-bold text-emerald-950/80">{selectedTask.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-950/50">Assignees:</span>
                    <div className="flex items-center gap-1">
                      {selectedTask.assigneeIds.map(uid => {
                        const userObj = users.find(u => u.id === uid);
                        return (
                          <img
                            key={uid}
                            src={userObj?.avatar}
                            alt={userObj?.displayName}
                            title={userObj?.displayName}
                            className="w-5 h-5 rounded-full object-cover border border-[#FAF6EE]"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Simulated File Attachments Upload (Section 6.9) */}
                <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm space-y-2.5">
                  <h4 className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-widest flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" /> Attachments ({selectedTask.attachments.length})
                  </h4>

                  {/* Attachment list */}
                  <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
                    {selectedTask.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-[#FAF6EE] border border-[#EBE2D4]">
                        <span className="font-mono text-emerald-950/80 truncate max-w-[140px]">{att.name}</span>
                        <span className="text-[10px] text-emerald-950/40 font-mono font-semibold">{att.size}</span>
                      </div>
                    ))}
                  </div>

                  {/* Add Mock Attachment */}
                  <div className="flex gap-1.5 pt-2">
                    <input
                      type="text"
                      placeholder="e.g. server-diagram.png"
                      value={mockFileName}
                      onChange={(e) => setMockFileName(e.target.value)}
                      className="flex-1 p-2 bg-[#FAF6EE] text-xs rounded-lg border border-[#EBE2D4] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSimulateUpload(selectedTask)}
                      className="bg-[#1A4331] hover:bg-[#255C44] text-white px-3 py-1 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                </div>

                {/* REVIEW & SIGN-OFF WORKFLOW (Section 6.4 & 5) */}
                <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-bold text-[#1A4331] uppercase tracking-widest">
                    Review & Verification Block
                  </h4>

                  {selectedTask.status === TaskStatus.TODO || selectedTask.status === TaskStatus.IN_PROGRESS ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-emerald-950/60 leading-relaxed">
                        Ready to submit your work for administrative sign-off? Select a reviewer below.
                      </p>
                      <div>
                        <label className="block text-[9px] font-bold text-[#1A4331] mb-1">SELECT REVIEWER</label>
                        <select
                          value={selectedReviewer}
                          onChange={(e) => setSelectedReviewer(e.target.value)}
                          className="w-full p-2 bg-[#FAF6EE] text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                        >
                          <option value="">Choose Leader</option>
                          {users
                            .filter(u => u.role === MemberRole.ACM_ADMIN || u.role === MemberRole.CORE_MEMBER || u.role === MemberRole.REVIEWER)
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                            ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          if (!selectedReviewer) return;
                          submitTaskReview(selectedTask.id, selectedReviewer);
                          setSelectedReviewer('');
                        }}
                        disabled={!selectedReviewer}
                        className="w-full py-2 bg-[#1A4331] hover:bg-[#255C44] disabled:bg-[#1A4331]/30 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Submit for Review
                      </button>
                    </div>
                  ) : selectedTask.status === TaskStatus.IN_REVIEW ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 p-2 bg-blue-50 border border-blue-100 rounded-xl">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-900">Task Currently in Review Queue</span>
                      </div>

                      {/* Review actions - restricted to Reviewers / Admins */}
                      {checkPermission('tasks.review') ? (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Approval or feedback notes..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={2}
                            className="w-full p-2 text-xs bg-[#FAF6EE] border border-[#EBE2D4] rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                approveTask(selectedTask.id, reviewNotes);
                                setReviewNotes('');
                                onSelectTask(null);
                              }}
                              className="w-1/2 py-2 bg-[#1A4331] hover:bg-[#255C44] text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Approve & Close
                            </button>
                            <button
                              onClick={() => {
                                if (!reviewNotes.trim()) return;
                                requestTaskChanges(selectedTask.id, reviewNotes);
                                setReviewNotes('');
                                onSelectTask(null);
                              }}
                              className="w-1/2 py-2 bg-[#E15B3A] hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-950/50 italic">
                          Awaiting review from assigned reviewer. Only Core Leads, Reviewers, or Admins can sign-off.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-[#E6EFEA] text-[#1A4331] rounded-2xl border border-[#2B5F4A]/10">
                      <CheckCircle2 className="h-5 w-5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Verification Passed</span>
                        <span className="text-[10px] text-emerald-950/60 font-medium">Task fully finalized & verified.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* CREATE TASK FORM MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#1A4331]">Draft ACM Society Task</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 rounded-full hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">TASK TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design contest anti-cheat daemon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DESCRIPTION</label>
                <textarea
                  placeholder="Detail the acceptance criteria and resource boundaries..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">PRIORITY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  >
                    {Object.values(TaskPriority).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">TEAM COMMITTEE</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  >
                    <option value="">General Work</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">ASSIGNEE</label>
                <select
                  required
                  multiple
                  value={selectedAssignees}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                    setSelectedAssignees(values);
                  }}
                  className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] h-24"
                >
                  {users.filter(u => u.status === 'Active').map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                  ))}
                </select>
                <span className="text-[9px] text-emerald-950/40 mt-1 block">Hold Cmd/Ctrl to select multiple assignees</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DUE DATE</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#EBE2D4]">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#EBE2D4] text-xs font-bold hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#1A4331] hover:bg-[#255C44] text-white text-xs font-bold cursor-pointer"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
