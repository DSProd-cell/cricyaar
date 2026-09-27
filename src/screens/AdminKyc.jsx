import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import TopBar from '../components/TopBar'
import { ShieldCheck, CheckCircle, XCircle, Clock, RefreshCw, Phone, User } from 'lucide-react'

const STATUS_TABS = [
  { key: 'pending',  label: 'Pending',  color: '#d97706' },
  { key: 'approved', label: 'Approved', color: '#16a34a' },
  { key: 'rejected', label: 'Rejected', color: '#dc2626' },
]

export default function AdminKyc() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()

  // All hooks must come before any conditional return
  const [tab, setTab]               = useState('pending')
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [acting, setActing]         = useState(null)
  const [accessChecked, setAccessChecked] = useState(false)
  const [hasAccess, setHasAccess]   = useState(false)

  // Check admin access from Supabase (not stale in-memory store)
  useEffect(() => {
    if (!user?.id) { setAccessChecked(true); return }
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => {
        setHasAccess(data?.role === 'admin')
        setAccessChecked(true)
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecords = useCallback(async (status) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, username, phone, role, city, kyc_status, updated_at')
      .eq('kyc_status', status)
      .order('updated_at', { ascending: false })
    setLoading(false)
    if (error) { addToast('Failed to load KYC records', 'error'); return }
    setRecords(data || [])
  }, [addToast])

  // Only fetch records once access is confirmed
  useEffect(() => {
    if (accessChecked && hasAccess) fetchRecords(tab)
  }, [tab, accessChecked, hasAccess, fetchRecords])

  const handleApprove = async (profileId, name) => {
    setActing(profileId)
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: 'approved', kyc_approved_at: new Date().toISOString() })
      .eq('id', profileId)
    setActing(null)
    if (error) { addToast('Failed to approve', 'error'); return }
    addToast(`✓ ${name || 'User'} KYC approved`, 'success')
    setRecords(r => r.filter(x => x.id !== profileId))
  }

  const handleReject = async (profileId, name) => {
    setActing(profileId)
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: 'rejected' })
      .eq('id', profileId)
    setActing(null)
    if (error) { addToast('Failed to reject', 'error'); return }
    addToast(`✗ ${name || 'User'} KYC rejected`, 'info')
    setRecords(r => r.filter(x => x.id !== profileId))
  }

  // ── Conditional renders after all hooks ──────────────────────────────────
  if (!accessChecked) return (
    <div className="min-h-dvh flex items-center justify-center">
      <span className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!hasAccess) return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6">
      <ShieldCheck size={48} className="text-navy-300" />
      <p className="text-navy-600 font-semibold text-center">Admin access only.<br />You don't have permission to view this page.</p>
      <button onClick={() => navigate(-1)} className="btn-primary px-6">Go Back</button>
    </div>
  )

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--cy-bg)' }}>
      <TopBar title="KYC Approvals" subtitle="Admin panel" />

      {/* Tabs */}
      <div className="flex border-b sticky top-[56px] z-10" style={{ background: 'var(--cy-surface)', borderColor: 'var(--cy-border)' }}>
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-3 text-sm font-semibold transition-colors relative"
            style={{ color: tab === t.key ? t.color : 'var(--cy-navy-400)' }}
          >
            {t.label}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: t.color }} />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => fetchRecords(tab)}
            className="flex items-center gap-1.5 text-xs text-navy-500 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: 'var(--cy-border)' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-navy-400 text-sm">Loading…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShieldCheck size={40} className="text-navy-200" />
            <p className="text-navy-400 text-sm font-medium">No {tab} KYC requests</p>
          </div>
        ) : (
          records.map(p => (
            <div key={p.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--cy-surface)', border: '1.5px solid var(--cy-border)' }}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
                  {(p.name || p.username || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--cy-navy-900)' }}>{p.name || p.username || 'Unknown'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cy-navy-400)' }}>
                    {p.role} · {p.city || 'Unknown city'}
                  </p>
                </div>
                <StatusBadge status={p.kyc_status} />
              </div>

              <div className="px-4 pb-3 flex flex-wrap gap-3">
                {p.phone && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--cy-navy-500)' }}>
                    <Phone size={11} />{p.phone}
                  </span>
                )}
                {p.username && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--cy-navy-500)' }}>
                    <User size={11} />@{p.username}
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--cy-navy-400)' }}>
                  Submitted {formatDate(p.updated_at)}
                </span>
              </div>

              {tab === 'pending' && (
                <div className="flex border-t" style={{ borderColor: 'var(--cy-border)' }}>
                  <button
                    onClick={() => handleReject(p.id, p.name)}
                    disabled={acting === p.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-r"
                    style={{ borderColor: 'var(--cy-border)' }}
                  >
                    {acting === p.id ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle size={16} />}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(p.id, p.name)}
                    disabled={acting === p.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
                  >
                    {acting === p.id ? <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 'approved') return (
    <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg flex items-center gap-1">
      <CheckCircle size={11} /> Approved
    </span>
  )
  if (status === 'rejected') return (
    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg flex items-center gap-1">
      <XCircle size={11} /> Rejected
    </span>
  )
  return (
    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1">
      <Clock size={11} /> Pending
    </span>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
