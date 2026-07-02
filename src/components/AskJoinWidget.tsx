import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';
import { MemberRole } from '../types';
import { Sparkles, X, Compass, ChevronRight, CheckCircle2, UserPlus } from 'lucide-react';

export default function AskJoinWidget() {
  const { currentSimulatedUser, teams, addTeamMember, checkPermission } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [motivation, setMotivation] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If user is already in all teams, they don't need to ask join
  const availableTeams = teams.filter(t => !currentSimulatedUser.teams.includes(t.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    // Simulate approval and addition to team
    addTeamMember(selectedTeamId, currentSimulatedUser.id);
    setIsSubmitted(true);
    setMotivation('');
    setSelectedTeamId('');

    // Close modal after brief success window
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Pill - matches bottom "+ Ask Join" bar in the video */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-full shadow-lg border border-[#EBE2D4] flex items-center gap-6 select-none max-w-md w-full sm:w-auto">
        <div className="flex items-center gap-2">
          {/* Compass Icon - animated spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full bg-[#E6EFEA] flex items-center justify-center text-[#1A4331]"
          >
            <Compass className="h-4.5 w-4.5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1A4331] font-display">ACM Society Portal</span>
            <span className="text-[10px] text-emerald-950/60 font-medium">Join teams & collaborate</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-[#1A4331] hover:bg-[#255C44] text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/10"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Ask Join
        </motion.button>
      </div>

      {/* Slide-Up Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#FAF6EE] text-[#1E2E24] border border-[#EBE2D4] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-[#1A4331]/10 text-emerald-950/60 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Header */}
              <div className="p-6 bg-white border-b border-[#EBE2D4] relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6EFEA] flex items-center justify-center text-[#1A4331]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#1A4331]">Apply to Join ACM Committees</h3>
                    <p className="text-xs text-emerald-950/60">Choose a specialization to build skills and society presence.</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <CheckCircle2 className="h-16 w-16 text-[#1A4331] animate-bounce mb-3" />
                    <h4 className="text-lg font-display font-bold text-[#1A4331]">Request Submitted & Auto-Approved</h4>
                    <p className="text-sm text-emerald-950/70 mt-1 max-w-sm">
                      Your request was successfully processed! You have been granted membership in the selected committee. Check your dashboard alerts.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User profile recap */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EBE2D4] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentSimulatedUser.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1A4331]">{currentSimulatedUser.displayName}</p>
                          <p className="text-[10px] text-emerald-950/60 font-mono">{currentSimulatedUser.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#E6EFEA] text-[#1A4331] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Verifying Profile
                      </span>
                    </div>

                    {/* Committee Selection */}
                    <div>
                      <label className="block text-xs font-bold text-[#1A4331] uppercase tracking-wider mb-2">
                        Select Targeted Committee
                      </label>
                      {availableTeams.length === 0 ? (
                        <div className="p-4 bg-[#E6EFEA] text-[#1A4331] rounded-2xl text-xs font-medium text-center border border-[#1A4331]/10">
                          You are already active in all available committees!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5">
                          {availableTeams.map(team => (
                            <button
                              key={team.id}
                              type="button"
                              onClick={() => setSelectedTeamId(team.id)}
                              className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                                selectedTeamId === team.id
                                  ? 'bg-[#E6EFEA] border-[#1A4331] ring-2 ring-[#1A4331]/20'
                                  : 'bg-white border-[#EBE2D4] hover:border-[#1A4331]/40'
                              }`}
                            >
                              <div>
                                <h4 className="text-sm font-bold text-[#1A4331] font-display">{team.name}</h4>
                                <p className="text-[11px] text-emerald-950/60 mt-0.5 line-clamp-1">{team.description}</p>
                              </div>
                              <ChevronRight className={`h-4 w-4 ${selectedTeamId === team.id ? 'text-[#1A4331]' : 'text-emerald-950/30'}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Motivation box */}
                    <div>
                      <label htmlFor="motivation" className="block text-xs font-bold text-[#1A4331] uppercase tracking-wider mb-2">
                        Contribution statement / statement of purpose
                      </label>
                      <textarea
                        id="motivation"
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        placeholder="Briefly share why you are interested in joining and how much time you can dedicate weekly."
                        required
                        rows={3}
                        className="w-full p-4 rounded-2xl bg-white border border-[#EBE2D4] focus:outline-none focus:ring-2 focus:ring-[#1A4331] text-xs resize-none"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2 border-t border-[#EBE2D4]">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-1/2 py-3 rounded-xl border border-[#EBE2D4] text-xs font-bold hover:bg-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedTeamId || availableTeams.length === 0}
                        className="w-1/2 py-3 rounded-xl bg-[#1A4331] hover:bg-[#255C44] disabled:bg-[#1A4331]/40 text-white text-xs font-bold cursor-pointer"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
