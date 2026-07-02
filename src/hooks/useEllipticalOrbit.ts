import { useRef, useEffect, useCallback } from 'react';

export interface OrbitParams {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  durationMs: number;
}

export function useEllipticalOrbit(params: OrbitParams) {
  const clockRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const getPosition = useCallback(
    (memberAngle: number): { x: number; y: number; depth: number; zIndex: number } => {
      const globalClock = clockRef.current;
      const angle = (memberAngle + globalClock) % (Math.PI * 2);
      const x = params.centerX + params.radiusX * Math.cos(angle);
      const y = params.centerY + params.radiusY * Math.sin(angle);
      const depth = (Math.sin(angle) + 1) / 2;
      const zIndex = depth > 0.55 ? 50 : depth > 0.45 ? 30 : 10;
      return { x, y, depth, zIndex };
    },
    [params]
  );

  useEffect(() => {
    let running = true;
    const tick = (timestamp: number) => {
      if (!running) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      clockRef.current =
        (clockRef.current + (delta / params.durationMs) * Math.PI * 2) % (Math.PI * 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [params.durationMs]);

  const currentClock = () => clockRef.current;

  return { getPosition, currentClock };
}