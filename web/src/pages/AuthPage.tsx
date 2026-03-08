import { useState, FormEvent } from 'react'
import { supabase } from '../supabaseClient'

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>챌린저스</h1>
        <div style={styles.tabs}>
          <button
            type="button"
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
            onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
          >
            로그인
          </button>
          <button
            type="button"
            style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}
            onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            style={styles.input}
            autoComplete="email"
          />
          <label style={styles.label}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? '6자 이상' : '비밀번호'}
            required
            style={styles.input}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
          {isSignup && (
            <>
              <label style={styles.label}>비밀번호 확인</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 다시 입력"
                required
                style={styles.input}
                autoComplete="new-password"
              />
            </>
          )}
          {error && <p style={styles.error}>{error}</p>}
          {successMessage && <p style={styles.success}>{successMessage}</p>}
          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>또는</span>
        </div>
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          style={styles.googleBtn}
        >
          {isSignup ? '구글로 회원가입' : '구글로 로그인'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  title: {
    margin: '0 0 24px',
    fontSize: 28,
    fontWeight: 700,
    textAlign: 'center',
    color: '#1a1a2e',
  },
  tabs: {
    display: 'flex',
    gap: 0,
    marginBottom: 24,
    borderBottom: '1px solid #e0e0e0',
  },
  tab: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    fontSize: 15,
    fontWeight: 500,
    color: '#666',
    cursor: 'pointer',
  },
  tabActive: {
    color: '#16213e',
    borderBottom: '2px solid #16213e',
    marginBottom: -1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
  },
  input: {
    padding: '12px 14px',
    fontSize: 15,
    border: '1px solid #ddd',
    borderRadius: 8,
    outline: 'none',
  },
  error: {
    margin: 0,
    fontSize: 14,
    color: '#c62828',
  },
  success: {
    margin: 0,
    fontSize: 14,
    color: '#2e7d32',
  },
  submit: {
    padding: 14,
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#16213e',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  divider: {
    margin: '24px 0',
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
  },
  googleBtn: {
    padding: 14,
    fontSize: 15,
    fontWeight: 500,
    color: '#333',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: 8,
    cursor: 'pointer',
  },
}
