// @ts-nocheck
import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

export type UserProfile = {
  cCoinBalance: number
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  participateInChallenge: (feeKRW: number) => boolean
  withdrawCCoins: (amount: number) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setProfile({ cCoinBalance: 5000 }) // mock initial 5000 C Coins
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setProfile({ cCoinBalance: 5000 })
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const participateInChallenge = (feeKRW: number) => {
    if (!profile) return false
    // Simulate paying in KRW. C Coins are NOT deducted for participation.
    return true
  }

  const withdrawCCoins = (amount: number) => {
    if (!profile || amount < 3000) return false
    if (profile.cCoinBalance >= amount) {
      setProfile({ ...profile, cCoinBalance: profile.cCoinBalance - amount })
      return true
    }
    return false
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, participateInChallenge, withdrawCCoins }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
