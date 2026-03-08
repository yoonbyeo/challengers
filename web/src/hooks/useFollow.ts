import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

export function useFollow(followingId: string | null) {
  const { user } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const fetch = useCallback(async () => {
    if (!followingId || !user?.id || followingId === user.id) {
      setIsFollowing(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .maybeSingle()
    if (!error) setIsFollowing(!!data)
    setLoading(false)
  }, [followingId, user?.id])

  useEffect(() => {
    fetch()
  }, [fetch])

  const toggleFollow = useCallback(async () => {
    if (!followingId || !user?.id || user.id === followingId || toggling) return
    setToggling(true)
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', followingId)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: followingId })
      setIsFollowing(true)
    }
    setToggling(false)
  }, [followingId, user?.id, isFollowing, toggling])

  return { isFollowing, loading, toggling, toggleFollow, refresh: fetch }
}
