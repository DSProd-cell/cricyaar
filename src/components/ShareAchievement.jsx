import { useState, useRef } from 'react'
import { Share2, X, MessageCircle, Instagram, Copy, CheckCircle, Download } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRoleColor } from '../lib/roleColors'

async function generateAchievementImage({ title, stats, matchName, tournamentName, roleColor, userName }) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, roleColor.gradientFrom)
  bg.addColorStop(1, roleColor.gradientTo)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Dot grid overlay
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  for (let x = 24; x < W; x += 40) {
    for (let y = 24; y < H; y += 40) {
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // White card
  const cx = 80, cy = 160, cw = W - 160, ch = H - 320
  ctx.save()
  const r = 40
  ctx.beginPath()
  ctx.moveTo(cx + r, cy)
  ctx.lineTo(cx + cw - r, cy)
  ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + r)
  ctx.lineTo(cx + cw, cy + ch - r)
  ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - r, cy + ch)
  ctx.lineTo(cx + r, cy + ch)
  ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - r)
  ctx.lineTo(cx, cy + r)
  ctx.quadraticCurveTo(cx, cy, cx + r, cy)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.96)'
  ctx.fill()
  ctx.restore()

  // CY logo circle
  const logoX = W / 2, logoY = cy - 56
  ctx.save()
  ctx.beginPath()
  ctx.arc(logoX, logoY, 56, 0, Math.PI * 2)
  const logoBg = ctx.createLinearGradient(logoX - 56, logoY - 56, logoX + 56, logoY + 56)
  logoBg.addColorStop(0, roleColor.gradientFrom)
  logoBg.addColorStop(1, roleColor.gradientTo)
  ctx.fillStyle = logoBg
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 38px -apple-system, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CY', logoX, logoY)

  // Title
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 52px -apple-system, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const titleText = title || 'Match Performance'
  ctx.fillText(titleText.length > 22 ? titleText.slice(0, 21) + '…' : titleText, W / 2, cy + 80)

  // Player name
  ctx.fillStyle = roleColor.primary
  ctx.font = '500 34px -apple-system, Arial, sans-serif'
  ctx.fillText(userName || 'CricYaar Player', W / 2, cy + 150)

  // Match / tournament name
  let subY = cy + 210
  if (matchName) {
    ctx.fillStyle = '#64748b'
    ctx.font = '400 28px -apple-system, Arial, sans-serif'
    ctx.fillText('📋 ' + matchName, W / 2, subY)
    subY += 50
  }
  if (tournamentName) {
    ctx.fillStyle = '#64748b'
    ctx.font = '400 28px -apple-system, Arial, sans-serif'
    ctx.fillText('🏆 ' + tournamentName, W / 2, subY)
    subY += 50
  }

  // Stats row
  if (stats?.length > 0) {
    const displayStats = stats.slice(0, 4)
    const colW = cw / displayStats.length
    const statY = cy + ch - 260
    displayStats.forEach((s, i) => {
      const sx = cx + i * colW + colW / 2
      // Stat value
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 64px -apple-system, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(s.value, sx, statY)
      // Divider
      ctx.fillStyle = roleColor.primary + '30'
      ctx.fillRect(cx + (i + 1) * colW - 1, statY, 2, 100)
      // Label
      ctx.fillStyle = '#94a3b8'
      ctx.font = '400 24px -apple-system, Arial, sans-serif'
      ctx.fillText((s.label || '').toUpperCase(), sx, statY + 76)
    })
    // Thin separator line above stats
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx + 40, statY - 20)
    ctx.lineTo(cx + cw - 40, statY - 20)
    ctx.stroke()
  }

  // Verified footer
  const footerY = cy + ch - 90
  ctx.fillStyle = '#94a3b8'
  ctx.font = '400 24px -apple-system, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('✅ Verified on CricYaar  ·  cricyaar.app', W / 2, footerY)

  // Bottom tagline
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = 'bold 28px -apple-system, Arial, sans-serif'
  ctx.fillText('Your Game. Your Record. For Real.', W / 2, cy + ch + 40)

  return canvas
}

async function getShareFile(canvas, fileName = 'cricyaar-achievement.png') {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], fileName, { type: 'image/png' }))
    }, 'image/png')
  })
}

export function ShareAchievementSheet({ title, stats, matchName, tournamentName, onClose }) {
  const { user } = useStore()
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const role = user?.role || 'fan'
  const roleColor = getRoleColor(role)

  const shareText = [
    `🏏 ${title || 'Match Performance'} — ${user?.name || 'CricYaar Player'}`,
    matchName ? `📋 Match: ${matchName}` : '',
    tournamentName ? `🏆 Tournament: ${tournamentName}` : '',
    stats ? stats.map(s => `${s.icon || '•'} ${s.label}: ${s.value}`).join('\n') : '',
    '',
    '✅ Verified on CricYaar — India\'s Fraud-Free Cricket Platform',
    '📲 Download: cricyaar.app',
  ].filter(Boolean).join('\n')

  const buildImageData = () => generateAchievementImage({
    title, stats, matchName, tournamentName, roleColor, userName: user?.name,
  })

  const handleWhatsApp = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const file = await getShareFile(canvas)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: title || 'My Cricket Performance', text: shareText, files: [file] })
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
      }
    } catch { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer') }
    finally { setGenerating(false) }
  }

  const handleInstagram = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const file = await getShareFile(canvas)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: title || 'My Cricket Performance', files: [file] })
      } else {
        const url = canvas.toDataURL('image/png')
        const a = document.createElement('a'); a.href = url; a.download = 'cricyaar-achievement.png'; a.click()
        navigator.clipboard?.writeText(shareText).catch(() => {})
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
        setCopied(true); setTimeout(() => setCopied(false), 3000)
      }
    } catch { navigator.clipboard?.writeText(shareText).catch(() => {}); window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer') }
    finally { setGenerating(false) }
  }

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a'); a.href = url; a.download = 'cricyaar-achievement.png'; a.click()
    } finally { setGenerating(false) }
  }

  const handleNativeShare = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const file = await getShareFile(canvas)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: title || 'My Cricket Performance', text: shareText, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: title || 'My Cricket Performance', text: shareText })
      } else {
        navigator.clipboard?.writeText(shareText).catch(() => {})
        setCopied(true); setTimeout(() => setCopied(false), 2000)
      }
    } catch { navigator.clipboard?.writeText(shareText).catch(() => {}) }
    finally { setGenerating(false) }
  }

  return (
    <div className="bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up pb-safe">
      <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-slate-200 rounded-full" /></div>
      <div className="px-5 pb-8 pt-3">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-extrabold text-navy-900 text-lg">Celebrate Your Win 🏆</h3>
            <p className="text-navy-500 text-xs mt-0.5">Share your verified performance — let your game do the talking</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0 ml-3">
            <X size={15} className="text-navy-500" />
          </button>
        </div>
        <div className="rounded-2xl p-4 my-4 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          <p className="font-extrabold text-base relative">{title || 'Match Performance'}</p>
          {matchName && <p className="text-white/75 text-xs mt-0.5 relative">📋 {matchName}</p>}
          {stats?.length > 0 && (
            <div className="flex gap-4 mt-3 relative">
              {stats.slice(0, 3).map((s, i) => (
                <div key={i} className="text-center">
                  <p className="font-extrabold text-xl tabular-nums">{s.value}</p>
                  <p className="text-white/65 text-[10px] uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-white/50 text-[10px] mt-3 relative">✅ Verified · cricyaar.app</p>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button onClick={handleWhatsApp} disabled={generating} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-green-50 border border-green-200 active:scale-95 transition-all disabled:opacity-60">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center"><MessageCircle size={18} className="text-white" /></div>
            <span className="text-green-700 font-semibold text-[10px]">WhatsApp</span>
          </button>
          <button onClick={handleInstagram} disabled={generating} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-pink-50 border border-pink-200 active:scale-95 transition-all disabled:opacity-60">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}><Instagram size={18} className="text-white" /></div>
            <span className="text-pink-700 font-semibold text-[10px]">Instagram</span>
          </button>
          <button onClick={handleDownload} disabled={generating} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-blue-50 border border-blue-200 active:scale-95 transition-all disabled:opacity-60">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center"><Download size={18} className="text-white" /></div>
            <span className="text-blue-700 font-semibold text-[10px]">Save Image</span>
          </button>
          <button onClick={() => { navigator.clipboard?.writeText(shareText).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 active:scale-95 transition-all">
            <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center">
              {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} className="text-slate-600" />}
            </div>
            <span className="text-slate-700 font-semibold text-[10px]">{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
        <button onClick={handleNativeShare} disabled={generating}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-70"
          style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}>
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Generating image…
            </span>
          ) : (<><Share2 size={15} className="inline mr-2 -mt-0.5" />Share image via…</>)}
        </button>
        {copied && <p className="text-center text-xs text-green-600 font-semibold mt-3 animate-fade-in">✅ Text copied — open Instagram and paste into your Story caption</p>}
      </div>
    </div>
  )
}

export default function ShareAchievement({ title, stats, matchName, tournamentName }) {
  const { user } = useStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const role = user?.role || 'fan'
  const roleColor = getRoleColor(role)

  const shareText = [
    `🏏 ${title || 'Match Performance'} — ${user?.name || 'CricYaar Player'}`,
    matchName ? `📋 Match: ${matchName}` : '',
    tournamentName ? `🏆 Tournament: ${tournamentName}` : '',
    stats ? stats.map(s => `${s.icon || '•'} ${s.label}: ${s.value}`).join('\n') : '',
    '',
    '✅ Verified on CricYaar — India\'s Fraud-Free Cricket Platform',
    '📲 Download: cricyaar.app',
  ].filter(Boolean).join('\n')

  const buildImageData = () => generateAchievementImage({
    title, stats, matchName, tournamentName, roleColor,
    userName: user?.name,
  })

  const handleWhatsApp = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const file = await getShareFile(canvas)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: title || 'My Cricket Performance',
          text: shareText,
          files: [file],
        })
      } else {
        // Fallback: open WhatsApp with text
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
    } finally {
      setGenerating(false)
    }
  }

  const handleInstagram = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const file = await getShareFile(canvas)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: title || 'My Cricket Performance',
          files: [file],
        })
      } else {
        // Fallback: download image + copy text, then open Instagram
        const url = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = url
        a.download = 'cricyaar-achievement.png'
        a.click()
        navigator.clipboard?.writeText(shareText).catch(() => {})
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
      }
    } catch {
      navigator.clipboard?.writeText(shareText).catch(() => {})
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'cricyaar-achievement.png'
      a.click()
    } finally {
      setGenerating(false)
    }
  }

  const handleNativeShare = async () => {
    setGenerating(true)
    try {
      const canvas = await buildImageData()
      const file = await getShareFile(canvas)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: title || 'My Cricket Performance',
          text: shareText,
          files: [file],
        })
      } else if (navigator.share) {
        await navigator.share({ title: title || 'My Cricket Performance', text: shareText })
      } else {
        navigator.clipboard?.writeText(shareText).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      navigator.clipboard?.writeText(shareText).catch(() => {})
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95"
        style={{
          background: `${roleColor.primary}15`,
          color: roleColor.primary,
          border: `1px solid ${roleColor.border}`,
        }}
      >
        <Share2 size={14} />
        Share Achievement
      </button>

      {/* Bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex flex-col justify-end"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up pb-safe"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <div className="px-5 pb-8 pt-3">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-extrabold text-navy-900 text-lg">Celebrate Your Win 🏆</h3>
                  <p className="text-navy-500 text-xs mt-0.5">
                    Share your verified performance — let your game do the talking
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0 ml-3">
                  <X size={15} className="text-navy-500" />
                </button>
              </div>

              {/* Preview card */}
              <div
                className="rounded-2xl p-4 my-4 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
              >
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }} />
                <p className="font-extrabold text-base relative">{title || 'Match Performance'}</p>
                {matchName && <p className="text-white/75 text-xs mt-0.5 relative">📋 {matchName}</p>}
                {stats?.length > 0 && (
                  <div className="flex gap-4 mt-3 relative">
                    {stats.slice(0, 3).map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="font-extrabold text-xl tabular-nums">{s.value}</p>
                        <p className="text-white/65 text-[10px] uppercase tracking-wide">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-white/50 text-[10px] mt-3 relative">✅ Verified · cricyaar.app</p>
              </div>

              {/* Share options */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={handleWhatsApp}
                  disabled={generating}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-green-50 border border-green-200 active:scale-95 transition-all disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <span className="text-green-700 font-semibold text-[10px]">WhatsApp</span>
                </button>

                <button
                  onClick={handleInstagram}
                  disabled={generating}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-pink-50 border border-pink-200 active:scale-95 transition-all disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                    <Instagram size={18} className="text-white" />
                  </div>
                  <span className="text-pink-700 font-semibold text-[10px]">Instagram</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={generating}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-blue-50 border border-blue-200 active:scale-95 transition-all disabled:opacity-60"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Download size={18} className="text-white" />
                  </div>
                  <span className="text-blue-700 font-semibold text-[10px]">Save Image</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(shareText).catch(() => {})
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 active:scale-95 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center">
                    {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} className="text-slate-600" />}
                  </div>
                  <span className="text-slate-700 font-semibold text-[10px]">{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              {/* Native share */}
              <button
                onClick={handleNativeShare}
                disabled={generating}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-70"
                style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating image…
                  </span>
                ) : (
                  <>
                    <Share2 size={15} className="inline mr-2 -mt-0.5" />
                    Share image via…
                  </>
                )}
              </button>

              {/* Why share */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-navy-600 mb-1">Why share your performance?</p>
                <p className="text-[11px] text-navy-400 leading-relaxed">
                  Your stats are verified and fraud-proof. Every run, wicket and catch is recorded on CricYaar —
                  sharing them builds your cricket reputation and helps you get noticed by teams and organisers.
                </p>
              </div>

              {copied && (
                <p className="text-center text-xs text-green-600 font-semibold mt-3 animate-fade-in">
                  ✅ Text copied — open Instagram and paste into your Story caption
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
