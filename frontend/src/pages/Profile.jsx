import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ProfileSkeleton } from '../components/Skeletons'

export default function Profile() {
  const { user } = useAuth()
  const [username, setUsername] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (ignore) return
        if (fetchError) setError(fetchError.message)
        else setUsername(data.username)
      })

    return () => {
      ignore = true
    }
  }, [user.id])

  if (error) {
    return (
      <p className="alert alert-error" role="alert">
        {error}
      </p>
    )
  }
  if (!username) return <ProfileSkeleton />

  return <Navigate to={`/u/${username}`} replace />
}