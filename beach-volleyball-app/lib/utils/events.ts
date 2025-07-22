// イベント管理のユーティリティ関数

export interface Event {
  id: string
  name: string
  event_date: string
  start_time: string
  venue: string
  prefecture: string
  participants: number
  maxParticipants: number
  entryFee: number
  type: 'tournament' | 'practice'
  image: string
  description: string
  beginnerFriendly: boolean
  status: 'recruiting' | 'closed' | 'finished'
  rules?: string
  prizes?: {
    first: string
    second: string
    third: string
  }
  skillLevel?: string
  organizerId?: string
  organizerName?: string
  createdAt: string
  recurring?: boolean
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly'
  recurringDays?: string[]
  recurringEndDate?: string
}

// すべてのイベントを取得（mockData + localStorage）
export function getAllEvents(): Event[] {
  if (typeof window === 'undefined') return []
  
  // LocalStorageから保存されたイベントを取得
  const savedEvents = localStorage.getItem('created_events')
  const createdEvents = savedEvents ? JSON.parse(savedEvents) : []
  
  // mockEventsをインポート
  const { mockEvents } = require('@/lib/mock-data')
  
  // 作成されたイベントとモックデータを結合
  return [...createdEvents, ...mockEvents]
}

// イベントを作成
export function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'participants' | 'status'>): Event {
  const newEvent: Event = {
    ...event,
    id: `event_${Date.now()}`,
    createdAt: new Date().toISOString(),
    participants: 0,
    status: 'recruiting'
  }
  
  // LocalStorageから既存のイベントを取得
  const savedEvents = localStorage.getItem('created_events')
  const events = savedEvents ? JSON.parse(savedEvents) : []
  
  // 新しいイベントを追加
  events.unshift(newEvent)
  
  // LocalStorageに保存
  localStorage.setItem('created_events', JSON.stringify(events))
  
  return newEvent
}

// 特定のイベントを取得
export function getEventById(id: string): Event | null {
  const events = getAllEvents()
  return events.find(e => e.id === id) || null
}

// 主催者のイベントを取得
export function getOrganizerEvents(organizerId: string): Event[] {
  const events = getAllEvents()
  return events.filter(e => e.organizerId === organizerId)
}

// 画像をBase64に変換
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}