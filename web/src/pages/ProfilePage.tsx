import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import CoinIcon from '../components/CoinIcon'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const { profile, loading: profileLoading, updateDisplayName } = useProfile()
  const navigate = useNavigate()
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const displayName =
    profile?.display_name?.trim() ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    '사용자'

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  useEffect(() => {
    setEditName(displayName)
  }, [displayName])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const handleSaveName = async () => {
    const name = editName.trim()
    if (name === (profile?.display_name ?? '').trim()) return
    setSaving(true)
    await updateDisplayName(name || '')
    setSaving(false)
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
        <div className="profile-edit-name">
          <label htmlFor="profile-display-name" className="profile-edit-label">표시 이름 (아이디)</label>
          <input
            id="profile-display-name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="표시할 이름을 입력하세요"
            className="profile-edit-input"
          />
          <button
            type="button"
            className="profile-edit-btn"
            disabled={saving || profileLoading}
            onClick={handleSaveName}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
        {profile != null && (
          <p className="profile-coins">
            <CoinIcon size={22} />
            <span>{profile.coins.toLocaleString()} 챌린저스 코인</span>
          </p>
        )}
        {user.email && <p className="profile-email">{user.email}</p>}
        <button type="button" className="profile-signout" onClick={handleSignOut}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
