import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

const BUCKET = 'reels'
const MAX_FILE_SIZE_MB = 50

export type Reel = {
  id: string
  user_id: string
  storage_path: string
  title: string | null
  created_at: string
  video_url?: string
}

function getPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export function useReels() {
  const { user } = useAuth()
  const [list, setList] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('reels')
      .select('id, user_id, storage_path, title, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setList([])
      setLoading(false)
      return
    }

    const rows = (data ?? []).map((row) => ({
      ...row,
      video_url: getPublicUrl(row.storage_path),
    })) as Reel[]
    setList(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const upload = useCallback(
    async (file: File, title?: string): Promise<{ success: true } | { success: false; message: string }> => {
      if (!user?.id) {
        const msg = '로그인이 필요합니다.'
        setError(msg)
        return { success: false, message: msg }
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        const msg = `파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다.`
        setError(msg)
        return { success: false, message: msg }
      }

      setUploading(true)
      setError(null)

      const ext = file.name.split('.').pop() || 'mp4'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return { success: false, message: uploadError.message }
      }

      const { error: insertError } = await supabase.from('reels').insert({
        user_id: user.id,
        storage_path: path,
        title: title?.trim() || null,
      })

      if (insertError) {
        setError(insertError.message)
        setUploading(false)
        return { success: false, message: insertError.message }
      }

      await fetchList()
      setUploading(false)
      return { success: true }
    },
    [user?.id, fetchList]
  )

  const clearError = useCallback(() => setError(null), [])

  return { list, loading, error, uploading, upload, refresh: fetchList, clearError }
}
