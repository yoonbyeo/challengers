import { useParams, Link } from 'react-router-dom'
import { getChallengeById } from '../data/challenges'
import './ChallengeDetail.css'

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>()
  const challenge = id ? getChallengeById(id) : undefined

  const handleParticipate = () => {
    alert('참여 기능은 준비 중입니다.')
  }

  if (!challenge) {
    return (
      <div className="challenge-detail-page">
        <div className="challenge-detail-card">
          <p>챌린지를 찾을 수 없습니다.</p>
          <Link to="/" className="challenge-detail-btn-browse">둘러보기</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-detail-page">
      <div className="challenge-detail-card">
        <span className="challenge-detail-badge">{challenge.topic}</span>
        <h1 className="challenge-detail-title">{challenge.title}</h1>
        <p className="challenge-detail-prize">상금 {challenge.prize}</p>
        <p className="challenge-detail-meta">참가자 {challenge.participantCount}명 · 마감 {challenge.endDate}</p>
        {challenge.description && (
          <p className="challenge-detail-desc">{challenge.description}</p>
        )}

        <div className="challenge-detail-actions">
          <button type="button" className="challenge-detail-btn-participate" onClick={handleParticipate}>
            참여하기
          </button>
          <Link to="/" className="challenge-detail-btn-browse">
            둘러보기
          </Link>
        </div>

        <section className="challenge-detail-rankings">
          <h3 className="challenge-detail-rankings-title">순위</h3>
          <div className="challenge-detail-rankings-grid">
            <div className="challenge-detail-rank-item">
              <span className="challenge-detail-rank-num">1위</span>
              <span className="challenge-detail-rank-placeholder">—</span>
            </div>
            <div className="challenge-detail-rank-item">
              <span className="challenge-detail-rank-num">2위</span>
              <span className="challenge-detail-rank-placeholder">—</span>
            </div>
            <div className="challenge-detail-rank-item">
              <span className="challenge-detail-rank-num">3위</span>
              <span className="challenge-detail-rank-placeholder">—</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
