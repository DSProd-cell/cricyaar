import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Welcome() {
  const { user } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(160deg, #0a0118 0%, #120520 55%, #07021a 100%)' }} />
  )
}
