import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../supabaseClient'

export type Profile = {
  id: string
  user_id: string
  display_name: string | null
  coins: number
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, coins')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
      return null
    }

    if (data) {
      setProfile(data as Profile)
      return data as Profile
    }

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({ user_id: userId, display_name: null, coins: 0 })
      .select('id, user_id, display_name, coins')
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setProfile(inserted as Profile)
    return inserted as Profile
  }, [])

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    await fetchProfile(user.id)
    setLoading(false)
  }, [user?.id, fetchProfile])

  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProfile(user.id).then(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [user?.id, fetchProfile])

  const updateDisplayName = useCallback(async (name: string) => {
    if (!user?.id) return
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: name || null })
      .eq('user_id', user.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setProfile((prev) => (prev ? { ...prev, display_name: name || null } : null))
  }, [user?.id])

  const addCoins = useCallback(async (amount: number) => {
    if (!user?.id || amount <= 0) return
    const { data: current, error: selectError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('user_id', user.id)
      .single()

    if (selectError || current == null) {
      setError(selectError?.message ?? '프로필을 찾을 수 없습니다.')
      return
    }

    const newCoins = (current.coins ?? 0) + amount
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ coins: newCoins })
      .eq('user_id', user.id)

    if (updateErr) {
      setError(updateErr.message)
      return
    }
    setProfile((prev) => (prev ? { ...prev, coins: newCoins } : null))
  }, [user?.id])

  const deductCoins = useCallback(async (amount: number): Promise<boolean> => {
    if (!user?.id || amount <= 0) return false
    const { data: current, error: selectError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('user_id', user.id)
      .single()

    if (selectError || current == null) {
      setError(selectError?.message ?? '프로필을 찾을 수 없습니다.')
      return false
    }

    const currentCoins = current.coins ?? 0
    if (currentCoins < amount) return false

    const newCoins = currentCoins - amount
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ coins: newCoins })
      .eq('user_id', user.id)

    if (updateErr) {
      setError(updateErr.message)
      return false
    }
    setProfile((prev) => (prev ? { ...prev, coins: newCoins } : null))
    return true
  }, [user?.id])

  return { profile, loading, error, refresh, updateDisplayName, addCoins, deductCoins }
}
