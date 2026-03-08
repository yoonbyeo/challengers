import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card"><p className="profile-loading">로딩 중...</p></div>
      </div>
    )
  }

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture
  const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? '사용자'

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/" className="profile-back">← 돌아가기</Link>
        <div className="profile-avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">{displayName.charAt(0)}</div>
          )}
        </div>
        <h1 className="profile-name">{displayName}</h1>
        {user.email && <p className="profile-email">{user.email}</p>}
        <button type="button" className="profile-signout" onClick={handleSignOut}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
