import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

export function useReelLikes(reelId: string | null) {
  const { user } = useAuth()
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const fetch = useCallback(async () => {
    if (!reelId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { count, error: countError } = await supabase
      .from('reel_likes')
      .select('*', { count: 'exact', head: true })
      .eq('reel_id', reelId)
    if (!countError) setLikeCount(count ?? 0)
    if (user?.id) {
      const { data, error } = await supabase
        .from('reel_likes')
        .select('id')
        .eq('reel_id', reelId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!error) setIsLiked(!!data)
    } else {
      setIsLiked(false)
    }
    setLoading(false)
  }, [reelId, user?.id])

  useEffect(() => {
    fetch()
  }, [fetch])

  const toggleLike = useCallback(async () => {
    if (!reelId || !user?.id || toggling) return
    setToggling(true)
    if (isLiked) {
      await supabase.from('reel_likes').delete().eq('reel_id', reelId).eq('user_id', user.id)
      setLikeCount((c) => Math.max(0, c - 1))
      setIsLiked(false)
    } else {
      await supabase.from('reel_likes').insert({ reel_id: reelId, user_id: user.id })
      setLikeCount((c) => c + 1)
      setIsLiked(true)
    }
    setToggling(false)
  }, [reelId, user?.id, isLiked, toggling])

  return { likeCount, isLiked, loading, toggling, toggleLike, refresh: fetch }
}
