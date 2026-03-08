import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

export function useSaveReel(reelId: string | null) {
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const fetch = useCallback(async () => {
    if (!reelId || !user?.id) {
      setIsSaved(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('saved_reels')
      .select('id')
      .eq('reel_id', reelId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!error) setIsSaved(!!data)
    setLoading(false)
  }, [reelId, user?.id])

  useEffect(() => {
    fetch()
  }, [fetch])

  const toggleSave = useCallback(async () => {
    if (!reelId || !user?.id || toggling) return
    setToggling(true)
    if (isSaved) {
      await supabase.from('saved_reels').delete().eq('reel_id', reelId).eq('user_id', user.id)
      setIsSaved(false)
    } else {
      await supabase.from('saved_reels').insert({ reel_id: reelId, user_id: user.id })
      setIsSaved(true)
    }
    setToggling(false)
  }, [reelId, user?.id, isSaved, toggling])

  return { isSaved, loading, toggling, toggleSave, refresh: fetch }
}
