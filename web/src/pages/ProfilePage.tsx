// @ts-nocheck
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, profile, loading, signOut, withdrawCCoins } = useAuth()
  const navigate = useNavigate()
  const [withdrawAmount, setWithdrawAmount] = useState('')

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount)
    if (isNaN(amount) || amount < 3000) {
      alert('최소 3000 C 코인부터 환전할 수 있습니다.')
      return
    }
    const success = withdrawCCoins(amount)
    if (success) {
      alert(`${amount} C 코인이 성공적으로 환전(출금)되었습니다.`)
      setWithdrawAmount('')
    } else {
      alert('잔액이 부족합니다.')
    }
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
        
        <div className="profile-finance">
          <h2 className="profile-finance-balance">내 자산: {profile?.cCoinBalance.toLocaleString() ?? 0} C 코인</h2>
          <div className="profile-finance-form">
            <input 
              type="number" 
              className="profile-finance-input" 
              value={withdrawAmount} 
              onChange={(e) => setWithdrawAmount(e.target.value)} 
              placeholder="환전액 (최소 3000)" 
            />
            <button type="button" className="profile-finance-btn" onClick={handleWithdraw}>
              환전하기
            </button>
          </div>
          <p className="profile-finance-note">* 1 C 코인 = 10원</p>
        </div>

        <button type="button" className="profile-signout" onClick={handleSignOut}>
          로그아웃
        </button>
      </div>
    </div>
  )
}
