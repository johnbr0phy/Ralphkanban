import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settingsStore'

export function Toaster() {
  const { toasts, removeToast } = useSettingsStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onClose
}: {
  toast: { id: string; message: string; type: 'success' | 'error' | 'info' }
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg text-sm',
        toast.type === 'success' && 'bg-green-100 text-green-800 border border-green-200',
        toast.type === 'error' && 'bg-red-100 text-red-800 border border-red-200',
        toast.type === 'info' && 'bg-blue-100 text-blue-800 border border-blue-200'
      )}
    >
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
