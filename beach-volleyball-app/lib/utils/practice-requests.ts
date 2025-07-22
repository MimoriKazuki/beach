// 練習会参加申請管理のユーティリティ関数

export interface PracticeRequest {
  id: string
  eventId: string
  eventName: string
  eventDate: string
  eventVenue: string
  userId: string
  userName: string
  userEmail: string
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  processedAt?: string
  organizerId: string
}

// 参加申請を取得（ユーザー用）
export function getUserPracticeRequests(userId: string): PracticeRequest[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('practice_participation_requests')
  if (!stored) return []
  const requests: PracticeRequest[] = JSON.parse(stored)
  return requests.filter(r => r.userId === userId)
}

// 参加申請を取得（主催者用）
export function getOrganizerPracticeRequests(organizerId: string): PracticeRequest[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('practice_participation_requests')
  if (!stored) return []
  const requests: PracticeRequest[] = JSON.parse(stored)
  return requests.filter(r => r.organizerId === organizerId)
}

// 特定のイベントの参加申請を取得
export function getEventPracticeRequests(eventId: string): PracticeRequest[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('practice_participation_requests')
  if (!stored) return []
  const requests: PracticeRequest[] = JSON.parse(stored)
  return requests.filter(r => r.eventId === eventId)
}

// 参加申請を作成
export function createPracticeRequest(request: Omit<PracticeRequest, 'id' | 'createdAt'>): void {
  const requests = getAllPracticeRequests()
  
  // 既に申請済みかチェック
  const existing = requests.find(r => 
    r.eventId === request.eventId && 
    r.userId === request.userId &&
    r.status !== 'rejected'
  )
  
  if (existing) {
    throw new Error('既に申請済みです')
  }
  
  const newRequest: PracticeRequest = {
    ...request,
    id: `pr_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  requests.push(newRequest)
  localStorage.setItem('practice_participation_requests', JSON.stringify(requests))
}

// 参加申請のステータスを更新
export function updatePracticeRequestStatus(
  requestId: string, 
  status: 'approved' | 'rejected',
  organizerId: string
): void {
  const requests = getAllPracticeRequests()
  const requestIndex = requests.findIndex(r => r.id === requestId)
  
  if (requestIndex === -1) {
    throw new Error('申請が見つかりません')
  }
  
  const request = requests[requestIndex]
  
  // 権限チェック
  if (request.organizerId !== organizerId) {
    throw new Error('この申請を処理する権限がありません')
  }
  
  requests[requestIndex] = {
    ...request,
    status,
    processedAt: new Date().toISOString()
  }
  
  localStorage.setItem('practice_participation_requests', JSON.stringify(requests))
  
  // 承認された場合は参加イベントに追加
  if (status === 'approved') {
    // TODO: 本来はここで承認されたユーザーの参加イベントに追加する処理が必要
    // 現在のデモでは、ユーザー自身が承認状態を確認して参加イベントに追加される
    console.log(`ユーザー ${request.userId} をイベント ${request.eventId} に追加`)
  }
}

// 特定のイベントに対する特定ユーザーの申請状態を確認
export function getUserRequestStatus(eventId: string, userId: string): PracticeRequest | null {
  const requests = getAllPracticeRequests()
  return requests.find(r => 
    r.eventId === eventId && 
    r.userId === userId
  ) || null
}

// すべての参加申請を取得（内部用）
function getAllPracticeRequests(): PracticeRequest[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('practice_participation_requests')
  return stored ? JSON.parse(stored) : []
}