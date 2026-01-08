import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/settingsStore'
import { SettingsDialog } from '@/components/controls/SettingsDialog'

export function Header() {
  const { setSettingsOpen } = useSettingsStore()

  return (
    <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Ralph Kanban Visualizer</h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Local
        </span>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
        <Settings className="h-5 w-5" />
      </Button>
      <SettingsDialog />
    </header>
  )
}
