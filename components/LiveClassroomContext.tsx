import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';

type ClassroomState = {
  sessionId: string | null;
  joinCode: string | null;
  busy: boolean;
  error: string | null;
  start: () => Promise<void>;
  join: (code: string) => Promise<void>;
  leave: () => Promise<void>;
  end: () => Promise<void>;
};
const Context = createContext<ClassroomState | null>(null);

export const LiveClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uid = user?.uid || '';

  const request = useCallback(async (action: string, params: Record<string, string> = {}) => {
    if (!user) throw new Error('Sign in required');
    const response = await fetch('/api/live-classroom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + await user.getIdToken()
      },
      body: JSON.stringify({ action, ...params })
    });
    const value = await response.json();
    if (!response.ok) throw new Error(value.error || 'Classroom unavailable');
    return value as { sessionId?: string; code?: string; ok?: boolean };
  }, [user]);

  // Resume only the current account's *server-verified* membership.
  useEffect(() => {
    setSessionId(null);
    setJoinCode(null);
    setError(null);
    if (!uid) return;
    const storedId = localStorage.getItem('qul_classroom_' + uid);
    if (!storedId) return;
    let canceled = false;
    setBusy(true);
    void request('resume', { sessionId: storedId })
      .then(data => {
        if (!canceled && data.sessionId) {
          setSessionId(data.sessionId);
          setJoinCode(data.code || null);
        }
      })
      .catch(() => {
        localStorage.removeItem('qul_classroom_' + uid);
      })
      .finally(() => { if (!canceled) setBusy(false); });
    return () => { canceled = true; };
  }, [uid, request]);

  const launch = useCallback(async (action: 'start' | 'join', extra: Record<string, string> = {}) => {
    if (!uid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await request(action, extra);
      if (!data.sessionId) throw Error('Session unavailable');
      setSessionId(data.sessionId);
      setJoinCode(data.code || null);
      localStorage.setItem('qul_classroom_' + uid, data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classroom unavailable');
    } finally {
      setBusy(false);
    }
  }, [uid, busy, request]);

  const exit = useCallback(async (action: 'leave' | 'end') => {
    if (!sessionId || !uid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await request(action, { sessionId });
      localStorage.removeItem('qul_classroom_' + uid);
      setSessionId(null);
      setJoinCode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classroom unavailable');
    } finally {
      setBusy(false);
    }
  }, [sessionId, uid, busy, request]);

  const value = useMemo<ClassroomState>(() => ({
    sessionId, joinCode, busy, error,
    start: () => launch('start'),
    join: (code: string) => launch('join', { code }),
    leave: () => exit('leave'),
    end: () => exit('end')
  }), [sessionId, joinCode, busy, error, launch, exit]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
export function useLiveClassroom() {
  const state = useContext(Context);
  if (!state) throw Error('LiveClassroomProvider missing');
  return state;
}
