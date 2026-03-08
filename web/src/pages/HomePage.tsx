import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { TOPICS, getChallengesByTopic } from '../data/challenges'
import type { Challenge } from '../data/challenges'
import './HomePage.css'

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('전체')
  const gridRef = useRef<HTMLDivElement>(null)

  const challenges = getChallengesByTopic(selectedTopic)

  const handleBrowse = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-logo">
          챌린저스
        </Link>
        <Link to="/login" className="home-login">
          로그인
        </Link>
      </header>

      <section className="home-main-actions">
        <Link to="/login" className="home-btn-participate">
          참여하기
        </Link>
        <button type="button" className="home-btn-browse" onClick={handleBrowse}>
          둘러보기
        </button>
      </section>

      <div className="home-tabs">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            className={`home-tab ${selectedTopic === topic ? 'active' : ''}`}
            onClick={() => setSelectedTopic(topic)}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="home-grid home-grid-ref" ref={gridRef}>
        {challenges.map((c: Challenge) => (
          <Link
            key={c.id}
            to={`/challenge/${c.id}`}
            className="home-card"
          >
            <span className="home-card-badge">{c.topic}</span>
            <h3 className="home-card-title">{c.title}</h3>
            <p className="home-card-prize">상금 {c.prize}</p>
            <p className="home-card-meta">참가자 {c.participantCount}명 · D-{c.endDate}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
