import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings, Toast } from '@/types'

interface SettingsState {
  settings: Settings
  toasts: Toast[]
  settingsOpen: boolean

  // Actions
  setApiKey: (apiKey: string) => void
  setProjectPath: (path: string) => void
  setMaxIterations: (max: number) => void
  setSettings: (settings: Partial<Settings>) => void
  setSettingsOpen: (open: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const defaultSettings: Settings = {
  apiKey: '',
  projectPath: '',
  maxIterations: 10,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      toasts: [],
      settingsOpen: false,

      setApiKey: (apiKey) => set((state) => ({
        settings: { ...state.settings, apiKey },
      })),

      setProjectPath: (projectPath) => set((state) => ({
        settings: { ...state.settings, projectPath },
      })),

      setMaxIterations: (maxIterations) => set((state) => ({
        settings: { ...state.settings, maxIterations },
      })),

      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
      })),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }),
    {
      name: 'ralph-kanban-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
