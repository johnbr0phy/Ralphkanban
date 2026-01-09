import { useState, useCallback } from 'react'
import { Upload, FileText, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { usePrdStore } from '@/stores/prdStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { convertPrdToStories } from '@/lib/claude'

export function PrdPanel() {
  const { rawPrdText, setRawPrdText, setPrd, isConverting, setIsConverting, error, setError, prd } = usePrdStore()
  const { settings, addToast } = useSettingsStore()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleConvert = async () => {
    if (!rawPrdText.trim()) {
      addToast({ message: 'Please enter a PRD first', type: 'error' })
      return
    }

    if (!settings.apiKey) {
      addToast({ message: 'Please set your API key in settings', type: 'error' })
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const result = await convertPrdToStories(rawPrdText, settings.apiKey)
      setPrd(result)
      addToast({ message: `Created ${result.stories.length} stories`, type: 'success' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to convert PRD'
      setError(message)
      addToast({ message, type: 'error' })
    } finally {
      setIsConverting(false)
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

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          PRD Input
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {!prd ? (
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              onClick={handleConvert}
              disabled={!rawPrdText.trim() || isConverting}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Converting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Convert to Stories
                </>
              )}
            </Button>
          </>
        ) : (
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
                onClick={() => {
                  setPrd(null as never)
                  setRawPrdText('')
                }}
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
