import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Users, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useResponsiveOrbit } from '../hooks/useResponsiveOrbit';
import { PresenceMember, PresenceScope } from '../types';

const TWO_PI = Math.PI * 2;

interface LivePresenceOrbitProps {
  scope: PresenceScope;
  maxVisibleDesktop?: number;
  maxVisibleTablet?: number;
  maxVisibleMobile?: number;
  durationSeconds?: number;
  direction?: 'clockwise' | 'counterclockwise';
  showJoinNotifications?: boolean;
  onMemberClick?: (member: PresenceMember) => void;
}

const OrbitAvatar = React.memo(function OrbitAvatar({
  member,
  size,
  onMemberClick,
  setAvatarRef,
}: {
  member: PresenceMember;
  size: number;
  onMemberClick?: (member: PresenceMember) => void;
  setAvatarRef: (memberId: string, node: HTMLDivElement | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isOnline = member.status === 'ONLINE' || member.status === 'JUST_JOINED';
  const isAway = member.status === 'AWAY';

  return (
    <motion.div
      ref={(node) => setAvatarRef(member.id, node)}
      className="absolute left-0 top-0"
      style={{
        width: size,
        height: size,
        transform: 'translate3d(0, 0, 0) scale(0.9)',
        willChange: 'transform, opacity, filter',
      }}
      initial={member.status === 'JUST_JOINED' ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      exit={{ opacity: 0, scale: 0.5, filter: 'blur(8px)', transition: { duration: 0.45 } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        type="button"
        onClick={() => onMemberClick?.(member)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 1.04 }}
        className="relative h-full w-full cursor-pointer rounded-full p-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-2"
        style={{
          boxShadow: isAway
            ? '0 4px 16px rgba(26,26,26,0.08)'
            : '0 4px 24px rgba(26,26,26,0.16), 0 0 0 3px rgba(255,255,255,0.35)',
        }}
        aria-label={`${member.name} - ${isOnline ? 'Online' : 'Away'}`}
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-bold text-white">
            {member.initials}
          </span>
        )}

        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-emerald-500' : 'bg-amber-400'
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute left-1/2 top-full z-[100] mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-[#1a1a1a] px-3 py-2 text-xs text-white shadow-lg pointer-events-none"
          >
            <p className="font-bold">{member.name}</p>
            {member.role && <p className="text-[10px] text-white/60">{member.role}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const OnlineCounter = React.memo(function OnlineCounter({
  count,
  centerSize,
}: {
  count: number;
  centerSize: number;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 select-none flex-col items-center justify-center rounded-full border border-black/8 bg-white/80 shadow-lg backdrop-blur-md"
      style={{ width: centerSize, height: centerSize }}
    >
      <motion.span
        key={count}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold leading-none text-[#1a1a1a]"
      >
        {count}
      </motion.span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-black/40">
        Online now
      </span>
    </div>
  );
});

const JoinNotification = React.memo(function JoinNotification({
  members,
  onDismiss,
}: {
  members: string[];
  onDismiss: () => void;
}) {
  const label =
    members.length === 1
      ? `${members[0]} joined just now`
      : members.length === 2
        ? `${members[0]} and ${members[1]} joined`
        : `${members[0]}, ${members[1]} and ${members.length - 2} others joined`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: -20 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={() => window.setTimeout(onDismiss, 2200)}
      className="absolute -top-2 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1a1a1a] px-4 py-1.5 text-xs text-white shadow-lg pointer-events-none"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      <span>{label}</span>
      <span className="text-emerald-400">OK</span>
    </motion.div>
  );
});

const OverflowAvatar = React.memo(function OverflowAvatar({
  overflow,
  size,
  onClick,
}: {
  overflow: number;
  size: number;
  onClick: () => void;
}) {
  if (overflow <= 0) return null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      className="absolute bottom-4 right-4 z-[80] flex cursor-pointer items-center justify-center rounded-full border-2 border-white/30 bg-[#1a1a1a] font-bold text-white shadow-lg hover:shadow-xl"
      style={{ width: size + 4, height: size + 4, fontSize: `${Math.max(11, size * 0.16)}px` }}
      aria-label={`${overflow} more members online`}
    >
      +{overflow}
    </motion.button>
  );
});

export default function LivePresenceOrbit({
  scope,
  maxVisibleDesktop = 8,
  maxVisibleTablet = 6,
  maxVisibleMobile = 5,
  durationSeconds = 10,
  direction = 'clockwise',
  showJoinNotifications = true,
  onMemberClick,
}: LivePresenceOrbitProps) {
  const { onlineMembers, joinNotifications, dismissJoinNotification, currentSimulatedUser } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const orbitAngles = useRef<Map<string, number>>(new Map());
  const clockStartRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const responsive = useResponsiveOrbit(containerRef);
  const [showOverflow, setShowOverflow] = useState(false);

  const effectiveMax =
    responsive.maxVisible === 8
      ? maxVisibleDesktop
      : responsive.maxVisible === 6
        ? maxVisibleTablet
        : maxVisibleMobile;

  const orbitParams = useMemo(
    () => ({
      stageWidth: responsive.radiusX * 2 + responsive.avatarSize + 36,
      stageHeight: responsive.radiusY * 2 + responsive.avatarSize + 36,
      centerX: responsive.radiusX + responsive.avatarSize / 2 + 18,
      centerY: responsive.radiusY + responsive.avatarSize / 2 + 18,
      radiusX: responsive.radiusX,
      radiusY: responsive.radiusY,
      durationMs: Math.max(1000, durationSeconds * 1000),
    }),
    [durationSeconds, responsive]
  );

  const membersArray = useMemo(() => {
    const arr: PresenceMember[] = Array.from(onlineMembers.values());
    return arr.filter(member => member.id !== currentSimulatedUser.id || arr.length > 1);
  }, [currentSimulatedUser.id, onlineMembers]);

  const visibleCount = Math.min(membersArray.length, effectiveMax);
  const overflow = Math.max(0, membersArray.length - effectiveMax);
  const orbitingMembers = useMemo(() => membersArray.slice(0, visibleCount), [membersArray, visibleCount]);
  const visibleIdsKey = useMemo(() => orbitingMembers.map(member => member.id).join('|'), [orbitingMembers]);

  const setAvatarRef = useCallback((memberId: string, node: HTMLDivElement | null) => {
    if (node) {
      avatarRefs.current.set(memberId, node);
    } else {
      avatarRefs.current.delete(memberId);
    }
  }, []);

  useEffect(() => {
    const angles = orbitAngles.current;

    Array.from(angles.keys()).forEach(id => {
      if (!membersArray.some(member => member.id === id)) {
        angles.delete(id);
      }
    });

    orbitingMembers.forEach((member, index) => {
      if (angles.has(member.id)) return;

      const existingAngles = orbitingMembers
        .map(existing => angles.get(existing.id))
        .filter((angle): angle is number => typeof angle === 'number')
        .sort((a, b) => a - b);

      if (existingAngles.length < 2) {
        angles.set(member.id, (index / Math.max(orbitingMembers.length, 1)) * TWO_PI - Math.PI / 2);
        return;
      }

      let largestGap = 0;
      let targetAngle = existingAngles[0];

      for (let i = 0; i < existingAngles.length; i += 1) {
        const start = existingAngles[i];
        const end = existingAngles[(i + 1) % existingAngles.length] + (i === existingAngles.length - 1 ? TWO_PI : 0);
        const gap = end - start;
        if (gap > largestGap) {
          largestGap = gap;
          targetAngle = (start + gap / 2) % TWO_PI;
        }
      }

      angles.set(member.id, targetAngle);
    });
  }, [membersArray, orbitingMembers]);

  useEffect(() => {
    let rafId: number | null = null;
    let active = true;
    const directionFactor = direction === 'clockwise' ? 1 : -1;

    const renderFrame = (timestamp: number) => {
      if (!active) return;
      if (clockStartRef.current === null) clockStartRef.current = timestamp;

      const elapsed = reducedMotion ? 0 : timestamp - clockStartRef.current;
      const globalAngle = ((elapsed / orbitParams.durationMs) * TWO_PI * directionFactor) % TWO_PI;

      orbitingMembers.forEach((member, index) => {
        const node = avatarRefs.current.get(member.id);
        if (!node) return;

        const baseAngle =
          orbitAngles.current.get(member.id) ??
          (index / Math.max(orbitingMembers.length, 1)) * TWO_PI;
        const angle = baseAngle + globalAngle;
        const depth = (Math.sin(angle) + 1) / 2;
        const scale = 0.76 + depth * 0.42;
        const awayModifier = member.status === 'AWAY' ? 0.78 : 1;
        const opacity = (0.68 + depth * 0.32) * awayModifier;
        const blur = reducedMotion ? 0 : Math.max(0, (1 - depth) * 2.4);
        const zIndex = depth > 0.55 ? 60 : depth > 0.45 ? 35 : 15;
        const bob = reducedMotion ? 0 : Math.sin(timestamp / 900 + index) * 2;
        const x = orbitParams.centerX + orbitParams.radiusX * Math.cos(angle) - responsive.avatarSize / 2;
        const y = orbitParams.centerY + orbitParams.radiusY * Math.sin(angle) - responsive.avatarSize / 2 + bob;

        node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        node.style.opacity = `${opacity}`;
        node.style.filter = `blur(${blur}px)`;
        node.style.zIndex = String(zIndex);
      });

      if (!reducedMotion) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      active = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [direction, orbitParams, orbitingMembers, reducedMotion, responsive.avatarSize, visibleIdsKey]);

  const latestJoin = joinNotifications.length > 0 ? joinNotifications[0] : null;
  const isLoading = onlineMembers.size === 0;

  return (
    <div
      ref={containerRef}
      className="relative flex w-full select-none flex-col items-center justify-center overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm"
      style={{ minHeight: `${orbitParams.stageHeight + 72}px` }}
    >
      <AnimatePresence>
        {showJoinNotifications && latestJoin && (
          <JoinNotification
            key={latestJoin.id}
            members={latestJoin.members}
            onDismiss={() => dismissJoinNotification(latestJoin.id)}
          />
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
          <p className="text-xs text-black/40">Loading presence...</p>
        </div>
      )}

      {!isLoading && membersArray.length === 0 && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
          <Users className="mb-3 h-10 w-10 text-black/20" />
          <p className="font-display text-lg font-bold text-[#1a1a1a]">You're the first one here</p>
          <p className="mt-1 text-xs text-black/40">Invite your team or start planning.</p>
        </div>
      )}

      <div
        className="relative mx-auto"
        style={{ width: orbitParams.stageWidth, height: orbitParams.stageHeight, maxWidth: '100%' }}
        aria-label={`${onlineMembers.size} members online`}
      >
        <AnimatePresence>
          {orbitingMembers.map(member => (
            <OrbitAvatar
              key={member.id}
              member={member}
              size={responsive.avatarSize}
              onMemberClick={onMemberClick}
              setAvatarRef={setAvatarRef}
            />
          ))}
        </AnimatePresence>

        <OnlineCounter count={onlineMembers.size} centerSize={responsive.centerSize} />
      </div>

      {overflow > 0 && (
        <OverflowAvatar
          overflow={overflow}
          size={responsive.avatarSize * 0.6}
          onClick={() => setShowOverflow(true)}
        />
      )}

      {!isLoading && onlineMembers.size > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-widest text-black/30">
          {scope.type === 'organization' ? 'Organization' : scope.type === 'team' ? 'Team' : 'Meeting'} Presence
        </div>
      )}

      <AnimatePresence>
        {showOverflow && (
          <motion.div
            className="absolute inset-0 z-[120] flex flex-col bg-white/95 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-3">
              <div>
                <h3 className="font-display text-sm font-bold text-[#1a1a1a]">Online members</h3>
                <p className="text-[10px] uppercase tracking-widest text-black/40">{onlineMembers.size} active now</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOverflow(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 hover:bg-black/5"
                aria-label="Close online members"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-black/8 bg-black/[0.03] px-3 py-2 text-black/40">
              <Search className="h-4 w-4" />
              <span className="text-xs">Search is available in the full members directory.</span>
            </div>

            <div className="mt-3 space-y-2 overflow-y-auto pr-1">
              {membersArray.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onMemberClick?.(member)}
                  className="flex w-full items-center gap-3 rounded-lg border border-black/8 p-2 text-left hover:bg-black/[0.03]"
                >
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-bold text-white">
                      {member.initials}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-[#1a1a1a]">{member.name}</span>
                    <span className="block truncate text-[10px] text-black/45">{member.role || 'ACM member'}</span>
                  </span>
                  <span
                    className={`ml-auto h-2.5 w-2.5 rounded-full ${
                      member.status === 'AWAY' ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
