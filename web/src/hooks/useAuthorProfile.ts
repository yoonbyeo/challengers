import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useAuthorProfile(userId: string | null) {
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!userId)

  const fetch = useCallback(async () => {
    if (!userId) {
      setDisplayName(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('profiles').select('display_name').eq('user_id', userId).maybeSingle()
    setDisplayName(data?.display_name?.trim() || null)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { displayName: displayName || '사용자', loading }
}
