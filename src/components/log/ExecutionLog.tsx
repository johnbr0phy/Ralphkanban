import { useState, useEffect, useRef } from 'react'
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useSessionStore } from '@/stores/sessionStore'
import { parseProgressFile, formatTimestamp } from '@/lib/fileParser'

export function ExecutionLog() {
  const { progressContent } = useSessionStore()
  const [autoScroll, setAutoScroll] = useState(true)
  const [expandedIterations, setExpandedIterations] = useState<Set<number>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  const entries = parseProgressFile(progressContent)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [progressContent, autoScroll])

  const toggleIteration = (iteration: number) => {
    const newSet = new Set(expandedIterations)
    if (newSet.has(iteration)) {
      newSet.delete(iteration)
    } else {
      newSet.add(iteration)
    }
    setExpandedIterations(newSet)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Execution Log
        </CardTitle>
        <Button
          variant={autoScroll ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
          className="text-xs h-7"
        >
          Auto-scroll {autoScroll ? 'ON' : 'OFF'}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4" ref={scrollRef}>
          {entries.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No execution log yet</p>
              <p className="text-xs mt-1">Run the Ralph prompt in Claude Code to start</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.iteration} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleIteration(entry.iteration)}
                    className="w-full p-3 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        #{entry.iteration}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {entry.storyTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          entry.status === 'COMPLETED' ? 'done' :
                          entry.status === 'FAILED' ? 'failed' : 'in_progress'
                        }
                        className="text-xs"
                      >
                        {entry.status}
                      </Badge>
                      {expandedIterations.has(entry.iteration) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {expandedIterations.has(entry.iteration) && (
                    <div className="p-3 border-t space-y-2 text-xs">
                      {entry.timestamp && (
                        <p className="text-muted-foreground">
                          Started: {formatTimestamp(entry.timestamp)}
                        </p>
                      )}

                      {entry.logLines.length > 0 && (
                        <div className="font-mono bg-muted rounded p-2 space-y-1">
                          {entry.logLines.map((line, i) => (
                            <p key={i} className="text-muted-foreground">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}

                      {entry.filesChanged.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Files Changed:</p>
                          <ul className="space-y-0.5">
                            {entry.filesChanged.map((file, i) => (
                              <li key={i} className="font-mono text-blue-600">
                                {file}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.learnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="font-medium mb-1">Learnings:</p>
                          <ul className="space-y-1">
                            {entry.learnings.map((learning, i) => (
                              <li key={i}>• {learning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
