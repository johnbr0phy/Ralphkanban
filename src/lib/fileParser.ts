import type { ProgressEntry, Prd, Session } from '@/types'

/**
 * Parse progress.txt content into structured entries
 */
export function parseProgressFile(content: string): ProgressEntry[] {
  if (!content.trim()) return []

  const entries: ProgressEntry[] = []
  const iterationBlocks = content.split(/(?==== ITERATION \d+ ===)/)

  for (const block of iterationBlocks) {
    if (!block.trim()) continue

    const iterationMatch = block.match(/=== ITERATION (\d+) ===/)
    if (!iterationMatch) continue

    const iteration = parseInt(iterationMatch[1], 10)

    // Extract timestamp
    const timestampMatch = block.match(/Timestamp:\s*(.+)/)
    const timestamp = timestampMatch ? timestampMatch[1].trim() : ''

    // Extract story info
    const storyMatch = block.match(/Story:\s*(\S+)\s*-\s*(.+)/)
    const storyId = storyMatch ? storyMatch[1].trim() : ''
    const storyTitle = storyMatch ? storyMatch[2].trim() : ''

    // Extract status
    const statusMatch = block.match(/Status:\s*(STARTED|COMPLETED|FAILED)/i)
    const status = (statusMatch ? statusMatch[1].toUpperCase() : 'STARTED') as 'STARTED' | 'COMPLETED' | 'FAILED'

    // Extract log lines (lines starting with timestamps like [10:30:15])
    const logLines = block.match(/\[\d{2}:\d{2}:\d{2}\].*/g) || []

    // Extract files changed
    const filesSection = block.match(/Files Changed:\s*([\s\S]*?)(?=\n\n|Learnings:|$)/)
    const filesChanged: string[] = []
    if (filesSection) {
      const fileMatches = filesSection[1].match(/-\s*([^\n]+)/g)
      if (fileMatches) {
        fileMatches.forEach((m) => {
          const path = m.replace(/^-\s*/, '').split(/\s+\(/)[0].trim()
          if (path) filesChanged.push(path)
        })
      }
    }

    // Extract learnings
    const learningsSection = block.match(/Learnings:\s*([\s\S]*?)(?=\n---|$)/)
    const learnings: string[] = []
    if (learningsSection) {
      const learningMatches = learningsSection[1].match(/-\s*([^\n]+)/g)
      if (learningMatches) {
        learningMatches.forEach((m) => {
          learnings.push(m.replace(/^-\s*/, '').trim())
        })
      }
    }

    entries.push({
      iteration,
      timestamp,
      storyId,
      storyTitle,
      status,
      logLines,
      filesChanged,
      learnings,
    })
  }

  return entries
}

/**
 * Parse prd.json content
 */
export function parsePrdFile(content: string): Prd | null {
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Parse session.json content
 */
export function parseSessionFile(content: string): Session | null {
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return timestamp
  }
}
