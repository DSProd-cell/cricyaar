import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { NOTIFICATIONS } from '../data/mock'
import TopBar from '../components/TopBar'
import { Activity, Trophy, Users, MapPin, CheckCheck, Bell } from 'lucide-react'

const TYPE_ICONS = {
  match:      { icon:Activity, bg:'bg-blue-50',   color:'text-blue-600' },
  tournament: { icon:Trophy,   bg:'bg-amber-50',  color:'text-amber-600' },
  team:       { icon:Users,    bg:'bg-green-50',  color:'text-green-600' },
  ground:     { icon:MapPin,   bg:'bg-purple-50', color:'text-purple-600' },
  result:     { icon:Trophy,   bg:'bg-navy-50',   color:'text-navy-600' },
}

export default function Notifications() {
  const navigate = useNavigate()
  const { clearNotifications } = useStore()
  const [notifs, setNotifs] = useState(NOTIFICATIONS)

  const handleMarkAll = () => {
    setNotifs(n => n.map(x => ({...x, read:true})))
    clearNotifications()
  }

  const handleTap = (notif) => {
    setNotifs(n => n.map(x => x.id === notif.id ? {...x, read:true} : x))
    if (notif.link) navigate(notif.link)
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Notifications" showBack />
      <main className="flex-1 max-w-2xl mx-auto w-full">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <span className="text-navy-500 text-sm font-medium">{unread > 0 ? `${unread} unread` : 'All caught up'}</span>
          {unread > 0 && (
            <button onClick={handleMarkAll} className="flex items-center gap-1.5 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors">
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="mx-auto text-navy-300 mb-3" />
            <p className="font-semibold text-navy-500">No notifications yet</p>
            <p className="text-navy-400 text-sm mt-1">Match reminders, team updates, and live score alerts will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifs.map(notif => {
              const cfg  = TYPE_ICONS[notif.type] || TYPE_ICONS.match
              const Icon = cfg.icon
              return (
                <button
                  key={notif.id}
                  onClick={() => handleTap(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-brand-50/40' : ''} animate-fade-in`}
                >
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2" />}
                  {notif.read && <div className="w-2 h-2 flex-shrink-0 mt-2" />}
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${notif.read ? 'font-medium text-navy-700' : 'font-bold text-navy-900'}`}>{notif.title}</p>
                      <span className="text-navy-400 text-xs flex-shrink-0 mt-0.5">{notif.time}</span>
                    </div>
                    <p className="text-navy-500 text-sm mt-0.5 leading-snug">{notif.body}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
