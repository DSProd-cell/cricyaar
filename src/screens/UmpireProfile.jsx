import { useState } from 'react'
import { useStore } from '../store/useStore'
import { UMPIRE_PROFILE, initials } from '../data/mock'
import TopBar from '../components/TopBar'
import { Star, Calendar, MapPin, Award, CheckCircle, Clock, Edit3, Check } from 'lucide-react'

function StarBar({ count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${pct}%`, background: '#f59e0b' }}
      />
    </div>
  )
}

export default function UmpireProfile() {
  const { user, addToast } = useStore()
  const profile = UMPIRE_PROFILE
  const [editingCerts, setEditingCerts] = useState(false)
  const [certText, setCertText] = useState(profile.certifications)
  const [editingCities, setEditingCities] = useState(false)
  const [citiesText, setCitiesText] = useState(profile.cities.join(', '))

  const totalRatings = Object.values(profile.ratingBreakdown).reduce((a, b) => a + b, 0)

  const upcoming = profile.assignments.filter(a => a.status === 'upcoming')
  const completed = profile.assignments.filter(a => a.status === 'completed')

  const StarRating = ({ n }) => (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </span>
  )

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="Umpire Profile" showBack />
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4 pb-24">

        {/* Profile header */}
        <div className="card animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
              {initials(user?.name || 'U')}
            </div>
            <div>
              <p className="font-extrabold text-navy-900 text-lg">{user?.name}</p>
              <p className="text-navy-500 text-sm">@{user?.username}</p>
              <span className="badge" style={{ background:'#fef3c7', color:'#d97706' }}>Umpire</span>
            </div>
          </div>

          {/* Big rating */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Star size={28} className="text-amber-400 fill-amber-400" />
                <span className="text-4xl font-black text-navy-900">{profile.rating}</span>
              </div>
              <p className="text-navy-500 text-xs mt-1">{profile.ratingCount} ratings</p>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <p className="text-3xl font-black text-navy-900">{profile.matchesUmpired}</p>
              <p className="text-navy-500 text-xs mt-1">matches umpired</p>
            </div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="card animate-slide-up">
          <h3 className="font-bold text-navy-900 mb-3">Rating Breakdown</h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-10 flex-shrink-0">
                  <span className="text-sm font-semibold text-navy-700">{star}</span>
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                </div>
                <StarBar count={profile.ratingBreakdown[star] || 0} total={totalRatings} />
                <span className="text-xs text-navy-400 w-5 text-right flex-shrink-0">
                  {profile.ratingBreakdown[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming assignments */}
        <div className="card animate-slide-up">
          <h3 className="font-bold text-navy-900 mb-3">Upcoming Assignments</h3>
          {upcoming.length === 0 ? (
            <div className="text-center py-6">
              <Clock size={28} className="mx-auto text-navy-300 mb-2" />
              <p className="text-navy-500 text-sm">No upcoming assignments</p>
              <p className="text-navy-400 text-xs mt-1">Organisers can assign you when creating a match</p>
            </div>
          ) : upcoming.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-brand-50 border border-brand-100 rounded-xl mb-2">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={15} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">{a.teams}</p>
                <p className="text-navy-500 text-xs mt-0.5">{a.date} · {a.ground}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-navy-400" />
                  <span className="text-navy-400 text-xs">{a.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Past matches */}
        <div className="card animate-slide-up">
          <h3 className="font-bold text-navy-900 mb-3">Match History</h3>
          {completed.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle size={15} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm truncate">{a.teams}</p>
                <p className="text-navy-500 text-xs mt-0.5">{a.date} · {a.city}</p>
              </div>
              {a.rating != null && (
                <StarRating n={a.rating} />
              )}
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy-900">Certifications</h3>
            <button
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              onClick={() => {
                if (editingCerts) { addToast('Certifications saved', 'success') }
                setEditingCerts(p => !p)
              }}
            >
              {editingCerts ? <Check size={13} className="text-brand-600" /> : <Edit3 size={13} className="text-navy-500" />}
            </button>
          </div>
          {editingCerts ? (
            <input
              className="cm-input text-sm"
              value={certText}
              onChange={e => setCertText(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-navy-700 text-sm">{certText || 'No certifications added'}</p>
            </div>
          )}
        </div>

        {/* Cities */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy-900">Available Cities</h3>
            <button
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              onClick={() => {
                if (editingCities) { addToast('Cities saved', 'success') }
                setEditingCities(p => !p)
              }}
            >
              {editingCities ? <Check size={13} className="text-brand-600" /> : <Edit3 size={13} className="text-navy-500" />}
            </button>
          </div>
          {editingCities ? (
            <input className="cm-input text-sm" value={citiesText} onChange={e => setCitiesText(e.target.value)} autoFocus />
          ) : (
            <div className="flex flex-wrap gap-2">
              {citiesText.split(',').map(c => c.trim()).filter(Boolean).map(city => (
                <span key={city} className="badge badge-navy">{city}</span>
              ))}
              {!citiesText && <p className="text-navy-400 text-sm">No cities added</p>}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
