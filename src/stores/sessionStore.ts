import { create } from 'zustand'
import type { Session, SessionStatus } from '@/types'

interface SessionState {
  session: Session
  progressContent: string

  // Actions
  setSession: (session: Session) => void
  updateSessionStatus: (status: SessionStatus) => void
  incrementIteration: () => void
  setProgressContent: (content: string) => void
  reset: () => void
}

const defaultSession: Session = {
  id: '',
  status: 'idle',
  currentIteration: 0,
  maxIterations: 10,
  startedAt: null,
  lastUpdated: null,
}

export const useSessionStore = create<SessionState>((set) => ({
  session: defaultSession,
  progressContent: '',

  setSession: (session) => set({ session }),

  updateSessionStatus: (status) => set((state) => ({
    session: {
      ...state.session,
      status,
      lastUpdated: new Date().toISOString(),
    },
  })),

  incrementIteration: () => set((state) => ({
    session: {
      ...state.session,
      currentIteration: state.session.currentIteration + 1,
      lastUpdated: new Date().toISOString(),
    },
  })),

  setProgressContent: (content) => set({ progressContent: content }),

  reset: () => set({ session: defaultSession, progressContent: '' }),
}))
