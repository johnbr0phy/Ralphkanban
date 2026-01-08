import { useState } from 'react'
import { ChevronDown, ChevronUp, FileCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Story } from '@/types'

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusVariant = story.status as 'backlog' | 'in_progress' | 'testing' | 'done' | 'failed'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        story.status === 'in_progress' && 'ring-2 ring-blue-400 animate-pulse'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight">{story.title}</h4>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={statusVariant} className="text-xs">
            {story.status.replace('_', ' ')}
          </Badge>
          {story.iteration && (
            <span className="text-xs text-muted-foreground">
              Iter #{story.iteration}
            </span>
          )}
        </div>

        {expanded && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">{story.description}</p>

            <div>
              <p className="text-xs font-medium mb-1">Acceptance Criteria:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {story.acceptanceCriteria.map((criterion, i) => (
                  <li key={i} className="flex gap-1">
                    <span>•</span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {story.filesChanged.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                  <FileCode className="h-3 w-3" />
                  Files Changed:
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {story.filesChanged.map((file, i) => (
                    <li key={i} className="font-mono truncate">{file}</li>
                  ))}
                </ul>
              </div>
            )}

            {story.notes && (
              <div className="text-xs bg-muted p-2 rounded">
                <span className="font-medium">Notes: </span>
                {story.notes}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
