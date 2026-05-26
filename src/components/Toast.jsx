import { useStore } from '../store/useStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const icons = { success: CheckCircle, error: AlertCircle, info: Info }

export default function Toast() {
  const { toasts, removeToast } = useStore()
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type] || CheckCircle
        return (
          <div key={t.id} className={`toast toast-${t.type} pointer-events-auto`}>
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{t.msg}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
