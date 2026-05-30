/**
 * UmpireMatchSession — Full match flow for the Umpire role
 * Features: squad + mobile lookup · ball-by-ball scoring · undo ·
 *   change bat/bowl · retired hurt · declare out · DLS · cancel · walkover · declare winner
 */
import { useState } from 'react'
import { teamById, playerById } from '../data/mock'
import { useStore } from '../store/useStore'
import {
  X, Check, Lock, MoreVertical, Phone, Plus, AlertTriangle,
  CloudRain, Swords, UserX, UserCheck, RefreshCcw, Zap,
  CornerUpLeft, ArrowLeftRight, Trophy, Users
} from 'lucide-react'

// ─── Mock phone → player DB ──────────────────────────────────────────────────
const PHONE_DB = {
  '9876540001':'p1',  '9876540002':'p2',  '9876540003':'p3',
  '9876540004':'p4',  '9876540005':'p5',  '9876540006':'p6',
  '9876540007':'p7',  '9876540008':'p8',  '9876540009':'p9',
  '9876540010':'p10', '9876540011':'p11', '9876540012':'p13',
  '9876540013':'p14', '9876540014':'p15', '9876540015':'p16',
  '9876540016':'p17', '9876540017':'p18', '9876540018':'p19',
  '9876540019':'p20', '9876540020':'p21', '9876540021':'p22',
  '9876540022':'p23', '9876540023':'p24', '9876540024':'p25',
}
function lookupByPhone(phone) {
  const clean = phone.replace(/\D/g, '').slice(-10)
  const id = PHONE_DB[clean]
  return id ? playerById(id) : null
}

// ─── DLS Resource Calculator (Standard Edition) ───────────────────────────────
const DLS_Z0 = [100, 89.3, 77.8, 65.6, 52.4, 38.6, 26.0, 14.3, 6.9, 3.2, 0]
const DLS_B  = [0.0300,0.0264,0.0240,0.0200,0.0173,0.0133,0.0100,0.0076,0.0051,0.0025,0]
function dlsResources(oversRem, wktsLost) {
  const w = Math.min(Math.max(wktsLost, 0), 10)
  if (w >= 10 || DLS_B[w] === 0) return 0
  return DLS_Z0[w] * (1 - Math.exp(-DLS_B[w] * Math.max(0, oversRem)))
}
function calcDLSTarget(t1Runs, fullOvers, t2OversAvail, t2Wkts) {
  const r1 = dlsResources(fullOvers, 0)
  const r2 = dlsResources(t2OversAvail, t2Wkts)
  if (r1 === 0) return t1Runs + 1
  return Math.floor(t1Runs * (r2 / r1)) + 1
}

// ─── Core helpers ─────────────────────────────────────────────────────────────
function fmtOvers(legalBalls) { return `${Math.floor(legalBalls/6)}.${legalBalls%6}` }
function runRate(runs, legalBalls) { return !legalBalls ? '0.00' : ((runs/legalBalls)*6).toFixed(2) }
function createInning(battingTeamId, bowlingTeamId, xi) {
  return {
    battingTeamId, bowlingTeamId,
    runs:0, wkts:0, legalBalls:0,
    extras:{wd:0,nb:0,b:0,lb:0},
    batters:{}, bowlers:{},
    striker:null, nonStriker:null,
    currentBowler:null, lastBowler:null,
    thisOverBalls:[], allOvers:[],
    fallOfWickets:[], dismissed:[], retiredHurt:[],
    battingXi:xi, completed:false,
  }
}
function applyBall(inn, type, runs, configOvers) {
  const u = JSON.parse(JSON.stringify(inn))
  const s = u.striker, b = u.currentBowler
  if (s && !u.batters[s]) u.batters[s] = {runs:0,balls:0,fours:0,sixes:0,out:false,how:null}
  if (b && !u.bowlers[b]) u.bowlers[b] = {balls:0,runs:0,wkts:0,wd:0,nb:0}
  const isLegal = !['wd','nb'].includes(type)
  let sym = ''
  if (type==='run') {
    u.runs+=runs
    if(s){const bt=u.batters[s];bt.runs+=runs;bt.balls++;if(runs===4)bt.fours++;if(runs===6)bt.sixes++}
    if(b){const bw=u.bowlers[b];bw.balls++;bw.runs+=runs}
    u.legalBalls++; sym = runs===0?'.':String(runs)
    if(runs%2===1&&u.striker&&u.nonStriker)[u.striker,u.nonStriker]=[u.nonStriker,u.striker]
  } else if(type==='wd') {
    u.runs++;u.extras.wd++;if(b){u.bowlers[b].runs++;u.bowlers[b].wd++};sym='Wd'
  } else if(type==='nb') {
    u.runs+=1+runs;u.extras.nb++
    if(s&&runs>0)u.batters[s].runs+=runs
    if(b){u.bowlers[b].runs+=1+runs;u.bowlers[b].nb++};sym=runs>0?`Nb+${runs}`:'Nb'
  } else if(type==='b') {
    const r=runs||1;u.runs+=r;u.extras.b+=r
    if(b){u.bowlers[b].balls++;u.bowlers[b].runs+=r};u.legalBalls++;sym=`B${r}`
  } else if(type==='lb') {
    const r=runs||1;u.runs+=r;u.extras.lb+=r
    if(b){u.bowlers[b].balls++;u.bowlers[b].runs+=r};u.legalBalls++;sym=`Lb${r}`
  } else if(type==='wkt') {
    u.runs+=runs||0
    if(s){const bt=u.batters[s];bt.balls++;bt.runs+=runs||0;bt.out=true}
    if(b){u.bowlers[b].balls++;u.bowlers[b].runs+=runs||0;u.bowlers[b].wkts++}
    u.legalBalls++;u.wkts++
    u.dismissed=[...u.dismissed,s]
    u.fallOfWickets=[...u.fallOfWickets,{wkt:u.wkts,score:u.runs,player:s,overs:fmtOvers(u.legalBalls)}]
    u.striker=null;sym='W'
  }
  u.thisOverBalls=[...u.thisOverBalls,sym]
  if(isLegal&&u.legalBalls>0&&u.legalBalls%6===0) {
    u.allOvers=[...u.allOvers,[...u.thisOverBalls]];u.thisOverBalls=[]
    u.lastBowler=u.currentBowler;u.currentBowler=null
    if(u.striker&&u.nonStriker)[u.striker,u.nonStriker]=[u.nonStriker,u.striker]
  }
  if(u.wkts>=10||u.legalBalls>=configOvers*6) {
    u.completed=true
    if(u.thisOverBalls.length>0){u.allOvers=[...u.allOvers,[...u.thisOverBalls]];u.thisOverBalls=[]}
  }
  return u
}
function computeResult(inn1, inn2) {
  if(!inn1||!inn2||!inn2.completed) return null
  if(inn2.runs>=inn1.runs+1){const m=10-inn2.wkts;return{winner:inn2.battingTeamId,margin:`${m} wicket${m!==1?'s':''}`}}
  if(inn2.runs===inn1.runs) return{winner:null,margin:'Tie'}
  const m=inn1.runs-inn2.runs;return{winner:inn1.battingTeamId,margin:`${m} run${m!==1?'s':''}`}
}

// ─── BallPill ─────────────────────────────────────────────────────────────────
function BallPill({sym}) {
  const isW=sym==='W',isWd=sym?.startsWith('Wd'),isNb=sym?.startsWith('Nb')
  const isExt=sym?.startsWith('B')||sym?.startsWith('Lb'),is4=sym==='4',is6=sym==='6'
  const base='w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0'
  const cls=isW?`${base} bg-red-500 text-white`:isWd||isNb?`${base} bg-amber-400 text-white`
    :isExt?`${base} bg-blue-100 text-blue-700`:is4?`${base} bg-brand-100 text-brand-700`
    :is6?`${base} bg-purple-100 text-purple-700`:sym==='.'?`${base} bg-slate-100 text-slate-500`
    :`${base} bg-navy-100 text-navy-700`
  return <div className={cls}>{sym}</div>
}

// ─── SelectPlayerModal ────────────────────────────────────────────────────────
function SelectPlayerModal({title, players, disabledIds=[], onSelect, allowNull=false}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={e=>e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[70dvh] flex flex-col">
        <div className="flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <p className="font-bold text-navy-900 text-base">{title}</p>
        </div>
        <div className="overflow-y-auto flex-1 px-3 py-2">
          {allowNull&&(
            <button onClick={()=>onSelect(null)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-navy-400 text-sm font-medium mb-1">
              — Skip / Retired Hurt
            </button>
          )}
          {players.map(p=>{
            const disabled=disabledIds.includes(p.id)
            return(
              <button key={p.id} disabled={disabled} onClick={()=>!disabled&&onSelect(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-1 ${disabled?'opacity-40 cursor-not-allowed':'hover:bg-brand-50 active:scale-[0.98]'}`}>
                <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-xs font-extrabold text-brand-700 flex-shrink-0">{p.name?.[0]}</div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-navy-900 text-sm truncate">{p.name}</p>
                  <p className="text-navy-400 text-xs">{p.batting?.avg?`Avg ${p.batting.avg} · SR ${p.batting.sr}`:p.bowling?.wkts?`${p.bowling.wkts} wkts · Eco ${p.bowling.eco}`:''}</p>
                </div>
                {disabled&&<Lock size={12} className="text-slate-400 flex-shrink-0"/>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── WicketModal ──────────────────────────────────────────────────────────────
function WicketModal({onSelect, onClose}) {
  const types=['Caught','Bowled','LBW','Run Out','Stumped','Hit Wicket','Obstructing Field']
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={e=>e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-navy-900">How was the batsman out?</p>
          {onClose&&<button onClick={onClose}><X size={18} className="text-slate-400"/></button>}
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-2 pb-8">
          {types.map(t=>(
            <button key={t} onClick={()=>onSelect(t)}
              className="py-3 px-4 rounded-xl border-2 border-slate-200 font-semibold text-sm text-navy-700 hover:border-red-400 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AddByMobileSheet ─────────────────────────────────────────────────────────
function AddByMobileSheet({existingIds, onAdd, onClose}) {
  const [phone, setPhone]     = useState('')
  const [result, setResult]   = useState(null)  // player | 'not_found' | null
  const [searching, setSearching] = useState(false)

  const handleSearch = () => {
    setSearching(true)
    setTimeout(()=>{
      const p = lookupByPhone(phone)
      setResult(p || 'not_found')
      setSearching(false)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-navy-900 text-base">Add Player by Mobile</p>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        <div className="px-5 py-5 pb-10">
          <p className="text-navy-500 text-sm mb-4">Enter the player's registered mobile number to fetch their profile from the database.</p>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"/>
              <input
                type="tel" placeholder="10-digit mobile number"
                value={phone} onChange={e=>setPhone(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSearch()}
                maxLength={15}
                className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-3 text-sm text-navy-900 outline-none focus:border-brand-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={phone.replace(/\D/g,'').length<10||searching}
              className="px-5 py-3 rounded-xl bg-brand-500 text-white font-bold text-sm disabled:opacity-40"
            >
              {searching?'…':'Search'}
            </button>
          </div>

          {result==='not_found'&&(
            <div className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0"/>
              <p className="text-red-700 text-sm font-medium">No player found with this mobile number.</p>
            </div>
          )}

          {result&&result!=='not_found'&&(
            <div className="flex items-center gap-3 bg-brand-50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-extrabold text-brand-700 flex-shrink-0">{result.name?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-900 text-sm">{result.name}</p>
                <p className="text-navy-400 text-xs">{result.batting?.avg?`Bat Avg ${result.batting.avg}`:''}{result.bowling?.wkts?` · ${result.bowling.wkts} wkts`:''}</p>
              </div>
              {existingIds.includes(result.id)?(
                <span className="text-xs font-semibold text-green-600 bg-green-50 rounded-full px-2 py-1">Already in squad</span>
              ):(
                <button
                  onClick={()=>{onAdd(result);onClose()}}
                  className="flex items-center gap-1 bg-brand-500 text-white rounded-xl px-3 py-2 font-bold text-xs"
                >
                  <Plus size={13}/>Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Scoring Actions Menu ─────────────────────────────────────────────────────
function ScoringActionsMenu({inn, innIdx, hasHistory, onAction, onClose}) {
  const actions = [
    {id:'undo',        icon:CornerUpLeft,   label:'Undo Last Ball',      color:'text-navy-700', disabled:!hasHistory},
    {id:'change_bat',  icon:ArrowLeftRight, label:'Change Batsman',      color:'text-brand-700'},
    {id:'change_bowl', icon:RefreshCcw,     label:'Change Bowler',       color:'text-brand-700'},
    {id:'retired_hurt',icon:UserCheck,      label:'Retired Hurt',        color:'text-amber-700'},
    {id:'declare_out', icon:UserX,          label:'Declare Batsman Out', color:'text-red-700'},
    {id:'dls',         icon:Zap,            label:'DLS Method',          color:'text-purple-700', disabled:innIdx===0&&!inn},
    {id:'declare_win', icon:Trophy,         label:'Declare Winner',      color:'text-amber-600'},
    {id:'walkover',    icon:Swords,         label:'Walkover',            color:'text-orange-600'},
    {id:'cancel',      icon:AlertTriangle,  label:'Cancel Match',        color:'text-red-600'},
  ]
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[85dvh] flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
          <p className="font-bold text-navy-900">Match Controls</p>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        <div className="overflow-y-auto px-4 py-3 space-y-1.5 pb-8">
          {actions.map(a=>(
            <button key={a.id}
              disabled={a.disabled}
              onClick={()=>{if(!a.disabled){onAction(a.id);onClose()}}}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 active:scale-[0.98] transition-all text-left ${a.disabled?'opacity-30 cursor-not-allowed':''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.color} bg-white border border-slate-200 flex-shrink-0`}>
                <a.icon size={18}/>
              </div>
              <span className={`font-semibold text-sm ${a.color}`}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Cancel Match Modal ────────────────────────────────────────────────────────
function CancelMatchModal({onConfirm, onClose}) {
  const [reason, setReason] = useState('')
  const reasons = ['Rain / Bad Weather','Dispute','Fight','Ground Issue','Insufficient Players','Mutual Agreement','Other']
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5" onClick={e=>e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle size={22} className="text-red-500"/>
        </div>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Cancel Match?</h3>
        <p className="text-navy-500 text-sm mb-4">Select a reason for cancellation:</p>
        <div className="space-y-1.5 mb-5 max-h-52 overflow-y-auto">
          {reasons.map(r=>(
            <button key={r} onClick={()=>setReason(r)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${reason===r?'border-red-400 bg-red-50 text-red-700':'border-slate-200 text-navy-700 hover:border-slate-300'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-sm text-navy-600">Back</button>
          <button
            disabled={!reason}
            onClick={()=>onConfirm(reason)}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm disabled:opacity-40">
            Cancel Match
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Walkover Modal ────────────────────────────────────────────────────────────
function WalkoverModal({teams, onConfirm, onClose}) {
  const [winner, setWinner] = useState(null)
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5" onClick={e=>e.stopPropagation()}>
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
          <Swords size={22} className="text-orange-500"/>
        </div>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Walkover</h3>
        <p className="text-navy-500 text-sm mb-4">Which team wins by walkover?</p>
        <div className="space-y-2 mb-5">
          {teams.map(t=>(
            <button key={t.id} onClick={()=>setWinner(t)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${winner?.id===t.id?'border-orange-400 bg-orange-50 text-orange-800':'border-slate-200 text-navy-700 hover:border-slate-300'}`}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background:t.color||'#22c55e'}}/>
              {t.name}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-sm text-navy-600">Back</button>
          <button disabled={!winner} onClick={()=>onConfirm(winner)}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm disabled:opacity-40">
            Confirm Walkover
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Declare Winner Modal ──────────────────────────────────────────────────────
function DeclareWinnerModal({teams, onConfirm, onClose}) {
  const [winner, setWinner] = useState(null)
  const [reason, setReason] = useState('')
  const reasons = ['Superior Run Rate','Points Based','Toss (group stage)','Match Official Decision','Other']
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5" onClick={e=>e.stopPropagation()}>
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <Trophy size={22} className="text-amber-500"/>
        </div>
        <h3 className="font-bold text-navy-900 text-lg mb-1">Declare Winner</h3>
        <p className="text-navy-500 text-sm mb-3">Select winning team:</p>
        <div className="space-y-2 mb-3">
          {teams.map(t=>(
            <button key={t.id} onClick={()=>setWinner(t)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${winner?.id===t.id?'border-amber-400 bg-amber-50 text-amber-800':'border-slate-200 text-navy-700 hover:border-slate-300'}`}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background:t.color||'#22c55e'}}/>
              {t.name}
            </button>
          ))}
        </div>
        <p className="text-navy-500 text-sm mb-2">Reason:</p>
        <div className="space-y-1.5 mb-5 max-h-36 overflow-y-auto">
          {reasons.map(r=>(
            <button key={r} onClick={()=>setReason(r)}
              className={`w-full text-left px-3 py-2 rounded-xl border text-sm font-medium transition-all ${reason===r?'border-amber-400 bg-amber-50 text-amber-800':'border-slate-200 text-navy-600 hover:border-slate-300'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-sm text-navy-600">Back</button>
          <button disabled={!winner||!reason} onClick={()=>onConfirm(winner, reason)}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm disabled:opacity-40">
            Declare
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DLS Modal ─────────────────────────────────────────────────────────────────
function DLSModal({inn1, inn2, fullOvers, onApplyTarget, onClose}) {
  const currentRuns = inn2?.runs ?? (inn1?.runs ?? 0)
  const [t2OversAvail, setT2OversAvail] = useState(String(fullOvers))
  const [t2Wkts, setT2Wkts]             = useState(String(inn2?.wkts ?? 0))
  const [t1Score, setT1Score]            = useState(String(inn1?.runs ?? 0))

  const overs = parseFloat(t2OversAvail) || 0
  const wkts  = parseInt(t2Wkts) || 0
  const t1    = parseInt(t1Score) || 0
  const target = calcDLSTarget(t1, fullOvers, overs, wkts)
  const r1pct  = (dlsResources(fullOvers, 0)).toFixed(1)
  const r2pct  = (dlsResources(overs, wkts)).toFixed(1)

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-purple-600"/>
            <p className="font-bold text-navy-900 text-base">DLS Method Calculator</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        <div className="px-5 py-4 space-y-4 pb-8">
          <p className="text-navy-500 text-xs leading-relaxed bg-purple-50 rounded-xl px-3 py-2">
            Use when a match is interrupted. Enter the revised overs and wickets to get the DLS target automatically.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Team 1 Score</p>
              <input type="number" value={t1Score} onChange={e=>setT1Score(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
            </div>
            <div>
              <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">T2 Overs Avail</p>
              <input type="number" min="1" max={fullOvers} value={t2OversAvail} onChange={e=>setT2OversAvail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
            </div>
            <div>
              <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">T2 Wkts Lost</p>
              <input type="number" min="0" max="9" value={t2Wkts} onChange={e=>setT2Wkts(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
            </div>
          </div>

          {/* Resource summary */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-navy-500">
            <span>Team 1 Resources: <strong className="text-navy-800">{r1pct}%</strong></span>
            <span>Team 2 Resources: <strong className="text-navy-800">{r2pct}%</strong></span>
          </div>

          {/* DLS Target */}
          <div className="bg-purple-600 rounded-2xl px-5 py-4 text-center">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1">DLS Target for Team 2</p>
            <p className="text-white font-extrabold text-4xl">{target}</p>
            <p className="text-purple-200 text-xs mt-1">to win in {t2OversAvail} overs</p>
          </div>

          <button onClick={()=>onApplyTarget(target, parseFloat(t2OversAvail))}
            className="w-full py-3.5 rounded-2xl bg-purple-600 text-white font-bold text-sm">
            Apply DLS Target & End Innings
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Change Batsman Modal ─────────────────────────────────────────────────────
function ChangeBatsmanModal({inn, batXi, onSwapEnds, onRetire, onClose}) {
  const striker    = inn.striker ? playerById(inn.striker) : null
  const nonStriker = inn.nonStriker ? playerById(inn.nonStriker) : null
  const available  = batXi.filter(p=>!inn.dismissed?.includes(p.id)&&!inn.retiredHurt?.includes(p.id)&&p.id!==inn.striker&&p.id!==inn.nonStriker)
  const [mode, setMode] = useState(null) // 'retire_striker' | 'retire_nonstriker' | null

  if (mode) {
    const retiringId = mode==='retire_striker' ? inn.striker : inn.nonStriker
    return (
      <SelectPlayerModal
        title="Select Replacement Batsman"
        players={available}
        disabledIds={[]}
        onSelect={pid=>{onRetire(retiringId, pid);onClose()}}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg shadow-2xl animate-slide-up" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-center pt-3"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-navy-900">Change Batsman</p>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        <div className="px-4 py-4 space-y-2 pb-8">
          <button onClick={()=>{onSwapEnds();onClose()}}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 border-brand-200 bg-brand-50 hover:bg-brand-100 transition-all text-left">
            <ArrowLeftRight size={20} className="text-brand-600 flex-shrink-0"/>
            <div>
              <p className="font-bold text-brand-800 text-sm">Swap Ends</p>
              <p className="text-brand-600 text-xs">{striker?.name} ↔ {nonStriker?.name}</p>
            </div>
          </button>
          {striker&&(
            <button onClick={()=>setMode('retire_striker')}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left">
              <UserCheck size={20} className="text-amber-600 flex-shrink-0"/>
              <div>
                <p className="font-bold text-navy-800 text-sm">Replace Striker</p>
                <p className="text-navy-500 text-xs">Retire {striker.name}, bring new batter</p>
              </div>
            </button>
          )}
          {nonStriker&&(
            <button onClick={()=>setMode('retire_nonstriker')}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left">
              <UserCheck size={20} className="text-amber-600 flex-shrink-0"/>
              <div>
                <p className="font-bold text-navy-800 text-sm">Replace Non-Striker</p>
                <p className="text-navy-500 text-xs">Retire {nonStriker.name}, bring new batter</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SquadSetup ───────────────────────────────────────────────────────────────
function SquadSetup({assignment, tossResult, onStart, onClose}) {
  const { umpireCompletedMatches } = useStore()
  const t1 = teamById(assignment.team1Id)
  const t2 = teamById(assignment.team2Id)

  // Find most recent XI for a team from completed match history
  const findPrevXi = (teamId) => {
    const history = (umpireCompletedMatches || []).slice().reverse()
    for (const cm of history) {
      if (cm.inn1?.battingTeamId === teamId && (cm.inn1?.battingXi?.length || 0) >= 11)
        return { xi: cm.inn1.battingXi, fromHistory: true }
      if (cm.inn2?.battingTeamId === teamId && (cm.inn2?.battingXi?.length || 0) >= 11)
        return { xi: cm.inn2.battingXi, fromHistory: true }
    }
    // Fall back to first 11 from squad as smart default
    const def = (teamById(teamId)?.squad || []).slice(0, 11)
    return def.length >= 11 ? { xi: def, fromHistory: false } : null
  }

  const prev1 = findPrevXi(t1.id)
  const prev2 = findPrevXi(t2.id)
  const hasPrev = !!(prev1 && prev2)

  const [overs, setOvers]       = useState(String(assignment.defaultOvers||20))
  const [powerplay, setPowerplay] = useState('6')
  const [xi, setXi]             = useState({
    [t1.id]: prev1?.xi || [],
    [t2.id]: prev2?.xi || [],
  })
  const [activeTeam, setActiveTeam] = useState(t1.id)
  const [showAddMobile, setShowAddMobile] = useState(false)
  const [extraPlayers, setExtraPlayers] = useState({[t1.id]:[], [t2.id]:[]})
  // Show previous-XI confirmation popup when we have defaults
  const [showPrevPopup, setShowPrevPopup] = useState(hasPrev)

  const winnerBats   = tossResult.choice==='bat'
  const winnerTeamId = tossResult.winnerIdx===0?t1.id:t2.id
  const battingFirst = winnerBats?winnerTeamId:(winnerTeamId===t1.id?t2.id:t1.id)

  // ── Previous XI popup ──
  if (showPrevPopup) {
    const label1 = prev1?.fromHistory ? 'Last match XI' : 'Squad default XI'
    const label2 = prev2?.fromHistory ? 'Last match XI' : 'Squad default XI'
    const xi1Players = (prev1?.xi || []).map(id => playerById(id)).filter(Boolean)
    const xi2Players = (prev2?.xi || []).map(id => playerById(id)).filter(Boolean)
    return (
      <div className="fixed inset-0 z-[85] bg-slate-50 flex flex-col">
        {/* Header */}
        <div className="bg-navy-900 px-4 pt-safe-top pb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-white text-base">{assignment.teams}</h2>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <X size={16} className="text-white"/>
            </button>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-lg">🪙</span>
            <p className="text-amber-100 text-xs">
              <strong className="text-white">{tossResult.winnerName}</strong> won toss · elected to{' '}
              <strong className="text-white">{tossResult.choice==='bat'?'🏏 bat':'🧤 field'} first</strong>
            </p>
          </div>
        </div>

        {/* Overs config */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex gap-4 flex-shrink-0">
          <div className="flex-1">
            <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Overs</p>
            <input type="number" min="1" max="50" value={overs} onChange={e=>setOvers(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Powerplay Overs</p>
            <input type="number" min="0" max="20" value={powerplay} onChange={e=>setPowerplay(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
          </div>
        </div>

        {/* Pop-up content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">📋</span>
            <div>
              <p className="font-bold text-amber-900 text-sm">Previous Playing XI Found</p>
              <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                We've auto-selected the {prev1?.fromHistory || prev2?.fromHistory ? 'last match' : 'default squad'} XI for both teams.
                Confirm to start directly, or tap <strong>Re-select</strong> to make changes.
              </p>
            </div>
          </div>

          {/* Team 1 XI */}
          {[{ team: t1, players: xi1Players, label: label1 }, { team: t2, players: xi2Players, label: label2 }].map(({ team, players, label }) => (
            <div key={team.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: team.color || '#22c55e' }}/>
                <p className="font-bold text-navy-900 text-sm flex-1">{team.name}</p>
                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2 py-0.5">{label}</span>
              </div>
              <div className="px-4 py-2">
                {players.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                    <span className="w-5 text-center text-[11px] font-bold text-navy-400">{i+1}</span>
                    <p className="font-semibold text-navy-900 text-sm flex-1">{p.name}</p>
                    <p className="text-navy-400 text-xs">
                      {p.batting?.sr > 0 ? `SR ${p.batting.sr}` : p.bowling?.wkts > 0 ? `${p.bowling.wkts}W` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="px-4 pb-6 pt-3 border-t border-slate-100 bg-white flex-shrink-0 space-y-2">
          <button
            disabled={!parseInt(overs) >= 1}
            onClick={() => {
              onStart({
                xi1: xi[t1.id], xi2: xi[t2.id],
                overs: parseInt(overs), powerplay: parseInt(powerplay), battingFirst
              })
            }}
            className="btn-primary w-full py-4 text-base"
          >
            ✅ Use This XI & Start Match
          </button>
          <button
            onClick={() => setShowPrevPopup(false)}
            className="w-full py-3.5 rounded-2xl border-2 border-slate-300 font-bold text-sm text-navy-700 bg-white"
          >
            🔄 Re-select Players
          </button>
        </div>
      </div>
    )
  }

  const togglePlayer = pid => {
    setXi(prev=>{
      const cur=prev[activeTeam]
      return{...prev,[activeTeam]:cur.includes(pid)?cur.filter(id=>id!==pid):[...cur,pid]}
    })
  }

  const teams=[t1,t2]
  const activeT=teams.find(t=>t.id===activeTeam)
  const squadPlayers=(activeT?.squad||[]).map(id=>playerById(id)).filter(Boolean)
  const extra=extraPlayers[activeTeam]||[]
  const activePlayers=[...squadPlayers,...extra.filter(p=>!squadPlayers.find(s=>s.id===p.id))]
  const selected=xi[activeTeam]||[]
  const need=11

  const handleAddMobile=(player)=>{
    setExtraPlayers(prev=>({...prev,[activeTeam]:[...(prev[activeTeam]||[]),player]}))
  }

  const canStart=xi[t1.id].length>=need&&xi[t2.id].length>=need&&parseInt(overs)>=1

  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 flex flex-col">
      {showAddMobile&&(
        <AddByMobileSheet
          existingIds={activePlayers.map(p=>p.id)}
          onAdd={handleAddMobile}
          onClose={()=>setShowAddMobile(false)}
        />
      )}
      <div className="bg-navy-900 px-4 pt-safe-top pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-white text-base">{assignment.teams}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X size={16} className="text-white"/>
          </button>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-lg">🪙</span>
          <p className="text-amber-100 text-xs">
            <strong className="text-white">{tossResult.winnerName}</strong> won toss ·{' '}
            elected to <strong className="text-white">{tossResult.choice==='bat'?'🏏 bat':'🧤 field'} first</strong>
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-semibold text-amber-700">Batting first:</span>
        <span className="text-xs font-bold text-amber-900">{teamById(battingFirst)?.name}</span>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-3 flex gap-4 flex-shrink-0">
        <div className="flex-1">
          <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Overs</p>
          <input type="number" min="1" max="50" value={overs} onChange={e=>setOvers(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-navy-400 font-semibold uppercase mb-1">Powerplay Overs</p>
          <input type="number" min="0" max="20" value={powerplay} onChange={e=>setPowerplay(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-navy-900 outline-none focus:border-brand-400"/>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-200 p-1 mx-4 mt-3 rounded-2xl flex-shrink-0">
        {teams.map(t=>{
          const cnt=xi[t.id]?.length||0
          return(
            <button key={t.id} onClick={()=>setActiveTeam(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${activeTeam===t.id?'bg-white text-navy-900 shadow-sm':'text-navy-500'}`}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:t.color}}/>
              {t.name.split(' ')[0]}
              <span className={`text-[10px] px-1 rounded-full font-bold ${cnt>=need?'bg-green-100 text-green-700':'bg-slate-300 text-slate-600'}`}>{cnt}/{need}</span>
            </button>
          )
        })}
      </div>

      {/* Add by mobile button */}
      <div className="px-4 pt-3 flex-shrink-0">
        <button onClick={()=>setShowAddMobile(true)}
          className="flex items-center gap-2 text-brand-600 font-semibold text-sm bg-brand-50 border border-brand-200 rounded-xl px-4 py-2.5 w-full">
          <Phone size={14}/>
          <span>Add Player by Mobile Number</span>
          <Plus size={14} className="ml-auto"/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
        <p className="text-xs text-navy-400 font-medium mb-2">
          Select {need} players from {activeT?.name}'s squad ({activePlayers.length} available)
        </p>
        {activePlayers.map(p=>{
          const isSelected=selected.includes(p.id)
          const isExtra=extra.find(e=>e.id===p.id)
          return(
            <button key={p.id} onClick={()=>togglePlayer(p.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${isSelected?'border-brand-400 bg-brand-50':'border-slate-200 bg-white hover:border-brand-200'}`}>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected?'border-brand-500 bg-brand-500':'border-slate-300'}`}>
                {isSelected&&<Check size={12} className="text-white" strokeWidth={3}/>}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-navy-900 text-sm">{p.name}
                  {isExtra&&<span className="ml-1.5 text-[9px] font-bold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-1.5">Added</span>}
                </p>
                <p className="text-navy-400 text-[11px]">
                  {p.batting?.sr>0?`Bat SR ${p.batting.sr}`:''}
                  {p.batting?.sr>0&&p.bowling?.wkts>0?' · ':''}
                  {p.bowling?.wkts>0?`${p.bowling.wkts} wkts`:''}
                </p>
              </div>
              {isSelected&&<div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{selected.indexOf(p.id)+1}</div>}
            </button>
          )
        })}
      </div>

      <div className="px-4 pb-6 pt-3 border-t border-slate-100 bg-white flex-shrink-0">
        {!canStart&&(
          <p className="text-xs text-navy-400 text-center mb-2">
            {xi[t1.id].length<need&&`${t1.name}: need ${need-xi[t1.id].length} more · `}
            {xi[t2.id].length<need&&`${t2.name}: need ${need-xi[t2.id].length} more`}
          </p>
        )}
        <button disabled={!canStart}
          onClick={()=>onStart({xi1:xi[t1.id],xi2:xi[t2.id],overs:parseInt(overs),powerplay:parseInt(powerplay),battingFirst})}
          className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          Start Match →
        </button>
      </div>
    </div>
  )
}

// ─── InningsBreak ─────────────────────────────────────────────────────────────
function InningsBreak({inn1, config, onContinue}) {
  const bat=teamById(inn1.battingTeamId), bowl=teamById(inn1.bowlingTeamId)
  const target=inn1.runs+1
  return (
    <div className="fixed inset-0 z-[85] bg-navy-900 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{background:'linear-gradient(135deg,#fbbf24,#d97706)'}}>
        <span className="text-3xl">🏏</span>
      </div>
      <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-2">Innings Break</p>
      <h2 className="text-white font-extrabold text-2xl mb-1 text-center">{bat?.name}</h2>
      <p className="text-white text-3xl font-extrabold mb-1">{inn1.runs}/{inn1.wkts}</p>
      <p className="text-amber-200 text-sm mb-6">({fmtOvers(inn1.legalBalls)} overs)</p>
      <div className="bg-white/10 rounded-2xl px-6 py-4 mb-8 w-full max-w-sm text-center">
        <p className="text-amber-100 text-sm font-semibold mb-1">{bowl?.name} need</p>
        <p className="text-white font-extrabold text-4xl">{target}</p>
        <p className="text-amber-200 text-sm">to win in {config.overs} overs</p>
      </div>
      <button onClick={onContinue}
        className="w-full max-w-sm py-4 rounded-2xl font-bold text-lg text-navy-900"
        style={{background:'linear-gradient(135deg,#fbbf24,#d97706)'}}>
        Start 2nd Innings →
      </button>
    </div>
  )
}

// ─── MatchResult ──────────────────────────────────────────────────────────────
function MatchResult({inn1, inn2, result, specialOutcome, onClose}) {
  const winTeam=result?.winner?teamById(result.winner):null
  const t1=inn1?teamById(inn1.battingTeamId):null
  const t2=inn2?teamById(inn2.battingTeamId):null

  const InningsTable=({inn,label})=>{
    const team=teamById(inn.battingTeamId)
    const batters=inn.battingXi.map(id=>({id,p:playerById(id),b:inn.batters[id]||{runs:0,balls:0,fours:0,sixes:0,out:false}})).filter(x=>x.p)
    const bowlers=Object.entries(inn.bowlers).map(([id,b])=>({id,p:playerById(id),b})).filter(x=>x.p)
    const extras=inn.extras.wd+inn.extras.nb+inn.extras.b+inn.extras.lb
    return(
      <div className="mb-4">
        <div className="flex items-center justify-between bg-navy-900 rounded-t-xl px-3 py-2">
          <p className="text-white font-bold text-sm">{label} — {team?.name}</p>
          <p className="text-amber-300 font-extrabold text-sm">{inn.runs}/{inn.wkts} ({fmtOvers(inn.legalBalls)} ov)</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-navy-500 font-semibold">Batter</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">R</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">B</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">4s</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">6s</th>
                <th className="px-2 py-2 text-navy-500 font-semibold text-center">SR</th>
              </tr></thead>
              <tbody>
                {batters.map(({id,p,b})=>(
                  <tr key={id} className="border-b border-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-semibold text-navy-900">{p.name}</p>
                      <p className="text-navy-400">{inn.retiredHurt?.includes(id)?'retired hurt':b.out?b.how||'Out':inn.striker===id?'batting *':inn.nonStriker===id?'batting':'not out'}</p>
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-navy-900">{b.runs}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.balls}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.fours}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.sixes}</td>
                    <td className="px-2 py-2 text-center text-navy-500">{b.balls>0?((b.runs/b.balls)*100).toFixed(0):'-'}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50"><td colSpan={6} className="px-3 py-1.5 text-xs text-navy-500">
                  Extras: {extras} (wd {inn.extras.wd}, nb {inn.extras.nb}, b {inn.extras.b}, lb {inn.extras.lb})
                </td></tr>
              </tbody>
            </table>
          </div>
          {bowlers.length>0&&(
            <div className="border-t border-slate-200 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2 text-navy-500 font-semibold">Bowler</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">O</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">R</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">W</th>
                  <th className="px-2 py-2 text-navy-500 font-semibold text-center">Eco</th>
                </tr></thead>
                <tbody>
                  {bowlers.map(({id,p,b})=>(
                    <tr key={id} className="border-b border-slate-50">
                      <td className="px-3 py-2 font-semibold text-navy-900">{p.name}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{fmtOvers(b.balls)}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{b.runs}</td>
                      <td className="px-2 py-2 text-center font-bold text-navy-900">{b.wkts}</td>
                      <td className="px-2 py-2 text-center text-navy-500">{b.balls>0?(b.runs/(b.balls/6)).toFixed(1):'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return(
    <div className="fixed inset-0 z-[85] bg-slate-50 flex flex-col">
      <div className="bg-navy-900 px-4 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-amber-200 text-xs font-bold uppercase tracking-wide">Match Complete</p>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X size={15} className="text-white"/>
          </button>
        </div>
        {specialOutcome?(
          <div className="text-center">
            {specialOutcome.type==='cancelled'?(
              <>
                <p className="text-white font-extrabold text-xl mb-1">Match Cancelled</p>
                <p className="text-amber-300 font-semibold text-sm">Reason: {specialOutcome.reason}</p>
              </>
            ):specialOutcome.type==='walkover'?(
              <>
                <p className="text-white font-extrabold text-xl mb-1">{specialOutcome.winner?.name}</p>
                <p className="text-amber-300 font-bold text-base">won by Walkover 🏆</p>
              </>
            ):(
              <>
                <p className="text-white font-extrabold text-xl mb-1">{specialOutcome.winner?.name}</p>
                <p className="text-amber-300 font-bold text-base">declared winner 🏆</p>
                <p className="text-amber-200 text-xs mt-1">{specialOutcome.reason}</p>
              </>
            )}
          </div>
        ):result?.winner?(
          <div className="text-center">
            <p className="text-white font-extrabold text-xl mb-1">{winTeam?.name}</p>
            <p className="text-amber-300 font-bold text-base">won by {result.margin} 🏆</p>
          </div>
        ):(
          <p className="text-white font-extrabold text-xl text-center">Match Tied!</p>
        )}
        {inn1&&inn2&&(
          <div className="flex items-center justify-between mt-4 bg-white/10 rounded-xl px-4 py-2 text-xs text-amber-100">
            <span>{t1?.name}: {inn1.runs}/{inn1.wkts} ({fmtOvers(inn1.legalBalls)})</span>
            <span className="text-amber-300 font-bold">vs</span>
            <span>{t2?.name}: {inn2.runs}/{inn2.wkts} ({fmtOvers(inn2.legalBalls)})</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-amber-200 text-[11px]">
          <Lock size={10}/><span>Scorecard is now locked — read only</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {inn1&&<InningsTable inn={inn1} label="1st Innings"/>}
        {inn2&&<InningsTable inn={inn2} label="2nd Innings"/>}
      </div>
      <div className="px-4 pb-6 pt-2 border-t border-slate-100 bg-white flex-shrink-0">
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl bg-navy-900 text-white font-bold text-sm">
          Back to Assignments
        </button>
      </div>

    </div>
  )
}

// ─── ScoringScreen ────────────────────────────────────────────────────────────
function ScoringScreen({assignment, config, xi1, xi2, battingFirst, onComplete, onClose}) {
  const t1=teamById(assignment.team1Id), t2=teamById(assignment.team2Id)
  const team1Id=assignment.team1Id, team2Id=assignment.team2Id
  const inn1BatTeam=battingFirst, inn1BowTeam=battingFirst===team1Id?team2Id:team1Id
  const inn1Xi=battingFirst===team1Id?xi1:xi2
  const inn2Xi=battingFirst===team1Id?xi2:xi1

  const [innings,setInnings]=useState([createInning(inn1BatTeam,inn1BowTeam,inn1Xi),null])
  const [innIdx,setInnIdx]=useState(0)
  const [step,setStep]=useState('select_openers')
  const [wicketHow,setWicketHow]=useState(null)
  const [opener1,setOpener1]=useState(null)
  const [showMenu,setShowMenu]=useState(false)
  const [modal,setModal]=useState(null) // 'cancel'|'walkover'|'declare_win'|'dls'|'change_bat'|'change_bowl'|'retired_hurt'|'declare_out'
  const [history,setHistory]=useState([]) // undo stack — snapshots of inn state
  const [dlsPending,setDlsPending]=useState(null) // {target, overs} for 2nd innings

  const inn=innings[innIdx]
  const batTeam=inn?teamById(inn.battingTeamId):null
  const bowTeam=inn?teamById(inn.bowlingTeamId):null
  const batXi  =inn?inn.battingXi.map(id=>playerById(id)).filter(Boolean):[]
  const bowXi  =innIdx===0?(battingFirst===team1Id?xi2:xi1).map(id=>playerById(id)).filter(Boolean)
                         :(battingFirst===team1Id?xi1:xi2).map(id=>playerById(id)).filter(Boolean)

  const availableBatsmen=batXi.filter(p=>
    !inn?.dismissed?.includes(p.id)&&
    !inn?.retiredHurt?.includes(p.id)&&
    p.id!==inn?.striker&&p.id!==inn?.nonStriker
  )
  const availableBowlers=bowXi.filter(p=>p.id!==inn?.lastBowler)

  const updateInn=updated=>setInnings(prev=>{const a=[...prev];a[innIdx]=updated;return a})

  const pushHistory=()=>setHistory(prev=>[...prev,JSON.parse(JSON.stringify(inn))])

  const handleUndo=()=>{
    if(!history.length)return
    updateInn(history[history.length-1])
    setHistory(h=>h.slice(0,-1))
    setStep('scoring')
  }

  const handleBall=(type,runs=0)=>{
    if(!inn||!inn.striker||!inn.currentBowler)return
    if(type==='wkt'){setStep('wicket');return}
    pushHistory()
    const updated=applyBall(inn,type,runs,config.overs)
    updateInn(updated)
    if(updated.completed){
      if(innIdx===0){setStep('inning_break')}
      else{const r=computeResult(innings[0],updated);onComplete(innings[0],updated,r)}
      return
    }
    if(updated.currentBowler===null&&!updated.completed)setStep('select_bowler')
  }

  const handleWicketHow=how=>{setWicketHow(how);setStep('new_batsman')}

  const handleNewBatsman=pid=>{
    if(!inn)return
    pushHistory()
    const updated=applyBall(inn,'wkt',0,config.overs)
    updated.batters[inn.striker]={...updated.batters[inn.striker],how:wicketHow}
    if(pid)updated.striker=pid
    updateInn(updated);setWicketHow(null)
    if(updated.completed){
      if(innIdx===0){setStep('inning_break');return}
      // Check DLS
      if(dlsPending&&updated.runs>=dlsPending.target){
        const r=computeResult(innings[0],updated);onComplete(innings[0],updated,r);return
      }
      const r=computeResult(innings[0],updated);onComplete(innings[0],updated,r);return
    }
    if(updated.currentBowler===null){setStep('select_bowler');return}
    setStep('scoring')
  }

  const handleSelectBowler=pid=>{
    if(!inn)return
    updateInn({...inn,currentBowler:pid});setStep('scoring')
  }

  const handleSelectOpeners=(strikerId,nonStrikerId)=>{
    if(!inn)return
    const updated={...inn,striker:strikerId,nonStriker:nonStrikerId}
    if(!updated.batters[strikerId])updated.batters[strikerId]={runs:0,balls:0,fours:0,sixes:0,out:false,how:null}
    if(!updated.batters[nonStrikerId])updated.batters[nonStrikerId]={runs:0,balls:0,fours:0,sixes:0,out:false,how:null}
    updateInn(updated);setStep('select_bowler')
  }

  const handleStartSecondInnings=()=>{
    const newInn=createInning(inn1BowTeam,inn1BatTeam,inn2Xi)
    setInnings(prev=>[prev[0],newInn]);setInnIdx(1);setStep('select_openers')
    setHistory([])
  }

  // ── Special actions ──
  const handleAction=id=>{
    if(id==='undo'){handleUndo();return}
    setModal(id)
  }

  const handleCancelMatch=reason=>{
    setModal(null)
    onComplete(
      innings[0]||createInning(inn1BatTeam,inn1BowTeam,inn1Xi),
      innings[1]||createInning(inn1BowTeam,inn1BatTeam,inn2Xi),
      null,
      {type:'cancelled',reason}
    )
  }

  const handleWalkover=winner=>{
    setModal(null)
    onComplete(
      innings[0]||createInning(inn1BatTeam,inn1BowTeam,inn1Xi),
      innings[1]||createInning(inn1BowTeam,inn1BatTeam,inn2Xi),
      null,
      {type:'walkover',winner}
    )
  }

  const handleDeclareWinner=(winner,reason)=>{
    setModal(null)
    onComplete(
      innings[0]||createInning(inn1BatTeam,inn1BowTeam,inn1Xi),
      innings[1]||createInning(inn1BowTeam,inn1BatTeam,inn2Xi),
      null,
      {type:'declared',winner,reason}
    )
  }

  const handleApplyDLS=(target,overs)=>{
    setModal(null)
    if(innIdx===0){
      // DLS applied in 1st innings — mark inn1 complete and move to 2nd innings
      const updatedInn1={...inn,completed:true}
      setInnings([updatedInn1,null])
      setDlsPending({target,overs})
      setStep('inning_break')
    } else {
      // DLS in 2nd innings — update target display
      setDlsPending({target,overs})
    }
  }

  // Change batsman (swap ends or retire+replace)
  const handleSwapEnds=()=>{
    if(!inn)return
    updateInn({...inn,striker:inn.nonStriker,nonStriker:inn.striker})
  }

  const handleRetireBatsman=(retiringId,newBatsmanId)=>{
    if(!inn)return
    const updated={...JSON.parse(JSON.stringify(inn)),
      retiredHurt:[...(inn.retiredHurt||[]),retiringId]
    }
    if(retiringId===inn.striker)updated.striker=newBatsmanId
    else updated.nonStriker=newBatsmanId
    if(newBatsmanId&&!updated.batters[newBatsmanId])
      updated.batters[newBatsmanId]={runs:0,balls:0,fours:0,sixes:0,out:false,how:null}
    updateInn(updated)
  }

  // Change bowler mid-over
  const handleChangeBowler=pid=>{
    if(!inn)return
    updateInn({...inn,currentBowler:pid})
    setModal(null)
  }

  // Retired hurt (from menu shortcut — retires striker, selects new)
  const handleRetiredHurt=()=>{
    if(!inn)return
    const updated={...JSON.parse(JSON.stringify(inn)),
      retiredHurt:[...(inn.retiredHurt||[]),inn.striker],
      striker:null
    }
    setModal(null)
    updateInn(updated)
    setStep('new_batsman')
  }

  // Declare batsman out (umpire discretion)
  const handleDeclareOut=how=>{
    setModal(null)
    if(!inn)return
    pushHistory()
    const updated=applyBall(inn,'wkt',0,config.overs)
    updated.batters[inn.striker]={...updated.batters[inn.striker],how:how||'Declared Out'}
    updateInn(updated)
    if(updated.completed){
      if(innIdx===0){setStep('inning_break');return}
      const r=computeResult(innings[0],updated);onComplete(innings[0],updated,r);return
    }
    if(updated.currentBowler===null){setStep('select_bowler');return}
    setStep('new_batsman')
    setWicketHow(how||'Declared Out')
  }

  // ── Modal renders ──
  if(step==='select_openers') {
    if(!opener1) return <SelectPlayerModal title={`${batTeam?.name} — Select Striker`} players={batXi} disabledIds={[]} onSelect={id=>setOpener1(id)}/>
    return <SelectPlayerModal title={`${batTeam?.name} — Select Non-Striker`} players={batXi} disabledIds={[opener1]} onSelect={id=>{handleSelectOpeners(opener1,id);setOpener1(null)}}/>
  }
  if(step==='select_bowler') return <SelectPlayerModal title={`${bowTeam?.name} — Select Bowler${inn?.allOvers?.length>0?` (Over ${inn.allOvers.length+1})`:' (Opening)'}`} players={availableBowlers} disabledIds={[]} onSelect={handleSelectBowler}/>
  if(step==='wicket') return <WicketModal onSelect={handleWicketHow} onClose={()=>setStep('scoring')}/>
  if(step==='new_batsman') return <SelectPlayerModal title="Select New Batsman" players={availableBatsmen} disabledIds={[]} onSelect={handleNewBatsman} allowNull={true}/>
  if(step==='inning_break') return <InningsBreak inn1={innings[0]} config={config} onContinue={handleStartSecondInnings}/>

  // ── Main scoring UI ──
  const target=innIdx===1&&innings[0]?(dlsPending?dlsPending.target:innings[0].runs+1):null
  const needed=target?(target-(inn?.runs||0)):null
  const ballsLeft=inn?config.overs*6-inn.legalBalls:0
  const striker=inn?.striker?playerById(inn.striker):null
  const nonStriker=inn?.nonStriker?playerById(inn.nonStriker):null
  const currentBowler=inn?.currentBowler?playerById(inn.currentBowler):null
  const batSt=inn?.batters?.[inn?.striker]||{}
  const batNS=inn?.batters?.[inn?.nonStriker]||{}
  const bowSt=inn?.bowlers?.[inn?.currentBowler]||{}
  const isPP=inn?(Math.floor(inn.legalBalls/6)<config.powerplay):false
  const oversInPP=config.powerplay-Math.floor((inn?.legalBalls||0)/6)

  const PAD_RUNS=[
    {label:'0',type:'run',runs:0,cls:'bg-slate-100 text-navy-700'},
    {label:'1',type:'run',runs:1,cls:'bg-slate-100 text-navy-700'},
    {label:'2',type:'run',runs:2,cls:'bg-slate-100 text-navy-700'},
    {label:'3',type:'run',runs:3,cls:'bg-slate-100 text-navy-700'},
    {label:'4',type:'run',runs:4,cls:'bg-brand-100 text-brand-700 font-extrabold'},
    {label:'6',type:'run',runs:6,cls:'bg-purple-100 text-purple-700 font-extrabold'},
  ]
  const PAD_EXT=[
    {label:'W',  type:'wkt',runs:0,cls:'bg-red-500 text-white font-extrabold'},
    {label:'Wd', type:'wd', runs:0,cls:'bg-amber-400 text-white font-bold'},
    {label:'Nb', type:'nb', runs:0,cls:'bg-orange-400 text-white font-bold'},
    {label:'B',  type:'b',  runs:1,cls:'bg-blue-100 text-blue-700'},
    {label:'Lb', type:'lb', runs:1,cls:'bg-blue-100 text-blue-700'},
  ]

  return (
    <div className="fixed inset-0 z-[80] flex flex-col" style={{background:'#0a1128'}}>
      {/* Modals */}
      {showMenu&&<ScoringActionsMenu inn={inn} innIdx={innIdx} hasHistory={history.length>0} onAction={handleAction} onClose={()=>setShowMenu(false)}/>}
      {modal==='cancel'&&<CancelMatchModal onConfirm={handleCancelMatch} onClose={()=>setModal(null)}/>}
      {modal==='walkover'&&<WalkoverModal teams={[t1,t2]} onConfirm={handleWalkover} onClose={()=>setModal(null)}/>}
      {modal==='declare_win'&&<DeclareWinnerModal teams={[t1,t2]} onConfirm={handleDeclareWinner} onClose={()=>setModal(null)}/>}
      {modal==='dls'&&<DLSModal inn1={innings[0]} inn2={innIdx===1?inn:null} fullOvers={config.overs} onApplyTarget={handleApplyDLS} onClose={()=>setModal(null)}/>}
      {modal==='change_bat'&&inn&&(
        <ChangeBatsmanModal inn={inn} batXi={batXi} onSwapEnds={()=>{handleSwapEnds();setModal(null)}} onRetire={(rid,nid)=>{handleRetireBatsman(rid,nid);setModal(null)}} onClose={()=>setModal(null)}/>
      )}
      {modal==='change_bowl'&&(
        <div className="fixed inset-0 z-[95] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setModal(null)}/>
          <div className="relative w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <SelectPlayerModal title={`${bowTeam?.name} — Change Bowler`} players={availableBowlers} disabledIds={[]} onSelect={handleChangeBowler}/>
          </div>
        </div>
      )}
      {modal==='retired_hurt'&&inn?.striker&&(
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setModal(null)}/>
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4"><UserCheck size={22} className="text-amber-500"/></div>
            <h3 className="font-bold text-navy-900 text-lg mb-1">Retired Hurt</h3>
            <p className="text-navy-500 text-sm mb-5">Mark <strong>{striker?.name}</strong> as retired hurt? They will be removed from the crease and a new batsman selected.</p>
            <div className="flex gap-3">
              <button onClick={()=>setModal(null)} className="flex-1 py-3 rounded-xl border border-slate-200 font-semibold text-sm">Cancel</button>
              <button onClick={handleRetiredHurt} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm">Confirm</button>
            </div>
          </div>
        </div>
      )}
      {modal==='declare_out'&&inn?.striker&&(
        <WicketModal onSelect={handleDeclareOut} onClose={()=>setModal(null)}/>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div>
          <p className="text-amber-200 text-[10px] font-semibold uppercase tracking-wider">
            {innIdx===0?'1st Innings':'2nd Innings'} · {batTeam?.name}
            {isPP&&<span className="ml-2 text-[9px] bg-amber-400/20 text-amber-300 rounded-full px-1.5 py-0.5">POWERPLAY</span>}
          </p>
          <p className="text-slate-400 text-[10px]">{assignment.teams}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo shortcut */}
          {history.length>0&&(
            <button onClick={handleUndo} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center" aria-label="Undo">
              <CornerUpLeft size={15} className="text-amber-300"/>
            </button>
          )}
          <button onClick={()=>setShowMenu(true)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center" aria-label="Match controls">
            <MoreVertical size={15} className="text-white"/>
          </button>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <X size={15} className="text-white"/>
          </button>
        </div>
      </div>

      {/* Score */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex items-end gap-3">
          <p className="text-white font-extrabold leading-none" style={{fontSize:44}}>
            {inn?.runs||0}<span className="text-slate-400 text-2xl">/{inn?.wkts||0}</span>
          </p>
          <div className="mb-2">
            <p className="text-amber-300 font-bold text-lg">{fmtOvers(inn?.legalBalls||0)} ov</p>
            <p className="text-slate-400 text-xs">RR {runRate(inn?.runs||0,inn?.legalBalls||0)}</p>
          </div>
        </div>
        {target&&(
          <div className="flex items-center gap-3 mt-1">
            <span className="text-amber-300 text-sm font-semibold">Need {needed} off {ballsLeft} balls</span>
            <span className="text-slate-500 text-xs">Target: {target}{dlsPending?' (DLS)':''}</span>
          </div>
        )}
      </div>

      {/* Batters */}
      <div className="bg-white/5 mx-4 rounded-2xl px-3 py-2.5 mb-2 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-brand-400 text-xs font-bold">🏏</span>
          {striker?(
            <div className="flex-1 flex items-center justify-between">
              <span className="text-white font-bold text-sm">{striker.name}<span className="text-amber-300 text-xs"> *</span></span>
              <span className="text-white font-extrabold tabular-nums text-sm">{batSt.runs||0}<span className="text-slate-400 text-xs"> ({batSt.balls||0})</span></span>
            </div>
          ):<span className="text-slate-500 text-sm italic">Select batsman</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs font-bold">•</span>
          {nonStriker?(
            <div className="flex-1 flex items-center justify-between">
              <span className="text-slate-300 text-sm">{nonStriker.name}</span>
              <span className="text-slate-300 tabular-nums text-sm">{batNS.runs||0}<span className="text-slate-500 text-xs"> ({batNS.balls||0})</span></span>
            </div>
          ):<span className="text-slate-500 text-sm italic">Select non-striker</span>}
        </div>
      </div>

      {/* Bowler + over */}
      <div className="bg-white/5 mx-4 rounded-2xl px-3 py-2 mb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          {currentBowler?(
            <>
              <span className="text-slate-300 text-sm">{currentBowler.name}</span>
              <span className="text-slate-400 text-xs tabular-nums">
                {fmtOvers(bowSt.balls||0)}-{bowSt.runs||0}-{bowSt.wkts||0}
                {bowSt.wd>0?` wd${bowSt.wd}`:''}{ bowSt.nb>0?` nb${bowSt.nb}`:''}
              </span>
            </>
          ):<span className="text-amber-400 text-sm font-semibold italic">Select bowler...</span>}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-slate-500 text-[10px] font-medium mr-1">This over:</span>
          {(inn?.thisOverBalls||[]).map((b,i)=><BallPill key={i} sym={b}/>)}
          {(inn?.thisOverBalls||[]).length===0&&<span className="text-slate-600 text-xs">—</span>}
        </div>
      </div>

      {/* Previous overs */}
      {(inn?.allOvers||[]).length>0&&(
        <div className="mx-4 mb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {inn.allOvers.slice(-4).map((over,i)=>{
              const overRuns=over.reduce((s,b)=>{
                if(b==='.'||b==='W')return s
                const n=parseInt(b.replace(/[^\d]/g,''))
                return s+(isNaN(n)?(b.startsWith('Wd')||b.startsWith('Nb')?1:0):n)
              },0)
              return(
                <div key={i} className="bg-white/5 rounded-xl px-2 py-1.5 flex-shrink-0 text-center">
                  <p className="text-slate-400 text-[9px] font-semibold mb-1">Ov {inn.allOvers.length-(inn.allOvers.slice(-4).length-1-i)}</p>
                  <div className="flex gap-0.5">{over.map((b,j)=><BallPill key={j} sym={b}/>)}</div>
                  <p className="text-slate-400 text-[9px] mt-1">{overRuns} runs</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Scoring pad */}
      <div className="flex-1 flex flex-col justify-end px-4 pb-6 flex-shrink-0">
        <div className="grid grid-cols-6 gap-2 mb-2">
          {PAD_RUNS.map(btn=>(
            <button key={btn.label}
              disabled={!inn?.striker||!inn?.currentBowler}
              onClick={()=>handleBall(btn.type,btn.runs)}
              className={`py-4 rounded-2xl text-lg font-extrabold transition-all active:scale-90 disabled:opacity-30 ${btn.cls}`}>
              {btn.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {PAD_EXT.map(btn=>(
            <button key={btn.label}
              disabled={btn.label!=='Wd'&&btn.label!=='Nb'&&(!inn?.striker||!inn?.currentBowler)}
              onClick={()=>handleBall(btn.type,btn.runs)}
              className={`py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-90 disabled:opacity-30 ${btn.cls}`}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main UmpireMatchSession ──────────────────────────────────────────────────
export default function UmpireMatchSession({assignment, tossResult, onClose, onMatchSaved}) {
  const [phase,setPhase]=useState('squad')
  const [matchConfig,setMatchConfig]=useState(null)
  const [resultData,setResultData]=useState(null)

  const handleStart=cfg=>{setMatchConfig(cfg);setPhase('scoring')}

  const handleMatchComplete=(inn1,inn2,result,specialOutcome=null)=>{
    const data={inn1,inn2,result,specialOutcome}
    setResultData(data)
    setPhase('result')
    // Notify parent immediately so data is persisted
    if(onMatchSaved) onMatchSaved(data)
  }

  if(phase==='squad') return <SquadSetup assignment={assignment} tossResult={tossResult} onStart={handleStart} onClose={onClose}/>

  if(phase==='scoring'&&matchConfig) return(
    <ScoringScreen
      assignment={assignment}
      config={{overs:matchConfig.overs,powerplay:matchConfig.powerplay}}
      xi1={matchConfig.xi1} xi2={matchConfig.xi2}
      battingFirst={matchConfig.battingFirst}
      tossResult={tossResult}
      onComplete={handleMatchComplete}
      onClose={onClose}
    />
  )

  if(phase==='result'&&resultData) return(
    <MatchResult
      inn1={resultData.inn1} inn2={resultData.inn2}
      result={resultData.result}
      specialOutcome={resultData.specialOutcome}
      config={matchConfig}
      onClose={onClose}
    />
  )

  return null
}
