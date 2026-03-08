import { useState, FormEvent } from 'react'
import { supabase } from '../supabaseClient'
import './AuthPage.css'

type Mode = 'login' | 'signup'

function getRedirectUrl(): string {
  if (typeof window === 'undefined') return ''
  const { origin } = window.location
  return `${origin}/auth/callback`
}

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호를 확인해 주세요.'
  if (message.includes('Email not confirmed')) return '이메일 인증을 완료해 주세요.'
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (message.includes('Password')) return '비밀번호는 6자 이상으로 설정해 주세요.'
  return message || '오류가 발생했습니다. 다시 시도해 주세요.'
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    if (isSignup && password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    try {
      if (isSignup) {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setSuccessMessage('가입 완료. 이메일 인증 링크를 확인해 주세요.')
        setEmail('')
        setPassword('')
        setPasswordConfirm('')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        setSuccessMessage('로그인되었습니다.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(mapAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getRedirectUrl() },
      })
      if (err) throw err
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(mapAuthError(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">챌린저스</h1>
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
          >
            로그인
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="auth-input"
            autoComplete="email"
          />
          <label className="auth-label">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? '6자 이상' : '비밀번호'}
            required
            className="auth-input"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
          {isSignup && (
            <>
              <label className="auth-label">비밀번호 확인</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 다시 입력"
                required
                className="auth-input"
                autoComplete="new-password"
              />
            </>
          )}
          {error && <p className="auth-error">{error}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="auth-google"
        >
          <GoogleIcon />
          {isSignup ? '구글로 회원가입' : '구글로 로그인'}
        </button>
      </div>
    </div>
  )
}
