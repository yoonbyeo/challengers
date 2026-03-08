// @ts-nocheck
export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'canceled'

export type Challenge = {
  id: string
  title: string
  topic: string
  entryFee: number
  createdAt: string
  status: ChallengeStatus
  participantCount: number
  endDate: string
  description?: string
}

export const TOPICS = ['전체', '운동', '일상', '음식', '예능'] as const

/** 모든 챌린지 참가비: 5000원 = 500 챌린저스 코인 (1코인=10원) */
export const CHALLENGE_ENTRY_FEE_KRW = 5000
export const CHALLENGE_ENTRY_FEE_COINS = 500

export const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', title: '오늘의 1만 보 걸기', topic: '운동', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-01T00:00:00Z', status: 'active', participantCount: 128, endDate: '2025-03-15', description: '하루 1만 보를 걸고 인증해 보세요.' },
  { id: '2', title: '집밥 한 끼 챌린지', topic: '음식', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-02T00:00:00Z', status: 'active', participantCount: 89, endDate: '2025-03-20', description: '직접 만든 집밥을 영상으로 공유하세요.' },
  { id: '3', title: '아침 6시 기상', topic: '일상', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-03T00:00:00Z', status: 'active', participantCount: 256, endDate: '2025-03-25', description: '7일 연속 아침 6시 기상 인증.' },
  { id: '4', title: '즐거운 댄스 커버', topic: '예능', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-04T00:00:00Z', status: 'active', participantCount: 64, endDate: '2025-03-18', description: '인기 곡으로 댄스 커버 영상을 올려 주세요.' },
  { id: '5', title: '플랭크 3분 버티기', topic: '운동', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-05T00:00:00Z', status: 'active', participantCount: 72, endDate: '2025-03-22', description: '플랭크 자세를 3분 이상 유지하세요.' },
  { id: '6', title: '나만의 레시피', topic: '음식', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-06T00:00:00Z', status: 'active', participantCount: 45, endDate: '2025-03-28', description: '창의적인 요리 레시피를 소개해 보세요.' },
  { id: '7', title: '일상 vlog 1주일', topic: '일상', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: new Date().toISOString(), status: 'pending', participantCount: 8, endDate: '2025-03-30', description: '7일간의 일상을 vlog로 담아 보세요.' },
  { id: '8', title: '노래 커버 챌린지', topic: '예능', entryFee: CHALLENGE_ENTRY_FEE_KRW, createdAt: '2025-03-01T00:00:00Z', status: 'canceled', participantCount: 5, endDate: '2025-03-19', description: '좋아하는 곡을 커버해 보세요.' },
]

export function checkChallengeState(challenge: Challenge): ChallengeStatus {
  if (challenge.status === 'canceled' || challenge.status === 'completed' || challenge.status === 'active') return challenge.status;
  
  const now = new Date();
  const created = new Date(challenge.createdAt);
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  if (diffHours >= 24) {
    if (challenge.participantCount >= 10) {
      return 'active';
    } else {
      return 'canceled';
    }
  }
  return 'pending';
}

export function getEstimatedPrizePool(challenge: Challenge): number {
  return challenge.entryFee * challenge.participantCount;
}

export function getExpectedPrizes(challenge: Challenge) {
  const pool = getEstimatedPrizePool(challenge);
  return {
    first: challenge.entryFee + (pool * 0.25),
    second: challenge.entryFee + (pool * 0.15),
    third: challenge.entryFee + (pool * 0.10),
  };
}

export function getChallengeById(id: string): Challenge | undefined {
  return MOCK_CHALLENGES.find((c) => c.id === id)
}

export function getChallengesByTopic(topic: string): Challenge[] {
  if (topic === '전체') return [...MOCK_CHALLENGES]
  return MOCK_CHALLENGES.filter((c) => c.topic === topic)
}

export type ChallengeVideo = {
  id: string
  challengeId: string
  title: string
  likeCount: number
  thumbnailUrl?: string
}

const MOCK_VIDEOS: ChallengeVideo[] = [
  { id: 'v1', challengeId: '1', title: '오늘 1만 보 완료!', likeCount: 42 },
  { id: 'v2', challengeId: '1', title: '걷기 기록 인증', likeCount: 28 },
  { id: 'v3', challengeId: '2', title: '집밥 한 끼 레시피', likeCount: 56 },
  { id: 'v4', challengeId: '2', title: '오늘의 요리', likeCount: 31 },
  { id: 'v5', challengeId: '3', title: '6시 기상 인증 7일차', likeCount: 89 },
  { id: 'v6', challengeId: '3', title: '아침 루틴 공유', likeCount: 67 },
  { id: 'v7', challengeId: '4', title: '댄스 커버 영상', likeCount: 120 },
  { id: 'v8', challengeId: '5', title: '플랭크 3분 성공', likeCount: 45 },
  { id: 'v9', challengeId: '6', title: '나만의 파스타', likeCount: 38 },
  { id: 'v10', challengeId: '7', title: '일상 vlog 1주일', likeCount: 52 },
  { id: 'v11', challengeId: '8', title: '노래 커버', likeCount: 74 },
]

export function getMockVideosByChallengeId(challengeId: string): ChallengeVideo[] {
  return MOCK_VIDEOS.filter((v) => v.challengeId === challengeId)
}
