import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from './useProfile'
import { supabase } from '../supabaseClient'

const COIN_PER_KRW = 10

export function useChallengeParticipation(challengeId: string | undefined) {
  const { user } = useAuth()
  const { profile, deductCoins, addCoins } = useProfile()
  const [participantCount, setParticipantCount] = useState(0)
  const [hasParticipated, setHasParticipated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participating, setParticipating] = useState(false)

  const fetchCount = useCallback(async (cid: string) => {
    const { count, error: countError } = await supabase
      .from('challenge_participations')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', cid)

    if (countError) {
      setError(countError.message)
      return 0
    }
    return count ?? 0
  }, [])

  const fetchHasParticipated = useCallback(async (cid: string, uid: string) => {
    const { data, error: partError } = await supabase
      .from('challenge_participations')
      .select('id')
      .eq('challenge_id', cid)
      .eq('user_id', uid)
      .maybeSingle()

    if (partError) return false
    return !!data
  }, [])

  const refreshCount = useCallback(async () => {
    if (!challengeId) return
    setLoading(true)
    setError(null)
    const count = await fetchCount(challengeId)
    setParticipantCount(count)
    if (user?.id) {
      const participated = await fetchHasParticipated(challengeId, user.id)
      setHasParticipated(participated)
    } else {
      setHasParticipated(false)
    }
    setLoading(false)
  }, [challengeId, user?.id, fetchCount, fetchHasParticipated])

  useEffect(() => {
    if (!challengeId) {
      setParticipantCount(0)
      setLoading(false)
      return
    }
    refreshCount()
  }, [challengeId, refreshCount])

  const participate = useCallback(async (entryFeeKRW: number): Promise<boolean> => {
    if (!challengeId || !user?.id) return false
    if (hasParticipated) return false

    const coinsRequired = Math.ceil(entryFeeKRW / COIN_PER_KRW)
    if (!profile || profile.coins < coinsRequired) return false

    setParticipating(true)
    setError(null)

    const deducted = await deductCoins(coinsRequired)
    if (!deducted) {
      setError('코인 잔액이 부족합니다.')
      setParticipating(false)
      return false
    }

    const { error: insertError } = await supabase
      .from('challenge_participations')
      .insert({ user_id: user.id, challenge_id: challengeId })

    if (insertError) {
      await addCoins(coinsRequired)
      if (insertError.code === '23505') {
        setHasParticipated(true)
        await refreshCount()
      } else {
        setError(insertError.message)
      }
      setParticipating(false)
      return false
    }

    setHasParticipated(true)
    await refreshCount()
    setParticipating(false)
    return true
  }, [challengeId, user?.id, hasParticipated, profile, deductCoins, addCoins, refreshCount])

  return { participantCount, hasParticipated, loading, error, participate, participating, refreshCount }
}

export function useParticipantCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('challenge_participations')
      .select('challenge_id')

    if (fetchError) {
      setCounts({})
      setLoading(false)
      return
    }

    const map: Record<string, number> = {}
    for (const row of data ?? []) {
      const cid = row.challenge_id as string
      map[cid] = (map[cid] ?? 0) + 1
    }
    setCounts(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { counts, loading, refresh }
}
