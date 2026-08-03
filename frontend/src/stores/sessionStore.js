import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  removeSession: (id) => set((state) => ({ 
    sessions: state.sessions.filter(s => s.id !== id) 
  })),
  setLoading: (loading) => set({ loading })
}));
