import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { Heart, CheckCircle2, Sparkles, ToggleLeft, ToggleRight, ArrowUpRight } from 'lucide-react';

export default function RsvpVotingWidget() {
  const { users } = useApp();
  const [votingEnabled, setVotingEnabled] = useState(true);

  // Filter active users to render inside the voting grid (e.g., Mau, Clara, Marcelo, Hiroshi, Samantha)
  const voters = users.filter(u => u.status === 'Active' && u.id !== 'user-deactivated');

  // Maintain separate slider state for each voter (represented as probability to attend the upcoming dinner)
  const [probabilities, setProbabilities] = useState<Record<string, number>>({
    'user-alex': 95,
    'user-mau': 85,
    'user-clara': 70,
    'user-marcelo': 33,
    'user-samantha': 90,
    'user-hiroshi': 15,
    'user-aria': 60
  });

  const handleSliderChange = (userId: string, val: number) => {
    setProbabilities(prev => ({
      ...prev,
      [userId]: val
    }));
  };

  // Compute collective overlap percentage
  let total = 0;
  Object.keys(probabilities).forEach(key => {
    total += probabilities[key] || 0;
  });
  const averageOverlap = Math.round(total / Object.keys(probabilities).length);

  return (
    <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm flex flex-col h-full justify-between">
      <div>
        {/* Toggle Header - matches "With easy voting" switch in the video */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FAF6EE] mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#1A4331]" />
            <h3 className="text-sm font-display font-bold text-[#1A4331]">Consensus Overlap Engine</h3>
          </div>
          <button
            onClick={() => setVotingEnabled(!votingEnabled)}
            className="flex items-center gap-1.5 text-xs text-[#1A4331] font-semibold cursor-pointer select-none"
          >
            <span>With easy voting</span>
            {votingEnabled ? (
              <ToggleRight className="h-8 w-8 text-[#1A4331]" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-emerald-950/20" />
            )}
          </button>
        </div>

        {/* Dinner Card Header */}
        <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#EBE2D4] mb-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-[#E6EFEA] px-2 py-0.5 rounded-full text-[9px] font-bold text-[#1A4331] uppercase tracking-wider flex items-center gap-1">
            Social Event
          </div>
          <h4 className="text-xs font-bold text-[#1A4331]">Friday Dinner & Core Team Social</h4>
          <p className="text-[10px] text-emerald-950/60 mt-0.5">Estimated attendance overlap by probability index.</p>

          {/* Dynamic overlap circle shown in the video */}
          <div className="flex items-center justify-between mt-3 bg-white/80 p-2.5 rounded-xl border border-dashed border-[#1A4331]/10">
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-[#1A4331]">{averageOverlap}%</span>
              <span className="text-[10px] font-medium text-emerald-950/70">Attendance Overlap</span>
            </div>
            {averageOverlap >= 70 ? (
              <span className="text-[10px] text-[#2B5F4A] font-bold flex items-center gap-1 bg-[#E6EFEA] px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" /> Consensus OK
              </span>
            ) : (
              <span className="text-[10px] text-[#854D0E] font-bold flex items-center gap-1 bg-[#FEF9C3] px-2.5 py-0.5 rounded-full">
                Needs Boost
              </span>
            )}
          </div>
        </div>

        {/* Voters sliders column */}
        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
          {voters.map(user => {
            const prob = probabilities[user.id] || 0;
            return (
              <div key={user.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-[#EBE2D4]"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#1E2E24]">{user.displayName}</span>
                      <span className="text-[9px] text-emerald-950/50">{user.role}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold font-mono ${prob > 75 ? 'text-[#1A4331]' : prob > 40 ? 'text-[#854D0E]' : 'text-[#E15B3A]'}`}>
                    {prob}%
                  </span>
                </div>

                {/* Slider bar - disabled if voting is toggled off */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={!votingEnabled}
                    value={prob}
                    onChange={(e) => handleSliderChange(user.id, parseInt(e.target.value))}
                    className="w-full accent-[#1A4331] h-1 bg-[#FAF6EE] rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#FAF6EE]">
        <div className="text-[10px] font-medium text-emerald-950/60 flex items-center gap-1 justify-center bg-[#FAF6EE] py-2 rounded-xl">
          <ArrowUpRight className="h-3 w-3 text-[#1A4331]" />
          <span>Interactive consensus engine simulates real-time RSVP weights.</span>
        </div>
      </div>
    </div>
  );
}
