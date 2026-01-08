import { Header } from '@/components/Header'
import { PrdPanel } from '@/components/prd/PrdPanel'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { ExecutionLog } from '@/components/log/ExecutionLog'
import { ControlBar } from '@/components/controls/ControlBar'
import { Toaster } from '@/components/ui/Toaster'

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <ControlBar />
      <main className="flex-1 grid grid-cols-[320px_1fr_380px] gap-4 p-4 overflow-hidden">
        <PrdPanel />
        <KanbanBoard />
        <ExecutionLog />
      </main>
      <Toaster />
    </div>
  )
}

export default App
