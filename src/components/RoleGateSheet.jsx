import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Lock, ShieldCheck, Crown, X, Clock, AlertTriangle } from 'lucide-react'
import { isKycValid } from './RoleStrip'

const ROLE_INFO = {
  player: {
    emoji: '🏏', label: 'Player', color: '#a855f7',
    glow: 'rgba(168,85,247,0.35)',
  },
  organiser: {
    emoji: '📋', label: 'Organiser', color: '#22c55e',
    glow: 'rgba(34,197,94,0.35)',
    desc: 'Create and manage matches, build tournaments, handle team registrations.',
  },
  umpire: {
    emoji: '⚖️', label: 'Umpire', color: '#f97316',
    glow: 'rgba(249,115,22,0.35)',
    desc: 'Get assigned to matches, build your officiating record, earn trust from teams.',
  },
  ground_owner: {
    emoji: '🏟️', label: 'Ground Owner', color: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    desc: 'List your ground, set pricing, manage bookings and fill every slot.',
  },
}

export default function RoleGateSheet({ role, onClose }) {
  const navigate = useNavigate()
  const { user } = useStore()

  const info = ROLE_INFO[role]
  if (!info) return null

  const kycStatus   = user?.kycStatus
  const kycApprovedAt = user?.kycApprovedAt
  const isPro       = user?.subscription === 'pro_active' ||
    (user?.subscription === 'pro_cancelled' && user?.pro_renewal_date && new Date(user.pro_renewal_date) > new Date())
  const kycValid    = isKycValid(user)            // approved + within 3 months
  const kycApproved = kycStatus === 'approved'    // ever approved (may be expired)
  const kycExpired  = kycApproved && !kycValid    // approved but older than 3 months
  // Umpire only needs Pro — no KYC required
  const needsKyc    = role !== 'umpire'

  // How many months since approval
  const monthsSince = kycApprovedAt
    ? Math.floor((Date.now() - new Date(kycApprovedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md animate-slide-up"
        style={{
          background: 'linear-gradient(170deg, #1a0e35 0%, #0d0620 100%)',
          borderRadius: '24px 24px 0 0',
          borderTop: `1.5px solid ${info.color}40`,
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag pill */}
        <div style={{ width: 36, height: 4, borderRadius: 2, margin: '12px auto 0', background: 'rgba(255,255,255,0.2)' }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <X size={14} color="rgba(255,255,255,0.5)" />
        </button>

        {/* Header */}
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: '0 auto 12px',
            background: `${info.color}18`,
            border: `1.5px solid ${info.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>{info.emoji}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <Lock size={14} color={info.color} />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{info.label} Role Locked</span>
          </div>
          {info.desc && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
              {info.desc}
            </p>
          )}
        </div>

        {/* Steps */}
        <div style={{ padding: '20px 16px 0' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            Complete {needsKyc ? 'these steps' : 'this step'} to unlock
          </p>

          {/* Step 1 — KYC (only for Organiser + Ground Owner) */}
          {needsKyc && (
            <>
              <GateStep
                num={1}
                icon={<ShieldCheck size={16} color={kycValid ? '#4ade80' : kycExpired ? '#ef4444' : '#f59e0b'} />}
                title="Identity verification (KYC)"
                desc={
                  kycValid    ? 'Aadhaar verified ✓ — valid for 3 months' :
                  kycExpired  ? `Expired after 3 months — last verified ${monthsSince}mo ago` :
                  kycStatus === 'pending' ? 'Under review — 24–48 hrs' :
                  'Submit your Aadhaar ID — valid for 3 months'
                }
                status={kycValid ? 'done' : kycExpired ? 'expired' : kycStatus === 'pending' ? 'pending' : 'todo'}
                actionLabel={kycValid ? null : kycStatus === 'pending' ? 'Pending review' : kycExpired ? 'Re-verify →' : 'Start KYC →'}
                onAction={(kycValid || kycStatus === 'pending') ? null : () => { onClose(); navigate('/aadhaar-verify') }}
              />
              <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.08)', margin: '0 0 0 31px' }} />
            </>
          )}

          {/* Pro step — always shown */}
          <GateStep
            num={needsKyc ? 2 : 1}
            icon={<Crown size={16} color={isPro ? '#4ade80' : '#f59e0b'} />}
            title="Upgrade to CricYaar Pro"
            desc={isPro ? 'Pro active ✓' : '₹1/month · earn free via referrals'}
            status={isPro ? 'done' : 'todo'}
            actionLabel={isPro ? null : 'Upgrade — ₹1/mo →'}
            onAction={isPro ? null : () => { onClose(); navigate('/pro') }}
          />
        </div>

        {/* CTA */}
        <div style={{ padding: '20px 16px 0' }}>
          {(needsKyc ? (kycValid && isPro) : isPro) ? (
            <div style={{
              padding: '14px', borderRadius: 14, textAlign: 'center',
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>
                🎉 {needsKyc ? 'Both steps' : 'Step'} complete! Tap to reload.
              </p>
            </div>
          ) : (
            <button
              onClick={() => { onClose(); navigate(needsKyc && !kycValid ? '/aadhaar-verify' : '/pro') }}
              style={{
                width: '100%', padding: '15px', borderRadius: 14, border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: 15, color: '#fff',
                background: `linear-gradient(135deg, ${info.color}cc, ${info.color})`,
                boxShadow: `0 6px 22px ${info.glow}`,
              }}
            >
              {needsKyc && kycExpired ? 'Re-verify KYC →' :
               needsKyc && !kycValid  ? 'Start KYC Verification →' :
               'Upgrade to Pro →'}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              width: '100%', marginTop: 10, padding: '12px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.5)',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

function GateStep({ num, icon, title, desc, status, actionLabel, onAction }) {
  const isDone    = status === 'done'
  const isExpired = status === 'expired'
  const isPending = status === 'pending'
  const statusColor = isDone ? '#4ade80' : isExpired ? '#ef4444' : isPending ? '#f59e0b' : 'rgba(255,255,255,0.25)'
  const bgColor     = isDone ? 'rgba(74,222,128,0.06)' : isExpired ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'
  const numBg       = isDone ? 'rgba(74,222,128,0.2)' : isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'
  const numColor    = isDone ? '#4ade80' : isExpired ? '#ef4444' : 'rgba(255,255,255,0.5)'
  const titleColor  = isDone ? '#4ade80' : isExpired ? '#f87171' : '#fff'
  const descColor   = isExpired ? '#f87171' : isPending ? '#f59e0b' : 'rgba(255,255,255,0.4)'

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 14px', borderRadius: 14,
      background: bgColor,
      border: `1px solid ${statusColor}${isExpired ? '50' : '30'}`,
      marginBottom: 0,
    }}>
      {/* Number / status badge */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: numBg,
        border: `1.5px solid ${statusColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800,
        color: numColor,
      }}>
        {isDone ? '✓' : isExpired ? '!' : num}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: titleColor, marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 11, color: descColor }}>{desc}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            flexShrink: 0, padding: '5px 10px', borderRadius: 20,
            border: `1px solid ${isExpired ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.15)'}`,
            background: isExpired ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)',
            fontSize: 11, fontWeight: 700,
            color: isExpired ? '#f87171' : '#fff',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {actionLabel}
        </button>
      )}
      {isPending && (
        <Clock size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
      )}
      {isExpired && (
        <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
      )}
    </div>
  )
}
