import { useParams, Link } from 'react-router-dom'
import { getChallengeById, getMockVideosByChallengeId } from '../data/challenges'
import './ChallengeBrowse.css'

export default function ChallengeBrowse() {
  const { id } = useParams<{ id: string }>()
  const challenge = id ? getChallengeById(id) : undefined
  const videos = id ? getMockVideosByChallengeId(id) : []

  if (!challenge) {
    return (
      <div className="challenge-browse-page">
        <div className="challenge-browse-card">
          <Link to="/" className="challenge-browse-back">← 돌아가기</Link>
          <p>챌린지를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="challenge-browse-page">
      <div className="challenge-browse-container">
        <div className="challenge-browse-header">
          <Link to="/" className="challenge-browse-back">← 돌아가기</Link>
          <Link to={`/challenge/${id}`} className="challenge-browse-back-detail">챌린지 상세로</Link>
        </div>
        <h1 className="challenge-browse-title">{challenge.title}</h1>
        <p className="challenge-browse-subtitle">이 챌린지 영상</p>

        <div className="challenge-browse-grid">
          {videos.length === 0 ? (
            <p className="challenge-browse-empty">아직 올라온 영상이 없습니다.</p>
          ) : (
            videos.map((v) => (
              <div key={v.id} className="challenge-browse-video-card">
                <div className="challenge-browse-video-thumb">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt="" />
                  ) : (
                    <span className="challenge-browse-video-placeholder">영상</span>
                  )}
                </div>
                <h3 className="challenge-browse-video-title">{v.title}</h3>
                <p className="challenge-browse-video-likes">좋아요 {v.likeCount}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
