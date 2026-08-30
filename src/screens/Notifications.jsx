import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { NOTIFICATIONS } from '../data/mock'
import TopBar from '../components/TopBar'
import { Activity, Trophy, Users, MapPin, CheckCheck, Bell, ChevronRight } from 'lucide-react'

const TYPE_ICONS = {
  match:      { icon:Activity, bg:'bg-blue-50',   color:'text-blue-600' },
  tournament: { icon:Trophy,   bg:'bg-amber-50',  color:'text-amber-600' },
  team:       { icon:Users,    bg:'bg-green-50',  color:'text-green-600' },
  ground:     { icon:MapPin,   bg:'bg-purple-50', color:'text-purple-600' },
  result:     { icon:Trophy,   bg:'bg-navy-50',   color:'text-navy-600' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const { readNotificationIds, markNotificationRead, markAllNotificationsRead } = useStore()

  // readNotificationIds (persisted in the store) is the single source of truth —
  // deriving `read` here instead of mirroring it in local state means it can't
  // forget itself on remount and re-decrement the badge on every repeat visit.
  const notifs = NOTIFICATIONS.map(n => ({
    ...n,
    read: n.read || readNotificationIds.includes(n.id),
  }))
  const unread = notifs.filter(n => !n.read).length

  const handleMarkAll = () => markAllNotificationsRead(NOTIFICATIONS.map(n => n.id))

  const handleTap = (notif) => {
    if (!notif.read) markNotificationRead(notif.id)
    if (notif.link) navigate(notif.link)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <TopBar title="Notifications" showBack />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-24">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-navy-500 text-sm font-medium">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </span>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
              <Bell size={26} className="text-navy-300" />
            </div>
            <p className="font-semibold text-navy-500">No notifications yet</p>
            <p className="text-navy-400 text-sm mt-1 max-w-[240px] mx-auto">
              Match reminders, team updates, and live score alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map(notif => {
              const cfg  = TYPE_ICONS[notif.type] || TYPE_ICONS.match
              const Icon = cfg.icon
              return (
                <button
                  key={notif.id}
                  onClick={() => handleTap(notif)}
                  className={`card card-hover w-full flex items-start gap-3 text-left transition-colors animate-fade-in ${
                    !notif.read ? 'bg-brand-50/50 border-brand-100' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${notif.read ? 'font-semibold text-navy-700' : 'font-bold text-navy-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-navy-500 text-sm mt-1 leading-snug">{notif.body}</p>
                    <p className="text-navy-400 text-xs mt-1.5">{notif.time}</p>
                  </div>
                  {notif.link && <ChevronRight size={16} className="text-navy-300 flex-shrink-0 mt-1" />}
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
