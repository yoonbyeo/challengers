import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string>('로그인 처리 중...')

  useEffect(() => {
    const run = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          setMessage('로그인에 실패했습니다.')
          setTimeout(() => navigate('/', { replace: true }), 2000)
          return
        }
        if (session) {
          setMessage('로그인되었습니다.')
          navigate('/', { replace: true })
        } else {
          setMessage('로그인에 실패했습니다.')
          setTimeout(() => navigate('/', { replace: true }), 2000)
        }
      } catch {
        setMessage('로그인에 실패했습니다.')
        setTimeout(() => navigate('/', { replace: true }), 2000)
      }
    }
    run()
  }, [navigate])

  return (
    <div style={styles.container}>
      <p style={styles.text}>{message}</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
}
