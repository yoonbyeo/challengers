import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

export type ReelComment = {
  id: string
  reel_id: string
  user_id: string
  body: string
  created_at: string
  author_display_name?: string
}

export function useReelComments(reelId: string | null) {
  const { user } = useAuth()
  const [comments, setComments] = useState<ReelComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetch = useCallback(async () => {
    if (!reelId) {
      setComments([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('reel_comments')
      .select('id, reel_id, user_id, body, created_at')
      .eq('reel_id', reelId)
      .order('created_at', { ascending: true })
    if (error) {
      setComments([])
      setLoading(false)
      return
    }
    const rows = (data ?? []) as Omit<ReelComment, 'author_display_name'>[]
    const userIds = [...new Set(rows.map((r) => r.user_id))]
    let names: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)
      names = (profiles ?? []).reduce(
        (acc, p) => ({ ...acc, [p.user_id]: (p.display_name?.trim() || '사용자') }),
        {} as Record<string, string>
      )
    }
    setComments(
      rows.map((r) => ({
        ...r,
        author_display_name: names[r.user_id] || '사용자',
      }))
    )
    setLoading(false)
  }, [reelId])

  useEffect(() => {
    fetch()
  }, [fetch])

  const addComment = useCallback(
    async (body: string): Promise<{ success: boolean; message?: string }> => {
      if (!reelId || !user?.id) return { success: false, message: '로그인이 필요합니다.' }
      const trimmed = body.trim()
      if (!trimmed) return { success: false, message: '댓글을 입력해 주세요.' }
      setSubmitting(true)
      const { error } = await supabase.from('reel_comments').insert({
        reel_id: reelId,
        user_id: user.id,
        body: trimmed,
      })
      setSubmitting(false)
      if (error) return { success: false, message: error.message }
      await fetch()
      return { success: true }
    },
    [reelId, user?.id, fetch]
  )

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!user?.id) return false
      const { error } = await supabase
        .from('reel_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)
      if (error) return false
      await fetch()
      return true
    },
    [user?.id, fetch]
  )

  return { comments, loading, submitting, addComment, deleteComment, refresh: fetch }
}
