import { useEffect, useRef } from 'react'
import { usePrdStore } from '@/stores/prdStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { parsePrdFile, parseSessionFile } from '@/lib/fileParser'

const POLL_INTERVAL = 2000 // 2 seconds

/**
 * Hook to poll .ralph/ files for changes
 * Note: This uses fetch to request files - in a real implementation,
 * you would need a local file server or use the File System Access API
 */
export function useFileWatcher() {
  const { setPrd } = usePrdStore()
  const { setSession, setProgressContent } = useSessionStore()
  const { settings } = useSettingsStore()
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const projectPath = settings.projectPath

    if (!projectPath) {
      return
    }

    const pollFiles = async () => {
      try {
        // Poll prd.json
        const prdResponse = await fetch(`${projectPath}/.ralph/prd.json`)
        if (prdResponse.ok) {
          const prdContent = await prdResponse.text()
          const prd = parsePrdFile(prdContent)
          if (prd) {
            setPrd(prd)
          }
        }
      } catch {
        // File might not exist yet
      }

      try {
        // Poll session.json
        const sessionResponse = await fetch(`${projectPath}/.ralph/session.json`)
        if (sessionResponse.ok) {
          const sessionContent = await sessionResponse.text()
          const session = parseSessionFile(sessionContent)
          if (session) {
            setSession(session)
          }
        }
      } catch {
        // File might not exist yet
      }

      try {
        // Poll progress.txt
        const progressResponse = await fetch(`${projectPath}/.ralph/progress.txt`)
        if (progressResponse.ok) {
          const progressContent = await progressResponse.text()
          setProgressContent(progressContent)
        }
      } catch {
        // File might not exist yet
      }
    }

    // Initial poll
    pollFiles()

    // Set up interval
    intervalRef.current = window.setInterval(pollFiles, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [settings.projectPath, setPrd, setSession, setProgressContent])
}
