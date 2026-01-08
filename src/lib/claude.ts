import type { Prd, Story } from '@/types'
import { generateId } from '@/lib/utils'

const PRD_CONVERSION_PROMPT = `You convert product requirement documents into structured user stories for the Ralph autonomous agent system.

## Input
A product requirements document, feature brief, or description of what to build.

## Output
Return ONLY valid JSON (no markdown, no explanation):

{
  "title": "Feature name",
  "stories": [
    {
      "id": "story-1",
      "title": "Short action-oriented title",
      "description": "As a [user], I want [goal] so that [benefit]",
      "acceptanceCriteria": [
        "Specific, testable criterion that an AI can verify",
        "Another criterion"
      ]
    }
  ]
}

## Rules
1. **Small stories**: Each story completable in ONE Claude Code iteration (15-30 min of work)
2. **Ordered by dependency**: Foundation/setup stories first
3. **Testable criteria**: An AI must be able to verify each criterion without human input
4. **3-8 stories typical**: Break large features into atomic pieces
5. **No vague criteria**: Bad: "Works well". Good: "Returns 200 status with user object"

## Examples of Good Acceptance Criteria
- "Database table 'tasks' has 'priority' column with default 'medium'"
- "GET /api/tasks returns array with priority field"
- "Dropdown shows options: Low, Medium, High"
- "Selecting priority updates task via PATCH request"
- "Priority persists after page reload"

## Examples of Bad Acceptance Criteria
- "Priority feature works" (not specific)
- "User can set priority" (how to verify?)
- "Looks good" (subjective)`

export async function convertPrdToStories(prdText: string, apiKey: string): Promise<Prd> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: PRD_CONVERSION_PROMPT,
      messages: [
        {
          role: 'user',
          content: prdText,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content[0]?.text

  if (!content) {
    throw new Error('No response from Claude API')
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonStr = content
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  }

  let parsed: { title: string; stories: Array<{ id: string; title: string; description: string; acceptanceCriteria: string[] }> }
  try {
    parsed = JSON.parse(jsonStr.trim())
  } catch {
    throw new Error('Failed to parse stories from response. Please try again.')
  }

  // Transform to full Story objects
  const stories: Story[] = parsed.stories.map((s) => ({
    id: s.id || generateId(),
    title: s.title,
    description: s.description,
    acceptanceCriteria: s.acceptanceCriteria,
    status: 'backlog',
    passes: false,
    iteration: null,
    startedAt: null,
    completedAt: null,
    filesChanged: [],
    notes: '',
  }))

  return {
    title: parsed.title,
    createdAt: new Date().toISOString(),
    stories,
  }
}
