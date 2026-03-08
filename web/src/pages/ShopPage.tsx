import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import CoinIcon from '../components/CoinIcon'
import './ShopPage.css'

const COIN_TO_KRW = 10

const PRODUCTS = [
  { id: '500', coins: 500, priceKr: 500 * COIN_TO_KRW },
  { id: '1000', coins: 1000, priceKr: 1000 * COIN_TO_KRW },
] as const

export default function ShopPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, addCoins } = useProfile()
  const navigate = useNavigate()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true })
  }, [user, authLoading, navigate])

  const handlePurchase = async (coins: number, productId: string) => {
    if (!user) return
    setPurchasing(productId)
    await addCoins(coins)
    setPurchasing(null)
  }

  if (authLoading || !user) {
    return (
      <div className="shop-page">
        <div className="shop-inner"><p className="shop-loading">로딩 중...</p></div>
      </div>
    )
  }

  return (
    <div className="shop-page">
      <div className="shop-inner">
        <Link to="/" className="shop-back">← 돌아가기</Link>
        <h1 className="shop-title">상점</h1>
        {profile && (
          <p className="shop-balance">
            <CoinIcon size={24} />
            <span>{profile.coins.toLocaleString()} 챌린저스 코인</span>
          </p>
        )}
        <p className="shop-note">1 챌린저스 코인 = 10원 (데모: 구매 시 코인만 추가됩니다)</p>
        <div className="shop-grid">
          {PRODUCTS.map(({ id, coins, priceKr }) => (
            <div key={id} className="shop-card">
              <div className="shop-card-coins">
                <CoinIcon size={56} />
                <span className="shop-card-amount">{coins.toLocaleString()} 코인</span>
              </div>
              <p className="shop-card-price">{priceKr.toLocaleString()}원</p>
              <button
                type="button"
                className="shop-card-btn"
                disabled={!!purchasing}
                onClick={() => handlePurchase(coins, id)}
              >
                {purchasing === id ? '처리 중...' : '구매하기'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
