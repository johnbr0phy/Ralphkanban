import { Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSessionStore } from '@/stores/sessionStore'
import { usePrdStore } from '@/stores/prdStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { getRalphPrompt } from '@/lib/ralphPrompt'

export function ControlBar() {
  const { session, reset: resetSession } = useSessionStore()
  const { prd, reset: resetPrd } = usePrdStore()
  const { settings, addToast } = useSettingsStore()

  const handleCopyPrompt = async () => {
    const prompt = getRalphPrompt(settings.projectPath, settings.maxIterations)
    try {
      await navigator.clipboard.writeText(prompt)
      addToast({ message: 'Ralph prompt copied to clipboard!', type: 'success' })
    } catch {
      addToast({ message: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const handleReset = () => {
    if (confirm('Reset session? This will clear all progress.')) {
      resetSession()
      resetPrd()
      addToast({ message: 'Session reset', type: 'info' })
    }
  }

  const statusColors = {
    idle: 'secondary',
    running: 'in_progress',
    paused: 'testing',
    completed: 'done',
  } as const

  return (
    <div className="border-b bg-background px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[session.status]}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
          {prd && (
            <span className="text-sm text-muted-foreground">
              Iteration {session.currentIteration} / {settings.maxIterations}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyPrompt}
          disabled={!prd}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Ralph Prompt
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={!prd}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}
