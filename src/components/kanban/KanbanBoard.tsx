import { usePrdStore } from '@/stores/prdStore'
import { useFileWatcher } from '@/hooks/useFileWatcher'
import { KanbanColumn } from './KanbanColumn'
import type { StoryStatus } from '@/types'

const COLUMNS: { status: StoryStatus; title: string }[] = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'testing', title: 'Testing' },
  { status: 'done', title: 'Done' },
]

export function KanbanBoard() {
  const { prd } = usePrdStore()

  // Set up file watching for real-time updates
  useFileWatcher()

  const stories = prd?.stories || []

  return (
    <div className="h-full flex gap-4 overflow-x-auto p-1">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          stories={stories.filter((s) => s.status === column.status)}
        />
      ))}
    </div>
  )
}
