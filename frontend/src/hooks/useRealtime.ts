import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { DepartmentStats, AIAlert } from '../types';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io({ transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function useRealtimeQueues() {
  const [queues, setQueues] = useState<DepartmentStats[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onQueueUpdate = (data: DepartmentStats[]) => setQueues(data);
    const onAlerts = (data: AIAlert[]) => setAlerts(data);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('queue:update', onQueueUpdate);
    s.on('ai:predictions', onAlerts);

    if (s.connected) setConnected(true);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('queue:update', onQueueUpdate);
      s.off('ai:predictions', onAlerts);
    };
  }, []);

  return { queues, alerts, connected };
}

export function usePolling<T>(fetcher: () => Promise<T>, intervalMs = 10000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { data, loading, error, refresh };
}
