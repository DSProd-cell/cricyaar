import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MATCHES, teamById, playerById, PLAYERS } from '../data/mock'
import { ballClass, calcCRR } from '../utils/cricket'
import { Undo2, RotateCcw, X, Check, Lock, ChevronRight, Coins } from 'lucide-react'
import { useEffect } from 'react'

// ── Pre-match Setup Wizard ────────────────────────────────────────────────────
function PreMatchSetup({ match, onStart }) {
  const [step, setStep] = useState(0) // 0=toss, 1=batting11, 2=openers
  const battingTeam  = teamById(match.team1)
  const fieldingTeam = teamById(match.team2)
  const [tossWinner, setTossWinner] = useState(match.team1)
  const [tossDecision, setTossDecision] = useState('bat')
  const [striker, setStriker]     = useState(match.xi1?.[0] || 'p1')
  const [nonStriker, setNonStriker] = useState(match.xi1?.[1] || 'p5')
  const [bowler, setBowler]       = useState(match.xi2?.[0] || 'p4')

  const batters = (match.xi1 || []).map(id => playerById(id)).filter(Boolean)
  const bowlers = (match.xi2 || []).map(id => playerById(id)).filter(Boolean)

  const btnCls = (active) => `flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
    active ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 text-navy-600 hover:border-slate-300'
  }`

  return (
    <div className="h-dvh flex flex-col bg-navy-900">
      {/* Header */}
      <div className="px-4 pt-safe flex items-center h-14 gap-3 bg-navy-800 border-b border-navy-700">
        <div className="flex-1">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-wider">Pre-Match Setup</p>
          <p className="text-white font-bold text-sm">{match.name}</p>
        </div>
        <div className="text-navy-400 text-xs">{step + 1} / 3</div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* STEP 0: Toss */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <Coins size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Toss</p>
                <p className="text-navy-400 text-xs">Who won the toss and chose to…</p>
              </div>
            </div>
            <div>
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider mb-2">Toss winner</p>
              <div className="flex gap-2">
                <button className={btnCls(tossWinner === match.team1)} onClick={() => setTossWinner(match.team1)}>{battingTeam?.name}</button>
                <button className={btnCls(tossWinner === match.team2)} onClick={() => setTossWinner(match.team2)}>{fieldingTeam?.name}</button>
              </div>
            </div>
            <div>
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider mb-2">Chose to</p>
              <div className="flex gap-2">
                <button className={btnCls(tossDecision === 'bat')}   onClick={() => setTossDecision('bat')}>Bat first</button>
                <button className={btnCls(tossDecision === 'field')} onClick={() => setTossDecision('field')}>Field first</button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Opening batters */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <p className="text-white font-bold mb-1">Opening Batters</p>
              <p className="text-navy-400 text-xs mb-4">{battingTeam?.name} batting first</p>
            </div>
            <div>
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider mb-2">Striker (on strike)</p>
              <div className="space-y-2">
                {batters.slice(0,5).map(p => (
                  <button key={p.id} onClick={() => setStriker(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      striker === p.id ? 'border-brand-400 bg-navy-800' : 'border-navy-700 bg-navy-800/60'
                    }`}>
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <span className={`font-semibold text-sm ${striker === p.id ? 'text-brand-400' : 'text-navy-200'}`}>{p.name}</span>
                    {striker === p.id && <Check size={14} className="text-brand-400 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-navy-400 text-xs font-semibold uppercase tracking-wider mb-2">Non-striker</p>
              <div className="space-y-2">
                {batters.slice(0,5).filter(p => p.id !== striker).slice(0,4).map(p => (
                  <button key={p.id} onClick={() => setNonStriker(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      nonStriker === p.id ? 'border-amber-400 bg-navy-800' : 'border-navy-700 bg-navy-800/60'
                    }`}>
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <span className={`font-semibold text-sm ${nonStriker === p.id ? 'text-amber-400' : 'text-navy-200'}`}>{p.name}</span>
                    {nonStriker === p.id && <Check size={14} className="text-amber-400 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Opening bowler */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <p className="text-white font-bold mb-1">Opening Bowler</p>
              <p className="text-navy-400 text-xs mb-4">{fieldingTeam?.name} bowling</p>
            </div>
            <div className="space-y-2">
              {bowlers.slice(0,6).map(p => (
                <button key={p.id} onClick={() => setBowler(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    bowler === p.id ? 'border-brand-400 bg-navy-800' : 'border-navy-700 bg-navy-800/60'
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <span className={`font-semibold text-sm ${bowler === p.id ? 'text-brand-400' : 'text-navy-200'}`}>{p.name}</span>
                  {bowler === p.id && <Check size={14} className="text-brand-400 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="px-4 pb-safe pt-3 bg-navy-800 border-t border-navy-700"
        style={{paddingBottom:'max(16px,env(safe-area-inset-bottom))'}}>
        {step < 2 ? (
          <button className="w-full py-4 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => setStep(s => s + 1)}>
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button className="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => onStart({ striker, nonStriker, bowler, tossWinner, tossDecision })}>
            🏏 Start Scoring
          </button>
        )}
        {step > 0 && (
          <button className="w-full text-center text-navy-400 text-sm mt-2 py-1" onClick={() => setStep(s => s - 1)}>← Back</button>
        )}
      </div>
    </div>
  )
}

const DISMISSALS = ['Bowled','Caught','LBW','Run Out','Stumped','Hit Wicket','Retired Hurt','Obstructing Field']

function WicketModal({ onConfirm, onCancel, fielders }) {
  const [type, setType]   = useState('')
  const [fielder, setFielder] = useState('')
  const [bowlerCredit, setBowlerCredit] = useState(true)
  const [nextBat, setNextBat] = useState('')

  const needsFielder = type === 'Caught' || type === 'Stumped'
  const canConfirm   = type && nextBat && (!needsFielder || fielder)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-900 text-lg">How out?</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-navy-600 hover:bg-slate-200">
            <X size={16} />
          </button>
        </div>

        {/* Dismissal type */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {DISMISSALS.map(d => (
            <button key={d}
              className={`py-2.5 px-3 rounded-xl border-[1.5px] text-sm font-medium transition-all touch-manipulation ${
                type === d ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-navy-700 hover:border-slate-300'
              }`}
              onClick={() => setType(d)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Fielder (if caught/stumped) */}
        {needsFielder && (
          <div className="mb-3">
            <label className="text-xs font-semibold text-navy-600 mb-1 block">Fielder</label>
            <select className="cm-select text-sm" value={fielder} onChange={e => setFielder(e.target.value)}>
              <option value="">Select fielder…</option>
              {fielders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        )}

        {/* Bowler credit toggle */}
        <div className="flex items-center justify-between mb-3 py-2">
          <span className="text-sm font-medium text-navy-700">Bowler gets credit?</span>
          <button
            className={`w-12 h-6 rounded-full transition-colors relative ${bowlerCredit ? 'bg-brand-500' : 'bg-slate-200'}`}
            onClick={() => setBowlerCredit(b => !b)}
            role="switch" aria-checked={bowlerCredit}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${bowlerCredit ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Next batsman */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-navy-600 mb-1 block">Next batsman</label>
          <select className="cm-select text-sm" value={nextBat} onChange={e => setNextBat(e.target.value)}>
            <option value="">Select next batter…</option>
            <option value="p3">Hardik Pandya</option>
            <option value="p11">Suryakumar Yadav</option>
            <option value="p9">Rishabh Pant</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm py-3 transition-all ${
              canConfirm ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            onClick={() => canConfirm && onConfirm(type, fielder, bowlerCredit, nextBat)}
            disabled={!canConfirm}
          >
            <Check size={15} />
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Scoring() {
  const { matchId } = useParams()
  const navigate    = useNavigate()
  const { scoring, recordBall, undoLastBall, addToast, user } = useStore()
  const [showWicket, setShowWicket]     = useState(false)
  const [showChangeBowler, setShowChangeBowler] = useState(false)
  const [setupDone, setSetupDone]       = useState(false)

  const match  = MATCHES.find(m => m.id === (matchId || 'm1')) || MATCHES[0]

  // ── PRD v2: Umpire-only scoring gate ─────────────────────────────────────
  // Only users with role 'umpire' or 'admin' can access the scoring screen.
  // Players, Captains, and Organisers see an Access Denied state regardless
  // of whether they are assigned to the match.
  const isAdmin      = user?.role === 'admin'
  const isUmpire     = user?.role === 'umpire'
  const isAuthorized = isAdmin || isUmpire

  if (!isAuthorized) {
    return (
      <div className="h-dvh flex flex-col bg-navy-900 items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-navy-800 rounded-3xl flex items-center justify-center mb-5">
          <Lock size={32} className="text-navy-400" />
        </div>
        <h2 className="text-white font-extrabold text-xl mb-2">Umpire access only</h2>
        <p className="text-navy-400 text-sm leading-relaxed mb-6">
          Scoring is managed by the assigned umpire for this match.
          {' '}Players, captains, and organisers have read-only access to the live scorecard.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl bg-navy-700 text-white font-semibold text-sm hover:bg-navy-600 transition-colors"
          >
            Go Back
          </button>
          <p className="text-navy-500 text-xs">
            Your role is <span className="text-brand-400 font-semibold capitalize">{user?.role || 'player'}</span>.
            Switch to Umpire role to access scoring.
          </p>
        </div>
      </div>
    )
  }
  // ── Pre-match setup gate ──────────────────────────────────────────────────
  if (!setupDone) {
    return (
      <PreMatchSetup
        match={match}
        onStart={(cfg) => {
          addToast(`Match started! ${teamById(match.team1)?.name} batting`, 'success')
          setSetupDone(true)
        }}
      />
    )
  }
  // ────────────────────────────────────────────────────────────────────────
  const battingTeam   = teamById(match.team1)
  const fieldingTeam  = teamById(match.team2)
  const allFielders   = (match.xi2 || []).map(id => playerById(id)).filter(Boolean)

  const { runs, wkts, overs, scorer: s, legalBalls, thisOver, freehit, striker, nonStriker, currentBowler } = scoring

  const oversStr = `${Math.floor(overs)}.${legalBalls} / ${match.overs}`
  const crr      = calcCRR(runs, Math.floor(overs) + legalBalls/6)

  const handleBall = (type, val) => {
    if (type === 'wicket') { setShowWicket(true); return }
    recordBall(type, val)
    if (legalBalls === 5) { // over complete after this ball
      setTimeout(() => setShowChangeBowler(true), 200)
    }
  }

  const handleWicket = (type, fielder, bowlerCredit, nextBat) => {
    recordBall('wicket', 0)
    setShowWicket(false)
    addToast(`Wicket! ${type}`, 'info')
  }

  const sp = playerById(striker?.id), nsp = playerById(nonStriker?.id), bp = playerById(currentBowler?.id)

  return (
    <div className="h-dvh flex flex-col bg-navy-900 overflow-hidden select-none">
      {/* ZONE 1 — Match Header */}
      <div className="flex-shrink-0 bg-navy-900 px-4 pt-safe flex items-center gap-3 h-14">
        <button onClick={() => navigate(-1)} className="text-navy-400 hover:text-white transition-colors flex-shrink-0">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-navy-400 text-xs truncate">{match.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-xl tabular-nums">{runs}/{wkts}</span>
            <span className="text-navy-400 text-sm">({oversStr})</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-navy-500 text-[10px] uppercase tracking-wide">CRR</p>
              <p className="text-brand-400 font-bold tabular-nums">{crr}</p>
            </div>
          </div>
        </div>
        {freehit && (
          <div className="px-2 py-0.5 bg-yellow-400 rounded-full text-[10px] font-bold text-navy-900 animate-pulse">
            FREE HIT
          </div>
        )}
      </div>

      {/* ZONE 2 — Batsmen */}
      <div className="flex-shrink-0 bg-navy-800 px-4 py-2 border-b border-navy-700">
        <p className="text-navy-500 text-[10px] uppercase tracking-wider mb-1.5 font-semibold">Batting</p>
        <div className="space-y-1.5">
          {/* Striker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
              <p className="text-white font-semibold text-sm">{sp?.name?.split(' ')[0] || 'Striker'}</p>
              <p className="text-brand-400 text-[10px] font-bold uppercase">*</p>
            </div>
            <div className="flex items-center gap-4 tabular-nums">
              <span className="text-white font-bold">{striker?.runs} <span className="text-navy-400 font-normal text-xs">({striker?.balls})</span></span>
              <span className="text-navy-500 text-xs">{striker?.fours}×4  {striker?.sixes}×6</span>
            </div>
          </div>
          {/* Non-striker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-navy-600 flex-shrink-0" />
              <p className="text-navy-300 font-medium text-sm">{nsp?.name?.split(' ')[0] || 'Non-striker'}</p>
            </div>
            <div className="flex items-center gap-4 tabular-nums">
              <span className="text-navy-300">{nonStriker?.runs} <span className="text-navy-500 font-normal text-xs">({nonStriker?.balls})</span></span>
              <span className="text-navy-500 text-xs">{nonStriker?.fours}×4  {nonStriker?.sixes}×6</span>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE 3 — Bowler + This over */}
      <div className="flex-shrink-0 bg-navy-850 px-4 py-2 border-b border-navy-700" style={{background:'#111827'}}>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <p className="text-navy-500 text-[10px] uppercase tracking-wider font-semibold">Bowling</p>
            <p className="text-navy-200 font-semibold text-sm">{bp?.name || 'Bowler'}</p>
          </div>
          <div className="text-right">
            <p className="text-navy-500 text-[10px]">Figures</p>
            <p className="text-navy-200 font-bold tabular-nums">{currentBowler?.wkts}-{currentBowler?.runs} ({currentBowler?.overs}.{legalBalls})</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-navy-500 text-xs mr-1">This over:</p>
          {thisOver.map((b, i) => (
            <div key={i} className={ballClass(b)}>{b === '•' ? '' : b}</div>
          ))}
          {[...Array(Math.max(0, 6 - thisOver.length))].map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8 rounded-full border-[1.5px] border-dashed border-navy-700" />
          ))}
        </div>
      </div>

      {/* ZONE 4 — Run buttons */}
      <div className="flex-1 px-3 flex flex-col gap-2 justify-center max-h-[220px] self-end w-full">
        {/* Row 1: 0 1 2 3 4 6 */}
        <div className="grid grid-cols-6 gap-1.5">
          {[
            { label:'•', type:'run', val:0,  cls:'score-btn-dot'    },
            { label:'1', type:'run', val:1,  cls:'score-btn-run'    },
            { label:'2', type:'run', val:2,  cls:'score-btn-run'    },
            { label:'3', type:'run', val:3,  cls:'score-btn-run'    },
            { label:'4', type:'four',val:4,  cls:'score-btn-four'   },
            { label:'6', type:'six', val:6,  cls:'score-btn-six'    },
          ].map(b => (
            <button key={b.label} className={`score-btn ${b.cls}`} onClick={() => handleBall(b.type, b.val)} aria-label={b.label === '•' ? 'Dot ball' : `${b.val} runs`}>
              {b.label}
            </button>
          ))}
        </div>
        {/* Row 2: W Wd Nb Lb 5 Pen */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label:'W',   type:'wicket',  cls:'score-btn-wicket' },
            { label:'Wd',  type:'wide',    cls:'score-btn-wide'   },
            { label:'Nb',  type:'noball',  cls:'score-btn-noball' },
            { label:'Lb',  type:'legbye',  cls:'score-btn-lb',    val:1 },
            { label:'Pen', type:'penalty', cls:'score-btn-pen'    },
          ].map(b => (
            <button key={b.label} className={`score-btn text-base ${b.cls}`} onClick={() => handleBall(b.type, b.val||0)} aria-label={b.label}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* ZONE 5 — Controls */}
      <div className="flex-shrink-0 px-3 pb-3 grid grid-cols-3 gap-2" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
        <button
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-navy-700 text-navy-200 text-sm font-semibold disabled:opacity-30 hover:bg-navy-600 transition-colors touch-manipulation"
          onClick={undoLastBall}
          disabled={!scoring.undoStack?.length}
          aria-label="Undo last ball"
        >
          <Undo2 size={16} />
          Undo
        </button>
        <button
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-navy-700 text-navy-200 text-sm font-semibold hover:bg-navy-600 transition-colors touch-manipulation"
          onClick={() => setShowChangeBowler(true)}
          aria-label="Change bowler"
        >
          <RotateCcw size={16} />
          Change
        </button>
        <button
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors touch-manipulation"
          onClick={() => { if(confirm('End the innings?')) navigate('/my-cricket') }}
          aria-label="End innings"
        >
          End Innings
        </button>
      </div>

      {/* Wicket Modal */}
      {showWicket && (
        <WicketModal
          fielders={allFielders}
          onConfirm={handleWicket}
          onCancel={() => setShowWicket(false)}
        />
      )}

      {/* Change Bowler Modal */}
      {showChangeBowler && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowChangeBowler(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl p-5 shadow-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-navy-900 text-lg mb-1">Over complete — change bowler</h3>
            <p className="text-navy-500 text-sm mb-4">Select the next bowler. Same bowler cannot bowl consecutive overs.</p>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {(match.xi2 || ['p2','p10']).map(pid => {
                const p = playerById(pid)
                return p ? (
                  <button key={pid} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-left"
                    onClick={() => { addToast(`${p.name.split(' ')[0]} to bowl`, 'info'); setShowChangeBowler(false) }}>
                    <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {p.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">{p.name}</p>
                      <p className="text-navy-500 text-xs">0-0-0-0</p>
                    </div>
                  </button>
                ) : null
              })}
            </div>
            <button className="btn-secondary w-full" onClick={() => setShowChangeBowler(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
