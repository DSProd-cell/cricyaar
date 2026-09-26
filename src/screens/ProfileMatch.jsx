import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { User, CheckCircle, ArrowRight } from 'lucide-react'
import { getRoleColor } from '../lib/roleColors'

export default function ProfileMatch() {
  const navigate   = useNavigate()
  const { user }   = useStore()
  const roleColor  = getRoleColor(user?.role)
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const name = user?.name
    if (!name || name.trim().length < 2) {
      navigate('/celebration', { replace: true })
      return
    }
    const firstName = name.trim().split(' ')[0]
    supabase
      .from('profiles')
      .select('id, name, username, city, role')
      .ilike('name', `%${firstName}%`)
      .neq('id', user.id)
      .limit(8)
      .then(({ data }) => {
        const matches = data || []
        if (matches.length === 0) {
          navigate('/celebration', { replace: true })
        } else {
          setProfiles(matches)
          setLoading(false)
        }
      })
  }, []) // eslint-disable-line

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${roleColor.primary} transparent transparent transparent` }}
        />
        <p className="text-navy-500 text-sm text-center px-6">
          Searching CricYaar for your cricket records…
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
      >
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-white font-black text-xl mb-1.5">We Found Cricket Records!</h1>
        <p className="text-white/75 text-sm leading-relaxed">
          Is any of these profiles yours?<br />
          Your stats might already be waiting.
        </p>
      </div>

      <div className="flex-1 px-4 pt-5 pb-8 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-3">
          {profiles.map(p => {
            const isSel = selected === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelected(isSel ? null : p.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 bg-white text-left transition-all active:scale-[0.98]"
                style={{
                  borderColor: isSel ? roleColor.primary : '#e2e8f0',
                  background:  isSel ? roleColor.light   : '#fff',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${roleColor.primary}20` }}
                >
                  <User size={18} style={{ color: roleColor.primary }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-navy-900 text-sm">{p.name}</p>
                  {p.username && <p className="text-navy-400 text-xs">@{p.username}</p>}
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {p.city && (
                      <span className="text-[10px] bg-slate-100 text-navy-500 px-1.5 py-0.5 rounded-full">
                        {p.city}
                      </span>
                    )}
                    {p.role && (
                      <span className="text-[10px] bg-slate-100 text-navy-500 px-1.5 py-0.5 rounded-full capitalize">
                        {p.role.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                {isSel && (
                  <CheckCircle size={20} style={{ color: roleColor.primary }} className="flex-shrink-0" />
                )}
              </button>
            )
          })}

          <div className="pt-2 space-y-3">
            {selected && (
              <button
                onClick={() => navigate('/celebration')}
                className="w-full py-4 rounded-2xl font-bold text-white text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
              >
                Yes, That's Me! <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={() => navigate('/celebration')}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm border-2 border-slate-200 text-navy-500 bg-white hover:bg-slate-50 transition-colors active:scale-[0.98]"
            >
              None of These Are Me — Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
