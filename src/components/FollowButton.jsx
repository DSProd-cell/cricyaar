import { Bell, BellOff } from 'lucide-react'
import { useStore } from '../store/useStore'

/**
 * FollowButton — reusable bell icon button
 *
 * Props:
 *   type     — 'match' | 'tournament' | 'player'
 *   item     — the object to follow (must have id or teamA/teamB for matches)
 *   label    — optional label shown next to icon (default: hidden)
 *   size     — 'sm' | 'md' (default 'sm')
 *   className — extra Tailwind classes
 */
export default function FollowButton({ type, item, label, size = 'sm', className = '' }) {
  const { followedMatches, followedTournaments, followedPlayers,
          toggleFollowMatch, toggleFollowTournament, toggleFollowPlayer, addToast } = useStore()

  const isFollowing = (() => {
    if (type === 'match') {
      const key = item?.id || `${item?.teamA}_${item?.teamB}`
      return followedMatches.some(m => (m.id || `${m.teamA}_${m.teamB}`) === key)
    }
    if (type === 'tournament') return followedTournaments.some(t => t.id === item?.id)
    if (type === 'player')     return followedPlayers.some(p => p.id === item?.id)
    return false
  })()

  const handleToggle = (e) => {
    e.stopPropagation()
    if (type === 'match') {
      toggleFollowMatch(item)
      addToast(isFollowing ? 'Unfollowed match' : 'Following match — you\'ll get live updates!', isFollowing ? 'info' : 'success')
    } else if (type === 'tournament') {
      toggleFollowTournament(item)
      addToast(isFollowing ? 'Unfollowed tournament' : 'Following tournament — stay updated!', isFollowing ? 'info' : 'success')
    } else if (type === 'player') {
      toggleFollowPlayer(item)
      addToast(isFollowing ? 'Unfollowed player' : `Following ${item?.name || 'player'} — you\'ll get match alerts!`, isFollowing ? 'info' : 'success')
    }
  }

  const iconSize = size === 'md' ? 16 : 13

  return (
    <button
      onClick={handleToggle}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      className={`flex items-center gap-1 rounded-full transition-all active:scale-90 ${
        isFollowing
          ? 'text-brand-600 bg-brand-50 border border-brand-200'
          : 'text-navy-400 bg-slate-100 border border-transparent hover:border-brand-200 hover:text-brand-500'
      } ${size === 'md' ? 'px-3 py-1.5' : 'px-2 py-1'} ${className}`}
    >
      {isFollowing
        ? <Bell size={iconSize} fill="currentColor" className="flex-shrink-0" />
        : <Bell size={iconSize} className="flex-shrink-0" />
      }
      {label && (
        <span className={`font-semibold ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
          {isFollowing ? 'Following' : label}
        </span>
      )}
    </button>
  )
}
