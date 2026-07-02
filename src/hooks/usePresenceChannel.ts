import { useEffect, useRef, useCallback, useState } from 'react';
import { PresenceMember, PresenceEvent, PresenceScope } from '../types';

interface UsePresenceChannelOptions {
  scope: PresenceScope;
  onEvent: (event: PresenceEvent) => void;
}

export function usePresenceChannel({ scope, onEvent }: UsePresenceChannelOptions) {
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEventRef = useRef(onEvent);

  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    // Simulated WebSocket connection — in production this would be a real WebSocket.
    // For now we receive events from AppContext's simulated presence engine
    // via event callbacks, not through a real socket.
    setConnectionState('connected');
    reconnectAttemptRef.current = 0;

    // Heartbeat simulation
    heartbeatRef.current = setInterval(() => {
      // In production: ws.send(JSON.stringify({ type: 'heartbeat', timestamp: ... }))
    }, 25000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connect]);

  const simulateReconnect = useCallback(() => {
    setConnectionState('disconnected');
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 30000);
    reconnectAttemptRef.current = attempt + 1;

    reconnectTimerRef.current = setTimeout(() => {
      setConnectionState('connected');
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = setInterval(() => {}, 25000);
    }, delay);
  }, []);

  return { connectionState, simulateReconnect };
}