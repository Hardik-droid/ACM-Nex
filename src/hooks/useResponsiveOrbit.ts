import { useState, useEffect, useRef, RefObject } from 'react';

export interface ResponsiveOrbitConfig {
  radiusX: number;
  radiusY: number;
  avatarSize: number;
  maxVisible: number;
  centerSize: number;
}

const DESKTOP: ResponsiveOrbitConfig = {
  radiusX: 260,
  radiusY: 120,
  avatarSize: 72,
  maxVisible: 8,
  centerSize: 120,
};

const TABLET: ResponsiveOrbitConfig = {
  radiusX: 190,
  radiusY: 90,
  avatarSize: 56,
  maxVisible: 6,
  centerSize: 96,
};

const MOBILE: ResponsiveOrbitConfig = {
  radiusX: 140,
  radiusY: 70,
  avatarSize: 48,
  maxVisible: 5,
  centerSize: 80,
};

export function useResponsiveOrbit(containerRef: RefObject<HTMLElement | null>, customConfig?: Partial<ResponsiveOrbitConfig>): ResponsiveOrbitConfig {
  const [config, setConfig] = useState<ResponsiveOrbitConfig>(DESKTOP);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.clientWidth;
      if (Math.abs(w - lastWidthRef.current) < 20) return;
      lastWidthRef.current = w;

      let base: ResponsiveOrbitConfig;
      if (w < 640) base = MOBILE;
      else if (w < 1024) base = TABLET;
      else base = DESKTOP;

      const merged = customConfig ? { ...base, ...customConfig } : base;
      const scaleDown = Math.max(0.65, Math.min(1, w / 900));
      merged.radiusX = Math.round(merged.radiusX * scaleDown);
      merged.radiusY = Math.round(merged.radiusY * scaleDown);

      setConfig(merged);
    };

    compute();
    const observer = new ResizeObserver(() => compute());
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, customConfig]);

  return config;
}