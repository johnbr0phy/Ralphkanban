import { create } from 'zustand'
import type { Prd, Story, StoryStatus } from '@/types'

interface PrdState {
  prd: Prd | null
  rawPrdText: string
  isConverting: boolean
  error: string | null

  // Actions
  setRawPrdText: (text: string) => void
  setPrd: (prd: Prd) => void
  setIsConverting: (converting: boolean) => void
  setError: (error: string | null) => void
  updateStoryStatus: (storyId: string, status: StoryStatus) => void
  updateStory: (storyId: string, updates: Partial<Story>) => void
  reset: () => void
}

const initialState = {
  prd: null,
  rawPrdText: '',
  isConverting: false,
  error: null,
}

export const usePrdStore = create<PrdState>((set) => ({
  ...initialState,

  setRawPrdText: (text) => set({ rawPrdText: text }),

  setPrd: (prd) => set({ prd, error: null }),

  setIsConverting: (converting) => set({ isConverting: converting }),

  setError: (error) => set({ error }),

  updateStoryStatus: (storyId, status) => set((state) => {
    if (!state.prd) return state
    return {
      prd: {
        ...state.prd,
        stories: state.prd.stories.map((story) =>
          story.id === storyId ? { ...story, status } : story
        ),
      },
    }
  }),

  updateStory: (storyId, updates) => set((state) => {
    if (!state.prd) return state
    return {
      prd: {
        ...state.prd,
        stories: state.prd.stories.map((story) =>
          story.id === storyId ? { ...story, ...updates } : story
        ),
      },
    }
  }),

  reset: () => set(initialState),
}))
