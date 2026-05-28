import { useStore } from '../store/useStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const icons = { success: CheckCircle, error: AlertCircle, info: Info }

export default function Toast() {
  const { toasts, removeToast } = useStore()
  if (!toasts.length) return null
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2.5 pointer-events-none items-center w-full px-4">
      {toasts.map(t => {
        const Icon = icons[t.type] || CheckCircle
        return (
          <div key={t.id} className={`toast toast-${t.type} pointer-events-auto w-full`} style={{ maxWidth: 400 }}>
            <Icon size={20} className="flex-shrink-0" strokeWidth={2.5} />
            <span className="flex-1 leading-snug">{t.msg}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-80 hover:opacity-100 flex-shrink-0 ml-1">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
