// お気に入りイベント管理のユーティリティ関数

export interface FavoriteEvent {
  id: string
  name: string
  type: 'tournament' | 'practice'
  event_date: string
  venue: string
  prefecture: string
  image: string
  favoritedAt: string
}

// お気に入りイベントを取得
export function getFavoriteEvents(): FavoriteEvent[] {
  const stored = localStorage.getItem('favorite_events')
  return stored ? JSON.parse(stored) : []
}

// イベントをお気に入りに追加
export function addFavoriteEvent(event: Omit<FavoriteEvent, 'favoritedAt'>): void {
  const favorites = getFavoriteEvents()
  
  // 既にお気に入りの場合は何もしない
  if (favorites.some(e => e.id === event.id)) {
    return
  }
  
  const newFavorite: FavoriteEvent = {
    ...event,
    favoritedAt: new Date().toISOString()
  }
  
  favorites.push(newFavorite)
  localStorage.setItem('favorite_events', JSON.stringify(favorites))
}

// イベントをお気に入りから削除
export function removeFavoriteEvent(eventId: string): void {
  const favorites = getFavoriteEvents()
  const filtered = favorites.filter(e => e.id !== eventId)
  localStorage.setItem('favorite_events', JSON.stringify(filtered))
}

// 特定のイベントがお気に入りかチェック
export function isFavoriteEvent(eventId: string): boolean {
  const favorites = getFavoriteEvents()
  return favorites.some(e => e.id === eventId)
}

// お気に入りの切り替え
export function toggleFavoriteEvent(event: Omit<FavoriteEvent, 'favoritedAt'>): boolean {
  if (isFavoriteEvent(event.id)) {
    removeFavoriteEvent(event.id)
    return false
  } else {
    addFavoriteEvent(event)
    return true
  }
}