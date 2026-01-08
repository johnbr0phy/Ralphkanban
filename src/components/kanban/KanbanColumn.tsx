import { ScrollArea } from '@/components/ui/ScrollArea'
import { Badge } from '@/components/ui/Badge'
import { StoryCard } from './StoryCard'
import type { Story, StoryStatus } from '@/types'

interface KanbanColumnProps {
  title: string
  status: StoryStatus
  stories: Story[]
}

export function KanbanColumn({ title, stories }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[240px] flex flex-col bg-muted/50 rounded-lg">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {stories.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-2">
        {stories.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No stories
          </p>
        ) : (
          <div className="space-y-2">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
