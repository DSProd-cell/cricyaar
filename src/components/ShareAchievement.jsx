import { useState, useRef, useEffect, useCallback } from 'react'
import { Share2, X, Download, Copy, CheckCircle, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRoleColor } from '../lib/roleColors'

// ── Canvas image generator ────────────────────────────────────────────────────
async function generateAchievementImage({ title, stats, matchName, tournamentName, roleColor, userName }) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, roleColor.gradientFrom)
  bg.addColorStop(1, roleColor.gradientTo)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  for (let x = 24; x < W; x += 40) {
    for (let y = 24; y < H; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
    }
  }

  const cx = 80, cy = 160, cw = W - 160, ch = H - 320, r = 40
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(cx + r, cy)
  ctx.lineTo(cx + cw - r, cy); ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + r)
  ctx.lineTo(cx + cw, cy + ch - r); ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - r, cy + ch)
  ctx.lineTo(cx + r, cy + ch); ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - r)
  ctx.lineTo(cx, cy + r); ctx.quadraticCurveTo(cx, cy, cx + r, cy)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.96)'; ctx.fill()
  ctx.restore()

  const logoX = W / 2, logoY = cy - 56
  ctx.save()
  ctx.beginPath(); ctx.arc(logoX, logoY, 56, 0, Math.PI * 2)
  const logoBg = ctx.createLinearGradient(logoX - 56, logoY - 56, logoX + 56, logoY + 56)
  logoBg.addColorStop(0, roleColor.gradientFrom); logoBg.addColorStop(1, roleColor.gradientTo)
  ctx.fillStyle = logoBg; ctx.fill(); ctx.restore()
  ctx.fillStyle = '#fff'; ctx.font = 'bold 38px Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('CY', logoX, logoY)

  ctx.fillStyle = '#0f172a'; ctx.font = 'bold 52px Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  const titleText = title || 'Match Performance'
  ctx.fillText(titleText.length > 22 ? titleText.slice(0, 21) + '…' : titleText, W / 2, cy + 80)

  ctx.fillStyle = roleColor.primary; ctx.font = '500 34px Arial,sans-serif'
  ctx.fillText(userName || 'CricYaar Player', W / 2, cy + 150)

  let subY = cy + 210
  if (matchName) {
    ctx.fillStyle = '#64748b'; ctx.font = '400 28px Arial,sans-serif'
    ctx.fillText('📋 ' + matchName, W / 2, subY); subY += 50
  }
  if (tournamentName) {
    ctx.fillStyle = '#64748b'; ctx.font = '400 28px Arial,sans-serif'
    ctx.fillText('🏆 ' + tournamentName, W / 2, subY); subY += 50
  }

  if (stats?.length > 0) {
    const displayStats = stats.slice(0, 4)
    const colW = cw / displayStats.length
    const statY = cy + ch - 260
    displayStats.forEach((s, i) => {
      const sx = cx + i * colW + colW / 2
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 64px Arial,sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(s.value, sx, statY)
      ctx.fillStyle = roleColor.primary + '30'; ctx.fillRect(cx + (i + 1) * colW - 1, statY, 2, 100)
      ctx.fillStyle = '#94a3b8'; ctx.font = '400 24px Arial,sans-serif'
      ctx.fillText((s.label || '').toUpperCase(), sx, statY + 76)
    })
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(cx + 40, cy + ch - 280); ctx.lineTo(cx + cw - 40, cy + ch - 280); ctx.stroke()
  }

  ctx.fillStyle = '#94a3b8'; ctx.font = '400 24px Arial,sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText('✅ Verified on CricYaar  ·  cricyaar.app', W / 2, cy + ch - 90)

  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 28px Arial,sans-serif'
  ctx.fillText('Your Game. Your Record. For Real.', W / 2, cy + ch + 40)

  return canvas
}

async function canvasToFile(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(new File([blob], 'cricyaar-achievement.png', { type: 'image/png' })), 'image/png')
  })
}

// ── Confetti celebration ──────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#22c55e','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#ef4444','#06b6d4']
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${5 + (i * 3.3) % 90}%`,
    delay: `${(i * 0.07).toFixed(2)}s`,
    dur: `${0.9 + (i % 5) * 0.15}s`,
    size: i % 3 === 0 ? 10 : i % 3 === 1 ? 7 : 5,
    rotate: i % 2 === 0 ? '360deg' : '-360deg',
  }))
  return (
    <div className="absolute inset-x-0 top-0 h-32 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <span key={p.id} style={{
          position: 'absolute', left: p.left, top: '-10px',
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.id % 4 === 0 ? '50%' : '2px',
          animation: `cy-confetti ${p.dur} ${p.delay} ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

// ── Sheet (exported for GlobalShareSheet in App.jsx) ─────────────────────────
export function ShareAchievementSheet({ title, stats, matchName, tournamentName, onClose }) {
  const { user } = useStore()
  const role = user?.role || 'fan'
  const roleColor = getRoleColor(role)

  const [imgDataUrl, setImgDataUrl] = useState(null)
  const [fileRef, setFileRef] = useState(null)
  const [status, setStatus] = useState('generating') // 'generating' | 'ready' | 'sharing'
  const [copied, setCopied] = useState(false)
  const [hint, setHint] = useState('')
  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  const shareText = [
    `🏏 ${title || 'Match Performance'} — ${user?.username || user?.name || 'CricYaar Player'}`,
    matchName ? `📋 Match: ${matchName}` : '',
    stats ? stats.map(s => `${s.label}: ${s.value}`).join(' · ') : '',
    '✅ Verified on CricYaar — cricyaar.app',
  ].filter(Boolean).join('\n')

  useEffect(() => {
    let active = true
    generateAchievementImage({
      title, stats, matchName, tournamentName, roleColor,
      userName: user?.username || user?.name,
    }).then(async canvas => {
      if (!active) return
      const dataUrl = canvas.toDataURL('image/png')
      const file = await canvasToFile(canvas)
      setImgDataUrl(dataUrl)
      setFileRef(file)
      setStatus('ready')
    }).catch(() => { if (active) setStatus('ready') })
    return () => { active = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shareFile = useCallback(async (platform) => {
    if (status !== 'ready' || !fileRef) return
    setStatus('sharing')
    setHint('')
    try {
      if (canShare && navigator.canShare?.({ files: [fileRef] })) {
        await navigator.share({
          title: title || 'My Cricket Performance',
          text: platform === 'whatsapp' ? shareText : undefined,
          files: [fileRef],
        })
      } else {
        // Fallback: download image then redirect
        const a = document.createElement('a')
        a.href = imgDataUrl; a.download = 'cricyaar-achievement.png'; a.click()
        if (platform === 'whatsapp') {
          setTimeout(() => {
            window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`, '_blank')
            setHint('Image saved to gallery — open WhatsApp and share it as an attachment.')
          }, 800)
        } else {
          setTimeout(() => {
            window.open('instagram://camera', '_blank')
            setTimeout(() => window.open('https://www.instagram.com/', '_blank'), 500)
            setHint('Image saved to gallery — open Instagram Stories and pick it from your gallery.')
          }, 800)
        }
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setHint('Tap "Save Image" below to download, then share from your gallery.')
      }
    } finally {
      setStatus('ready')
    }
  }, [status, fileRef, imgDataUrl, canShare, shareText, title])

  const handleDownload = () => {
    if (!imgDataUrl) return
    const a = document.createElement('a'); a.href = imgDataUrl; a.download = 'cricyaar-achievement.png'; a.click()
    setHint('Image saved!')
  }

  const handleCopyText = () => {
    navigator.clipboard?.writeText(shareText).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      {/* Inject confetti keyframe once */}
      <style>{`@keyframes cy-confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(140px) rotate(var(--r,360deg));opacity:0}}`}</style>
      <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up relative overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {status === 'ready' && <Confetti />}

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>

        <div className="px-5 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-extrabold text-navy-900 text-lg flex items-center gap-1.5">
                <Sparkles size={18} className="text-amber-400" />
                Celebrate Your Win!
              </h3>
              <p className="text-navy-400 text-xs mt-0.5">Your verified performance — ready to share</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0 ml-3 active:scale-95">
              <X size={15} className="text-navy-500" />
            </button>
          </div>

          {/* Image preview */}
          <div className="rounded-2xl overflow-hidden mb-4 relative" style={{ aspectRatio: '1', background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}>
            {status === 'generating' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-white/80 text-sm font-semibold">Creating your achievement card…</p>
              </div>
            ) : imgDataUrl ? (
              <img src={imgDataUrl} alt="Achievement card" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white font-bold text-lg">{title || 'Match Performance'}</p>
              </div>
            )}
          </div>

          {/* Primary share buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* WhatsApp */}
            <button
              onClick={() => shareFile('whatsapp')}
              disabled={status !== 'ready'}
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ background: '#25D366', color: '#fff' }}
            >
              {status === 'sharing' ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.12 1.535 5.847L.057 23.714a.5.5 0 00.61.646l6.053-1.456A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.576-.502-5.063-1.376l-.363-.214-3.764.906.945-3.658-.237-.374A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              )}
              WhatsApp
            </button>

            {/* Instagram */}
            <button
              onClick={() => shareFile('instagram')}
              disabled={status !== 'ready'}
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 text-white"
              style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
            >
              {status === 'sharing' ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              )}
              Instagram
            </button>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleDownload}
              disabled={status === 'generating'}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download size={14} />
              Save Image
            </button>
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 bg-slate-50 border border-slate-200 active:scale-95 transition-all"
            >
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>

          {/* Hint / guidance */}
          {hint && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-2">
              <p className="text-amber-800 text-xs font-medium text-center">{hint}</p>
            </div>
          )}

          {/* How it works note */}
          {!canShare && status === 'ready' && !hint && (
            <p className="text-center text-[11px] text-navy-400 leading-relaxed">
              Tap WhatsApp or Instagram to save the image and open the app — then share from your gallery.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

// ── Inline trigger + sheet (used from individual screens) ────────────────────
export default function ShareAchievement({ title, stats, matchName, tournamentName }) {
  const { user } = useStore()
  const [open, setOpen] = useState(false)
  const role = user?.role || 'fan'
  const roleColor = getRoleColor(role)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95"
        style={{ background: `${roleColor.primary}18`, color: roleColor.primary, border: `1px solid ${roleColor.primary}30` }}
      >
        <Share2 size={14} />
        Share Achievement
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative" onClick={e => e.stopPropagation()}>
            <ShareAchievementSheet
              title={title} stats={stats} matchName={matchName} tournamentName={tournamentName}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
