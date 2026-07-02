import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Event, EventType, MemberRole } from '../types';
import MeetingOutcomesModal from './MeetingOutcomesModal';
import { Calendar as CalendarIcon, Clock, MapPin, Globe, Plus, ChevronLeft, ChevronRight, Check, X, AlertTriangle, MessageSquareCode } from 'lucide-react';

interface CalendarTabProps {
  selectedEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
}

export default function CalendarTab({ selectedEventId, onSelectEvent }: CalendarTabProps) {
  const {
    events,
    currentSimulatedUser,
    addEvent,
    rsvpEvent,
    deleteEvent,
    teams
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Fixed around July 1, 2026 as per metadata
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Event Creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>(EventType.GENERAL);
  const [startsAt, setStartsAt] = useState('2026-07-01T10:00');
  const [endsAt, setEndsAt] = useState('2026-07-01T11:00');
  const [location, setLocation] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [teamId, setTeamId] = useState('');
  const [color, setColor] = useState('#1A4331');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Meeting outcomes sub-trigger
  const [showOutcomesId, setShowOutcomesId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Parse days of the current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyPrefixCells = Array.from({ length: firstDayIndex }, (_, i) => null);
  const calendarCells = [...emptyPrefixCells, ...daysArray];

  // Helper date conversions
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Event validation / conflict check (Section 7.1 & 6.3 Calendar Conflict Rules)
  const handleScheduleEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (new Date(startsAt) >= new Date(endsAt)) {
      setErrorMessage('Event end time must be strictly after the start time.');
      return;
    }

    // Check for overlapping meetings (Section 6.3 Conflict Rules)
    const overlaps = events.some(ev => {
      if (ev.isCancelled) return false;
      const startCheck = new Date(startsAt) < new Date(ev.endsAt);
      const endCheck = new Date(endsAt) > new Date(ev.startsAt);
      return startCheck && endCheck;
    });

    if (overlaps && type === EventType.MEETING) {
      setErrorMessage('Conflict alert: Another meeting or event overlaps in this timeslot for core members.');
    }

    addEvent({
      title,
      description,
      type,
      startsAt,
      endsAt,
      location,
      onlineUrl,
      teamId: teamId || null,
      color
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setLocation('');
    setOnlineUrl('');
    setTeamId('');
    setShowCreateModal(false);
  };

  // Filter events based on selections
  const filteredEvents = events.filter(e => {
    if (e.isCancelled) return false;
    const matchesCategory = categoryFilter === 'all' || e.type === categoryFilter;
    const matchesTeam = teamFilter === 'all' || e.teamId === teamFilter;
    return matchesCategory && matchesTeam;
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
      {/* Filters & Actions Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Create Action Button - RBAC protected */}
        {currentSimulatedUser.role !== MemberRole.SOCIETY_MEMBER && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-[#1A4331] hover:bg-[#255C44] text-white py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Plus className="h-4 w-4" /> Create New Event
          </button>
        )}

        {/* Filters Panel */}
        <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#1A4331] uppercase tracking-wider">Filter Calendar</h3>
          
          <div>
            <label className="block text-[10px] font-bold text-emerald-950/60 uppercase tracking-wider mb-1.5">Domain Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2.5 bg-[#FAF6EE] border border-[#EBE2D4] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A4331]"
            >
              <option value="all">All Categories</option>
              {Object.values(EventType).map(typeOpt => (
                <option key={typeOpt} value={typeOpt}>{typeOpt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-emerald-950/60 uppercase tracking-wider mb-1.5">Team Scope</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full p-2.5 bg-[#FAF6EE] border border-[#EBE2D4] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1A4331]"
            >
              <option value="all">All Committees</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend Panel */}
        <div className="bg-white border border-[#EBE2D4] rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#1A4331] uppercase tracking-wider mb-2.5">Event Type Color Scheme</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-950/80">
              <span className="w-3 h-3 rounded-full bg-[#1A4331]" />
              <span>Official Meeting</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-950/80">
              <span className="w-3 h-3 rounded-full bg-[#E15B3A]" />
              <span>Recruitment/Orientation</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-950/80">
              <span className="w-3 h-3 rounded-full bg-[#4C1D95]" />
              <span>Social Activity</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Calendar Grid */}
      <div className="lg:col-span-9 bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm">
        
        {/* Calendar Navigation Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#FAF6EE] mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#1A4331] cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-display font-bold text-[#1A4331]">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#1A4331] cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-1.5 bg-[#FAF6EE] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'month' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60 hover:text-emerald-950'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                viewMode === 'week' ? 'bg-[#1A4331] text-white shadow' : 'text-emerald-950/60 hover:text-emerald-950'
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>

        {/* View Mode Router */}
        {viewMode === 'month' ? (
          <div>
            {/* Days of week titles */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <span key={day} className="text-[10px] font-bold uppercase tracking-wider text-emerald-950/40">
                  {day}
                </span>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((dayNum, index) => {
                if (dayNum === null) {
                  return <div key={`empty-${index}`} className="aspect-square bg-[#FAF6EE]/20 rounded-xl" />;
                }

                // Check if any events fall on this day
                const currentDayISOString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = filteredEvents.filter(e => e.startsAt.startsWith(currentDayISOString));

                return (
                  <div
                    key={`day-${dayNum}`}
                    className="aspect-square bg-[#FAF6EE]/50 border border-[#FAF6EE] hover:border-[#1A4331]/10 rounded-2xl p-1.5 flex flex-col justify-between overflow-hidden relative group transition-all"
                  >
                    <span className="text-xs font-mono font-bold text-emerald-950/60">{dayNum}</span>
                    
                    {/* Render mini dots for events */}
                    <div className="space-y-1 overflow-hidden max-h-[70%]">
                      {dayEvents.map(ev => (
                        <button
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(ev.id);
                          }}
                          className="w-full text-left truncate text-[9px] px-1.5 py-0.5 rounded font-bold text-white block cursor-pointer"
                          style={{ backgroundColor: ev.color }}
                        >
                          {ev.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Agenda list view */
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-xs text-emerald-950/40 py-12">No active events matching the current filters.</p>
            ) : (
              [...filteredEvents]
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                .map(event => {
                  const evDate = new Date(event.startsAt);
                  return (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent(event.id)}
                      className="p-4 bg-[#FAF6EE]/40 border border-[#EBE2D4] hover:border-[#1A4331]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-3 h-12 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-[#1A4331] font-display">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#1E2E24]/60 mt-1 font-medium">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {evDate.toLocaleDateString()} {evDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            {event.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action trigger button */}
                      <button
                        onClick={() => onSelectEvent(event.id)}
                        className="text-xs bg-white border border-[#EBE2D4] hover:border-[#1A4331] text-[#1A4331] px-4 py-1.5 rounded-xl font-bold cursor-pointer transition-all self-start sm:self-center"
                      >
                        Details
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        )}

      </div>

      {/* EVENT DETAILS & RSVP MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedEvent.color }} />
                <h3 className="text-base font-display font-bold text-[#1A4331]">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => onSelectEvent(null)}
                className="p-1 rounded-full hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-emerald-950/80 leading-relaxed">{selectedEvent.description}</p>
              
              <div className="space-y-2.5 pt-3 border-t border-[#EBE2D4] text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-[#1A4331]" />
                  <span className="font-medium text-emerald-950/70">
                    {new Date(selectedEvent.startsAt).toLocaleString()} - {new Date(selectedEvent.endsAt).toLocaleTimeString()}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-[#1A4331]" />
                    <span className="font-medium text-emerald-950/70">{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.onlineUrl && (
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 text-[#1A4331]" />
                    <a
                      href={selectedEvent.onlineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1A4331] hover:underline font-bold"
                    >
                      Join Virtual Room
                    </a>
                  </div>
                )}
              </div>

              {/* RSVP status section (Section 6.3) */}
              <div className="pt-4 border-t border-[#EBE2D4]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A4331] mb-2.5">RSVP Status Indicator</h4>
                <div className="flex items-center gap-1.5 mb-3">
                  {['ACCEPTED', 'TENTATIVE', 'DECLINED'].map(status => {
                    const count = Object.values(selectedEvent.rsvps).filter(s => s === status).length;
                    return (
                      <span key={status} className="text-[10px] bg-white border border-[#EBE2D4] px-2.5 py-1 rounded-full font-bold text-emerald-950/80">
                        {status}: {count}
                      </span>
                    );
                  })}
                </div>

                {/* Simulated user's RSVP trigger */}
                <div className="p-4 bg-white rounded-2xl border border-[#EBE2D4] flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold text-emerald-950/60">Update Your Personal RSVP:</span>
                  <div className="flex gap-1.5">
                    {['ACCEPTED', 'TENTATIVE', 'DECLINED'].map(rsvpVal => {
                      const isActive = selectedEvent.rsvps[currentSimulatedUser.id] === rsvpVal;
                      return (
                        <button
                          key={rsvpVal}
                          onClick={() => rsvpEvent(selectedEvent.id, currentSimulatedUser.id, rsvpVal as any)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#1A4331] text-white shadow'
                              : 'bg-[#FAF6EE] border border-[#EBE2D4] text-[#1A4331] hover:bg-[#E6EFEA]'
                          }`}
                        >
                          {rsvpVal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Trigger for Meetings */}
              {selectedEvent.type === EventType.MEETING && (
                <div className="pt-4 border-t border-[#EBE2D4]">
                  <button
                    onClick={() => {
                      setShowOutcomesId(selectedEvent.id);
                      onSelectEvent(null);
                    }}
                    className="w-full bg-[#E6EFEA] hover:bg-[#d8e6de] text-[#1A4331] border border-[#2B5F4A]/10 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <MessageSquareCode className="h-4 w-4" /> Open Minutes & Action Items Tracker
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER MEETINGS OUTCOME WORKSPACE TRIGGER */}
      {showOutcomesId && (
        <MeetingOutcomesModal
          eventId={showOutcomesId}
          onClose={() => setShowOutcomesId(null)}
        />
      )}

      {/* EVENT SCHEDULER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#EBE2D4] flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-[#1A4331]">Schedule ACM Society Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-black/5 text-emerald-950/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Warning Banner */}
            {errorMessage && (
              <div className="bg-rose-50 text-rose-900 border-b border-rose-100 px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#E15B3A]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleScheduleEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">EVENT TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM Competitive Coding Bootcamp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1">DESCRIPTION</label>
                <textarea
                  required
                  placeholder="Draft details or orientation objectives here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4] focus:ring-1 focus:ring-[#1A4331] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">TYPE</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  >
                    {Object.values(EventType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">TEAM SCOPE</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  >
                    <option value="">General (No Committee Restriction)</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">STARTS AT</label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">ENDS AT</label>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">PHYSICAL LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 4, Block C"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#1A4331] mb-1">VIRTUAL ROOM URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://meet.google.com/..."
                    value={onlineUrl}
                    onChange={(e) => setOnlineUrl(e.target.value)}
                    className="w-full p-2 bg-white text-xs rounded-xl focus:outline-none border border-[#EBE2D4]"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-[10px] font-bold text-[#1A4331] mb-1.5">COLOR CATEGORY</label>
                <div className="flex gap-2">
                  {['#1A4331', '#E15B3A', '#4C1D95', '#D97706', '#2563EB'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-all border border-white"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="h-4 w-4 text-white" />}
                    </button>
                  ))}
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
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
