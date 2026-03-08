import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getChallengeById, checkChallengeState, getEstimatedPrizePool, getExpectedPrizes, CHALLENGE_ENTRY_FEE_COINS } from '../data/challenges'
import type { Challenge } from '../data/challenges'
import { useAuth } from '../contexts/AuthContext'
import { useChallengeParticipation } from '../hooks/useChallengeParticipation'
import './ChallengeDetail.css'

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>()
  const initialChallenge = id ? getChallengeById(id) : undefined
  const [challenge, setChallenge] = useState<Challenge | undefined>(initialChallenge)
  const { user } = useAuth()
  const { participantCount, hasParticipated, loading: countLoading, participate, participating } = useChallengeParticipation(id)

  useEffect(() => {
    setChallenge(id ? getChallengeById(id) : undefined)
  }, [id])

  const handleParticipate = async () => {
    if (!challenge) return
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    const success = await participate(challenge.entryFee)
    if (success) {
      alert(`참여가 완료되었습니다! ${challenge.entryFee.toLocaleString()}원(참가비)이 결제되었습니다.`)
    } else {
      alert('참여에 실패했습니다. 코인 잔액을 확인해 주세요.')
    }
  }

  if (!challenge) {
    return (
      <div className="challenge-detail-page">
        <div className="challenge-detail-card">
          <Link to="/" className="challenge-detail-back">← 돌아가기</Link>
          <p>챌린지를 찾을 수 없습니다.</p>
          <Link to="/" className="challenge-detail-btn-browse">둘러보기</Link>
        </div>
      </div>
    )
  }

  const challengeWithCount = { ...challenge, participantCount }
  const status = checkChallengeState(challengeWithCount)
  const pool = getEstimatedPrizePool(challengeWithCount)
  const prizes = getExpectedPrizes(challengeWithCount)

  return (
    <div className="challenge-detail-page">
      <div className="challenge-detail-card">
        <Link to="/" className="challenge-detail-back">← 돌아가기</Link>
        <span className="challenge-detail-badge">{challenge.topic}</span>
        <h1 className="challenge-detail-title">{challenge.title}</h1>
        
        {status === 'canceled' && <p className="challenge-detail-status-canceled">⚠️ 24시간 내 참여 인원 미달로 개설 실패(폐지)된 챌린지입니다.</p>}
        {status === 'pending' && <p className="challenge-detail-status-pending">⏳ 진행 대기 중 (최소 10명 필요, 현재 {participantCount}명)</p>}
        {status === 'active' && <p className="challenge-detail-status-active">🚀 현재 진행 중인 챌린지입니다!</p>}

        {countLoading ? (
          <p className="challenge-detail-prize">목표 상금풀: …</p>
        ) : (
          <p className="challenge-detail-prize">목표 상금풀: {pool.toLocaleString()}원</p>
        )}
        <p className="challenge-detail-meta">참가비: {challenge.entryFee.toLocaleString()}원 ({CHALLENGE_ENTRY_FEE_COINS} 챌린저스 코인) · 참가자 {countLoading ? '…' : participantCount}명 · 마감 {challenge.endDate}</p>
        {challenge.description && (
          <p className="challenge-detail-desc">{challenge.description}</p>
        )}

        <div className="challenge-detail-actions">
          <button
            type="button"
            className="challenge-detail-btn-participate"
            onClick={handleParticipate}
            disabled={!user || hasParticipated || participating}
          >
            {hasParticipated ? '참여 완료' : participating ? '처리 중...' : '참여하기'}
          </button>
          <Link to={`/challenge/${id}/browse`} className="challenge-detail-btn-browse">
            둘러보기
          </Link>
        </div>

        <section className="challenge-detail-rankings">
          <h3 className="challenge-detail-rankings-title">예상 상금 (C 코인)</h3>
          <p className="challenge-detail-c-coin-note">* 순위는 좋아요 수로 결정. 1 C코인 = 10원</p>
          <div className="challenge-detail-rankings-grid">
            <div className="challenge-detail-rank-item">
              <span className="challenge-detail-rank-num">1위</span>
              <span className="challenge-detail-rank-placeholder">{Math.floor(prizes.first / 10).toLocaleString()} C</span>
            </div>
            <div className="challenge-detail-rank-item">
              <span className="challenge-detail-rank-num">2위</span>
              <span className="challenge-detail-rank-placeholder">{Math.floor(prizes.second / 10).toLocaleString()} C</span>
            </div>
            <div className="challenge-detail-rank-item">
              <span className="challenge-detail-rank-num">3위</span>
              <span className="challenge-detail-rank-placeholder">{Math.floor(prizes.third / 10).toLocaleString()} C</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
