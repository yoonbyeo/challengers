export type Challenge = {
  id: string
  title: string
  topic: string
  prize: string
  participantCount: number
  endDate: string
  description?: string
}

export const TOPICS = ['전체', '운동', '일상', '음식', '예능'] as const

export const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', title: '오늘의 1만 보 걸기', topic: '운동', prize: '50만 원', participantCount: 128, endDate: '2025-03-15', description: '하루 1만 보를 걸고 인증해 보세요.' },
  { id: '2', title: '집밥 한 끼 챌린지', topic: '음식', prize: '30만 원', participantCount: 89, endDate: '2025-03-20', description: '직접 만든 집밥을 영상으로 공유하세요.' },
  { id: '3', title: '아침 6시 기상', topic: '일상', prize: '100만 원', participantCount: 256, endDate: '2025-03-25', description: '7일 연속 아침 6시 기상 인증.' },
  { id: '4', title: '즐거운 댄스 커버', topic: '예능', prize: '80만 원', participantCount: 64, endDate: '2025-03-18', description: '인기 곡으로 댄스 커버 영상을 올려 주세요.' },
  { id: '5', title: '플랭크 3분 버티기', topic: '운동', prize: '40만 원', participantCount: 72, endDate: '2025-03-22', description: '플랭크 자세를 3분 이상 유지하세요.' },
  { id: '6', title: '나만의 레시피', topic: '음식', prize: '60만 원', participantCount: 45, endDate: '2025-03-28', description: '창의적인 요리 레시피를 소개해 보세요.' },
  { id: '7', title: '일상 vlog 1주일', topic: '일상', prize: '20만 원', participantCount: 112, endDate: '2025-03-30', description: '7일간의 일상을 vlog로 담아 보세요.' },
  { id: '8', title: '노래 커버 챌린지', topic: '예능', prize: '70만 원', participantCount: 38, endDate: '2025-03-19', description: '좋아하는 곡을 커버해 보세요.' },
]

export function getChallengeById(id: string): Challenge | undefined {
  return MOCK_CHALLENGES.find((c) => c.id === id)
}

export function getChallengesByTopic(topic: string): Challenge[] {
  if (topic === '전체') return [...MOCK_CHALLENGES]
  return MOCK_CHALLENGES.filter((c) => c.topic === topic)
}
