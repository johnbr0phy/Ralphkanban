import { useState, useCallback } from 'react'
import { Upload, FileText, Copy, ClipboardPaste, ArrowRight, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { usePrdStore } from '@/stores/prdStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { generateId } from '@/lib/utils'
import type { Story, Prd } from '@/types'

const PRD_CONVERSION_PROMPT = `You convert product requirement documents into structured user stories.

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
        "Specific, testable criterion",
        "Another criterion"
      ]
    }
  ]
}

## Rules
1. Small stories: Each completable in ONE Claude Code iteration (15-30 min)
2. Ordered by dependency: Foundation/setup stories first
3. Testable criteria: An AI must be able to verify each criterion
4. 3-8 stories typical: Break large features into atomic pieces
5. No vague criteria: Bad: "Works well". Good: "Returns 200 status"

## PRD to convert:

`

type Step = 'input' | 'paste-response' | 'done'

export function PrdPanel() {
  const { rawPrdText, setRawPrdText, setPrd, setError, prd } = usePrdStore()
  const { addToast } = useSettingsStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [jsonResponse, setJsonResponse] = useState('')

  const handleCopyPrompt = async () => {
    if (!rawPrdText.trim()) {
      addToast({ message: 'Please enter a PRD first', type: 'error' })
      return
    }

    const fullPrompt = PRD_CONVERSION_PROMPT + rawPrdText
    try {
      await navigator.clipboard.writeText(fullPrompt)
      addToast({ message: 'Prompt copied! Paste it in claude.ai', type: 'success' })
      setStep('paste-response')
    } catch {
      addToast({ message: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const handleParseResponse = () => {
    if (!jsonResponse.trim()) {
      addToast({ message: 'Please paste the JSON response from Claude', type: 'error' })
      return
    }

    try {
      // Try to extract JSON from response (handle markdown code blocks)
      let jsonStr = jsonResponse
      const jsonMatch = jsonResponse.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1]
      }

      const parsed = JSON.parse(jsonStr.trim())

      // Transform to full Story objects
      const stories: Story[] = parsed.stories.map((s: { id?: string; title: string; description: string; acceptanceCriteria: string[] }) => ({
        id: s.id || generateId(),
        title: s.title,
        description: s.description,
        acceptanceCriteria: s.acceptanceCriteria,
        status: 'backlog' as const,
        passes: false,
        iteration: null,
        startedAt: null,
        completedAt: null,
        filesChanged: [],
        notes: '',
      }))

      const prdData: Prd = {
        title: parsed.title,
        createdAt: new Date().toISOString(),
        stories,
      }

      setPrd(prdData)
      setStep('done')
      addToast({ message: `Created ${stories.length} stories`, type: 'success' })
    } catch {
      setError('Failed to parse JSON. Make sure you copied the complete response.')
      addToast({ message: 'Failed to parse JSON response', type: 'error' })
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setRawPrdText(text)
      }
      reader.readAsText(file)
    }
  }, [setRawPrdText])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleReset = () => {
    setPrd(null as never)
    setRawPrdText('')
    setJsonResponse('')
    setStep('input')
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          PRD Input
          {step !== 'done' && !prd && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              Step {step === 'input' ? '1' : '2'} of 2
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {step === 'input' && !prd && (
          <>
            <div
              className={`flex-1 relative ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Textarea
                value={rawPrdText}
                onChange={(e) => setRawPrdText(e.target.value)}
                placeholder="Paste your PRD here or drag & drop a .md/.txt file..."
                className="h-full resize-none text-sm"
              />
              {isDragOver && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-md">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Upload className="h-5 w-5" />
                    Drop file here
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleCopyPrompt}
              disabled={!rawPrdText.trim()}
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt for Claude
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Uses your Claude MAX subscription - no API key needed
            </p>
          </>
        )}

        {step === 'paste-response' && !prd && (
          <>
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <p className="font-medium mb-1">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>Open <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">claude.ai</a></li>
                <li>Paste the copied prompt</li>
                <li>Copy Claude's JSON response</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <div className="flex-1 relative">
              <Textarea
                value={jsonResponse}
                onChange={(e) => setJsonResponse(e.target.value)}
                placeholder={'Paste Claude\'s JSON response here...\n\n{\n  "title": "...",\n  "stories": [...]\n}'}
                className="h-full resize-none text-sm font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleParseResponse}
                disabled={!jsonResponse.trim()}
                className="flex-1"
              >
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Parse Stories
              </Button>
            </div>
          </>
        )}

        {prd && (
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{prd.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {prd.stories.length} stories
                </span>
              </div>
              <div className="space-y-2">
                {prd.stories.map((story, index) => (
                  <div key={story.id} className="text-sm p-2 bg-muted rounded-md">
                    <div className="font-medium">{index + 1}. {story.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {story.acceptanceCriteria.length} criteria
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full"
              >
                Start Over
              </Button>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
