// イベント参加管理のユーティリティ関数

export interface ParticipatingEvent {
  id: string
  name: string
  type: 'tournament' | 'practice'
  event_date: string
  start_time?: string
  venue: string
  image: string
  registeredAt: string
}

// 参加イベントを取得
export function getParticipatingEvents(): ParticipatingEvent[] {
  const stored = localStorage.getItem('participating_events')
  return stored ? JSON.parse(stored) : []
}

// イベントに参加登録
export function addParticipatingEvent(event: Omit<ParticipatingEvent, 'registeredAt'>): void {
  const events = getParticipatingEvents()
  
  // 既に参加している場合は何もしない
  if (events.some(e => e.id === event.id)) {
    return
  }
  
  const newEvent: ParticipatingEvent = {
    ...event,
    registeredAt: new Date().toISOString()
  }
  
  events.push(newEvent)
  localStorage.setItem('participating_events', JSON.stringify(events))
}

// イベント参加をキャンセル
export function removeParticipatingEvent(eventId: string): void {
  const events = getParticipatingEvents()
  const filtered = events.filter(e => e.id !== eventId)
  localStorage.setItem('participating_events', JSON.stringify(filtered))
}

// 特定のイベントに参加しているかチェック
export function isParticipatingInEvent(eventId: string): boolean {
  const events = getParticipatingEvents()
  return events.some(e => e.id === eventId)
}

// 参加予定のイベントを日付順（新しい順）で取得
export function getUpcomingEvents(): ParticipatingEvent[] {
  const events = getParticipatingEvents()
  const now = new Date()
  
  return events
    .filter(e => {
      // イベントの日付と開始時刻から終了時刻を計算
      const eventDate = new Date(e.event_date)
      const [hours, minutes] = (e as any).start_time?.split(':').map(Number) || [23, 59]
      eventDate.setHours(hours, minutes)
      
      // イベントは3時間で終了すると仮定
      const eventEndTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)
      
      // 現在時刻がイベント終了時刻より前なら参加予定
      return now < eventEndTime
    })
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
}

// 参加履歴（過去のイベント）を取得
export function getPastEvents(): ParticipatingEvent[] {
  const events = getParticipatingEvents()
  const now = new Date()
  
  return events
    .filter(e => {
      // イベントの日付と開始時刻から終了時刻を計算
      const eventDate = new Date(e.event_date)
      const [hours, minutes] = (e as any).start_time?.split(':').map(Number) || [23, 59]
      eventDate.setHours(hours, minutes)
      
      // イベントは3時間で終了すると仮定
      const eventEndTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000)
      
      // 現在時刻がイベント終了時刻より後なら参加履歴
      return now >= eventEndTime
    })
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
}