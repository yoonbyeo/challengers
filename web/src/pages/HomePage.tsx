import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TOPICS, getChallengesByTopic } from '../data/challenges'
import type { Challenge } from '../data/challenges'
import './HomePage.css'

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('전체')
  const challenges = getChallengesByTopic(selectedTopic)

  return (
    <div className="home-page">
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

      <div className="home-grid">
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
