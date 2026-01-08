import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSettingsStore } from '@/stores/settingsStore'

export function SettingsDialog() {
  const { settings, setSettings, settingsOpen, setSettingsOpen, addToast } = useSettingsStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleOpen = () => {
    setLocalSettings(settings)
  }

  const handleSave = () => {
    setSettings(localSettings)
    setSettingsOpen(false)
    addToast({ message: 'Settings saved', type: 'success' })
  }

  return (
    <Dialog open={settingsOpen} onOpenChange={(open) => {
      if (open) handleOpen()
      setSettingsOpen(open)
    }}>
      <DialogContent onClose={() => setSettingsOpen(false)}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Path</label>
            <Input
              value={localSettings.projectPath}
              onChange={(e) => setLocalSettings({ ...localSettings, projectPath: e.target.value })}
              placeholder="/path/to/your/project"
            />
            <p className="text-xs text-muted-foreground">
              Base URL or path where .ralph/ files will be read from.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Iterations</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={50}
                value={localSettings.maxIterations}
                onChange={(e) => setLocalSettings({ ...localSettings, maxIterations: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="w-8 text-center font-mono">{localSettings.maxIterations}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
