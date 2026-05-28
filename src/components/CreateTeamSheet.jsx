import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { PLAYERS } from '../data/mock'
import {
  X, Crown, Check, Zap, Users, Shield,
  ChevronDown, Plus, Trash2, Star
} from 'lucide-react'

const POSITIONS = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper']
const POSITION_COLORS = {
  Batsman:      'bg-blue-50 text-blue-700 border-blue-200',
  Bowler:       'bg-green-50 text-green-700 border-green-200',
  'All-rounder':'bg-purple-50 text-purple-700 border-purple-200',
  Wicketkeeper: 'bg-amber-50 text-amber-700 border-amber-200',
}
const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Chandigarh', 'Rajkot', 'Other']
const TEAM_COLORS = ['#22c55e','#3b82f6','#ef4444','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316']

function PlayerRow({ player, onRemove, onChangeRole, isPro, isLocked }) {
  return (
    <div className={`flex items-center gap-2 py-2 border-b border-slate-100 last:border-0 ${isLocked ? 'opacity-60' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
        <span className="text-brand-700 font-bold text-xs">
          {player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-navy-900 font-semibold text-sm truncate">{player.name}</p>
        {player.captain && <span className="text-[10px] text-amber-600 font-bold">⭐ Captain</span>}
        {player.keeper && !player.captain && <span className="text-[10px] text-cyan-600 font-bold">🧤 Keeper</span>}
      </div>
      {/* Position picker */}
      <select
        value={player.position}
        onChange={e => !isLocked && onChangeRole(player.id, e.target.value)}
        disabled={isLocked}
        className={`text-[11px] font-semibold border rounded-lg px-1.5 py-1 outline-none bg-white ${POSITION_COLORS[player.position] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
      >
        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      {!isLocked && (
        <button onClick={() => onRemove(player.id)} className="text-slate-300 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      )}
      {isLocked && <Shield size={13} className="text-slate-300 flex-shrink-0" />}
    </div>
  )
}

export default function CreateTeamSheet({ onClose }) {
  const navigate = useNavigate()
  const { user, addToast, setShowProSheet } = useStore()
  const isPro = user?.subscription === 'pro_active'

  // Form state
  const [teamName, setTeamName]   = useState('')
  const [city, setCity]           = useState('Mumbai')
  const [color, setColor]         = useState(TEAM_COLORS[0])
  const [captainId, setCaptainId] = useState(PLAYERS[0].id)
  const [keeperId, setKeeperId]   = useState(PLAYERS[5].id) // KL Rahul as default WK
  const [squad, setSquad]         = useState([
    { id: PLAYERS[0].id, name: PLAYERS[0].name, position: 'Batsman',  captain: true,  keeper: false },
    { id: PLAYERS[1].id, name: PLAYERS[1].name, position: 'Batsman',  captain: false, keeper: false },
    { id: PLAYERS[2].id, name: PLAYERS[2].name, position: 'All-rounder', captain: false, keeper: false },
    { id: PLAYERS[3].id, name: PLAYERS[3].name, position: 'Bowler',   captain: false, keeper: false },
    { id: PLAYERS[5].id, name: PLAYERS[5].name, position: 'Wicketkeeper', captain: false, keeper: true },
  ])
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  const addPlayer = (player) => {
    if (squad.find(s => s.id === player.id)) return
    setSquad(prev => [...prev, { id: player.id, name: player.name, position: 'Batsman', captain: false, keeper: false }])
    setShowAddPlayer(false)
  }

  const removePlayer = (id) => setSquad(prev => prev.filter(p => p.id !== id))

  const changePosition = (id, position) => setSquad(prev =>
    prev.map(p => p.id === id ? { ...p, position } : p)
  )

  const handleCreate = () => {
    if (!isPro) { setShowProSheet(true); return }
    if (!teamName.trim()) { addToast('Please enter a team name', 'error'); return }
    addToast(`Team "${teamName}" created! 🏏`, 'success')
    onClose()
    navigate('/teams')
  }

  const availablePlayers = PLAYERS.filter(p => !squad.find(s => s.id === p.id))

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-extrabold text-navy-900 text-lg">Create Your Team</h2>
            {!isPro && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Crown size={11} className="text-amber-500 fill-amber-400" />
                <span className="text-amber-600 text-xs font-bold">Pro feature — ₹99/month</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100">
            <X size={15} className="text-navy-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 120px)' }}>
          <div className="px-5 py-4 space-y-5 pb-6">

            {/* ── Pro upgrade banner (free users only) ── */}
            {!isPro && (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'linear-gradient(135deg, #1c1209, #2d1a00)', border: '1.5px solid #d97706' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-amber-200 font-extrabold text-sm">Upgrade to Pro to Create Teams</span>
                </div>
                <p className="text-amber-700 text-xs mb-3">Fill in your team details below, then upgrade to save it.</p>
                <div className="space-y-1.5 mb-3">
                  {['Manage up to 15-player squad', 'Assign captain & wicketkeeper', 'Enter tournaments & track wins'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={11} className="text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-amber-200 text-xs">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { onClose(); navigate('/pro-payment') }}
                  className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
                >
                  <Zap size={14} />
                  Upgrade to Pro — ₹99/month
                </button>
              </div>
            )}

            {/* ── Team name ── */}
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                className="cm-input"
                placeholder="e.g. Mumbai Strikers"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                disabled={!isPro}
              />
            </div>

            {/* ── City ── */}
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">City</label>
              <div className="relative">
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  disabled={!isPro}
                  className="cm-select w-full"
                >
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* ── Team colour ── */}
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-2">Team Colour</label>
              <div className="flex gap-2 flex-wrap">
                {TEAM_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => isPro && setColor(c)}
                    className="w-9 h-9 rounded-xl transition-all border-2 flex items-center justify-center"
                    style={{
                      background: c,
                      borderColor: color === c ? '#0f172a' : 'transparent',
                      opacity: isPro ? 1 : 0.5
                    }}
                  >
                    {color === c && <Check size={14} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Captain ── */}
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5 flex items-center gap-1.5">
                <Star size={13} className="text-amber-500 fill-amber-400" /> Captain
              </label>
              <select
                value={captainId}
                onChange={e => {
                  if (!isPro) return
                  setCaptainId(e.target.value)
                  setSquad(prev => prev.map(p => ({ ...p, captain: p.id === e.target.value })))
                }}
                disabled={!isPro}
                className="cm-select w-full"
              >
                {PLAYERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* ── Wicketkeeper ── */}
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5 flex items-center gap-1.5">
                🧤 Wicketkeeper
              </label>
              <select
                value={keeperId}
                onChange={e => {
                  if (!isPro) return
                  setKeeperId(e.target.value)
                  setSquad(prev => prev.map(p => ({ ...p, keeper: p.id === e.target.value, position: p.id === e.target.value ? 'Wicketkeeper' : p.position })))
                }}
                disabled={!isPro}
                className="cm-select w-full"
              >
                {PLAYERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* ── Squad ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-navy-700 flex items-center gap-1.5">
                  <Users size={13} className="text-navy-500" />
                  Squad <span className="text-navy-400 font-normal">({squad.length} players)</span>
                </label>
                {isPro && squad.length < 15 && (
                  <button
                    onClick={() => setShowAddPlayer(true)}
                    className="flex items-center gap-1 text-brand-600 text-xs font-bold hover:text-brand-700"
                  >
                    <Plus size={13} />Add Player
                  </button>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl px-3 py-1">
                {squad.map(player => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onRemove={removePlayer}
                    onChangeRole={changePosition}
                    isPro={isPro}
                    isLocked={!isPro}
                  />
                ))}
                {!isPro && (
                  <div className="flex items-center gap-2 py-2.5 text-slate-400 border-t border-slate-100">
                    <Shield size={13} />
                    <span className="text-xs">Upgrade to Pro to manage your squad</span>
                  </div>
                )}
              </div>

              {/* Add player picker */}
              {showAddPlayer && isPro && (
                <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-40 overflow-y-auto">
                  {availablePlayers.length === 0
                    ? <p className="text-center text-navy-400 text-sm py-4">All players added</p>
                    : availablePlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addPlayer(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-700 font-bold text-[10px]">
                            {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-navy-900 text-sm font-semibold">{p.name}</p>
                          <p className="text-navy-400 text-xs">{p.city}</p>
                        </div>
                        <Plus size={14} className="text-brand-500 ml-auto" />
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sticky footer CTA ── */}
        <div className="px-5 pb-8 pt-3 border-t border-slate-100 flex-shrink-0 bg-white">
          {isPro ? (
            <button
              onClick={handleCreate}
              disabled={!teamName.trim()}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              <Users size={18} />
              Create Team
            </button>
          ) : (
            <button
              onClick={() => { onClose(); navigate('/pro-payment') }}
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Crown size={18} className="fill-white" />
              Become Pro to Save This Team
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
