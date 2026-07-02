import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { MemberRole } from '../types';
import { UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

export default function FloatingAvatarCircle() {
  const { users, currentSimulatedUser, setSimulatedUserById } = useApp();
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Filter out deactivated users
  const activeUsers = users.filter(u => u.status === 'Active');
  const count = activeUsers.length;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-[#EBE2D4] rounded-3xl shadow-sm relative overflow-hidden h-[340px]">
      {/* Absolute top badge - matches the "Marcelo has joined" alert in the video */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="absolute top-4 bg-[#E6EFEA] border border-[#2B5F4A]/10 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm text-[#1A4331] font-medium"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B7A57] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A4331]"></span>
        </span>
        <Sparkles className="h-3.5 w-3.5 text-[#1A4331]" />
        <span>{currentSimulatedUser.displayName} has joined the workspace</span>
        <UserCheck className="h-4 w-4 text-[#1A4331]" />
      </motion.div>

      {/* Floating avatars in a responsive circle */}
      <div className="relative w-52 h-52 flex items-center justify-center mt-6">
        {/* Central Counter Ring */}
        <div className="w-24 h-24 rounded-full bg-[#FAF6EE] border-4 border-white flex flex-col items-center justify-center shadow-inner z-10">
          <span className="text-4xl font-display font-bold text-[#1A4331]">{count}</span>
          <span className="text-[10px] uppercase tracking-wider text-emerald-950/60 font-semibold">Active</span>
        </div>

        {/* Orbiting Members */}
        {activeUsers.map((user, index) => {
          // Calculate polar coordinates for perfect placement in the ring
          const angle = (index * 2 * Math.PI) / count;
          const radius = 80; // Distance from center in px
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const isCurrent = user.id === currentSimulatedUser.id;

          return (
            <div
              key={user.id}
              className="absolute z-20"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              onMouseEnter={() => setHoveredUser(user.id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <motion.button
                onClick={() => setSimulatedUserById(user.id)}
                whileHover={{ scale: 1.2, zIndex: 30 }}
                className={`relative w-12 h-12 rounded-full p-0.5 cursor-pointer transition-all ${
                  isCurrent
                    ? 'ring-4 ring-[#1A4331] shadow-md scale-110'
                    : 'ring-2 ring-white/80 hover:ring-[#E2A850]'
                }`}
                aria-label={`Switch to ${user.displayName}`}
              >
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
                
                {/* Active user badge indicator */}
                {isCurrent && (
                  <span className="absolute -bottom-1 -right-1 bg-[#1A4331] text-white p-0.5 rounded-full text-[8px] font-bold">
                    ME
                  </span>
                )}
              </motion.button>

              {/* Hover Tooltip Details */}
              {hoveredUser === user.id && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#1A4331] text-white text-xs rounded-xl p-3 shadow-lg z-50 w-44 pointer-events-none border border-white/10">
                  <p className="font-bold font-display">{user.displayName}</p>
                  <p className="text-[10px] text-emerald-200/80 font-mono mt-0.5">{user.role}</p>
                  <div className="border-t border-emerald-800 my-1"></div>
                  <div className="flex justify-between text-[9px] text-[#FCFAF4]/70 mt-1">
                    <span>Year: {user.academicYear}</span>
                    <span className="text-[#E2A850]">Click to Simulate</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip text at bottom */}
      <p className="text-xs text-emerald-950/60 font-medium text-center mt-4">
        Click on any member avatar to switch roles and see the system through their perspective.
      </p>
    </div>
  );
}
