// Story status types
export type StoryStatus = 'backlog' | 'in_progress' | 'testing' | 'done' | 'failed'

// Session status types
export type SessionStatus = 'idle' | 'running' | 'paused' | 'completed'

// Story interface
export interface Story {
  id: string
  title: string
  description: string
  acceptanceCriteria: string[]
  status: StoryStatus
  passes: boolean
  iteration: number | null
  startedAt: string | null
  completedAt: string | null
  filesChanged: string[]
  notes: string
}

// PRD interface
export interface Prd {
  title: string
  createdAt: string
  stories: Story[]
}

// Session interface
export interface Session {
  id: string
  status: SessionStatus
  currentIteration: number
  maxIterations: number
  startedAt: string | null
  lastUpdated: string | null
}

// Progress entry for parsed log
export interface ProgressEntry {
  iteration: number
  timestamp: string
  storyId: string
  storyTitle: string
  status: 'STARTED' | 'COMPLETED' | 'FAILED'
  logLines: string[]
  filesChanged: string[]
  learnings: string[]
}

// Settings interface
export interface Settings {
  apiKey: string
  projectPath: string
  maxIterations: number
}

// Toast notification
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
