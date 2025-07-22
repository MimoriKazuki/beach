import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type EventInsert = Database['public']['Tables']['events']['Insert']
type EventRow = Database['public']['Tables']['events']['Row']

export interface EventWithDetails extends EventRow {
  participants_count?: number
  is_participating?: boolean
}

// 画像をBase64に変換
async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 画像をSupabase Storageにアップロード
export async function uploadEventImage(file: File): Promise<string | null> {
  // デモユーザーの場合はデフォルト画像URLを返す（容量制限対策）
  const demoUser = localStorage.getItem('demo_user')
  if (demoUser) {
    // ランダムなデフォルト画像を選択
    const defaultImages = [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
    ]
    const randomIndex = Math.floor(Math.random() * defaultImages.length)
    console.log('Demo user: Using default image URL')
    return defaultImages[randomIndex]
  }
  
  // 通常のSupabaseアップロード
  const supabase = createClient()
  
  const fileName = `${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage
    .from('event-images')
    .upload(fileName, file)

  if (error) {
    console.error('Error uploading image:', error.message || error)
    console.error('Upload error details:', { 
      error: error,
      fileName: fileName,
      bucket: 'event-images'
    })
    // エラー時もBase64で返す
    try {
      const base64 = await convertImageToBase64(file)
      return base64
    } catch (e) {
      return null
    }
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('event-images')
    .getPublicUrl(fileName)

  return publicUrl
}

// イベントを作成
export async function createEvent(event: {
  name: string
  type: 'tournament' | 'practice'
  event_date: string
  start_time: string
  end_time?: string
  venue: string
  prefecture: string
  description?: string
  image_url?: string
  max_participants?: number
  entry_fee?: number
  beginner_friendly?: boolean
  skill_level?: string
  rules?: string
  prizes?: {
    first: string
    second: string
    third: string
  }
  recurring?: boolean
  recurring_frequency?: 'weekly' | 'biweekly' | 'monthly'
  recurring_days?: string[]
  recurring_end_date?: string
}) {
  const supabase = createClient()
  
  // デモユーザーの場合は、ローカルストレージに保存するためnullを返す
  const demoUser = localStorage.getItem('demo_user')
  
  if (demoUser) {
    // デモユーザーの場合は、直接ローカルストレージに保存
    const userData = JSON.parse(demoUser)
    const createdAt = new Date().toISOString()
    const newEvent = {
      id: `event_${Date.now()}`,
      ...event,
      created_at: createdAt,
      createdAt: createdAt, // 両方のフィールドを設定
      organizer_id: userData.id || 'demo_user',
      organizer_name: userData.name,
      creator_id: userData.id || 'demo_user',
      participants: 0,
      status: 'recruiting' as const
    }
    
    const savedEvents = localStorage.getItem('created_events')
    const events = savedEvents ? JSON.parse(savedEvents) : []
    
    // 古いイベント（30日以上前）を削除して容量を節約
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const filteredEvents = events.filter((e: any) => {
      const eventDate = new Date(e.event_date)
      return eventDate > thirtyDaysAgo
    })
    
    // 新しいイベントを追加
    filteredEvents.unshift(newEvent)
    
    // 最大50件まで保存（容量制限対策）
    const eventsToSave = filteredEvents.slice(0, 50)
    
    localStorage.setItem('created_events', JSON.stringify(eventsToSave))
    
    console.log('Demo user event created in localStorage:', newEvent)
    return newEvent
  }
  
  // 通常のSupabaseユーザー
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    throw new Error('ユーザーが認証されていません')
  }
  const organizerId = user.user.id

  // 空文字列をnullまたはundefinedに変換してデータを整形
  const cleanedEvent = {
    name: event.name,
    type: event.type,
    event_date: new Date(event.event_date).toISOString(),
    start_time: event.start_time,
    end_time: event.end_time || null,
    venue: event.venue,
    prefecture: event.prefecture,
    description: event.description || null,
    image_url: event.image_url || null,
    max_participants: event.max_participants || null,
    entry_fee: event.entry_fee || 0,
    beginner_friendly: event.beginner_friendly || false,
    skill_level: event.skill_level && event.skill_level !== "all" ? event.skill_level : null,
    rules: event.rules || null,
    prizes: event.prizes || null,
    status: 'recruiting' as const,
    organizer_id: organizerId,
    recurring: event.recurring || false,
    recurring_frequency: event.recurring_frequency || null,
    recurring_days: event.recurring_days?.length ? event.recurring_days : null,
    recurring_end_date: event.recurring_end_date ? event.recurring_end_date : null
  }
  
  const eventData: EventInsert = cleanedEvent

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event in Supabase:', error.message || error)
      console.error('Error details:', { 
        code: error.code, 
        details: error.details, 
        hint: error.hint,
        organizerId: organizerId,
        eventData: eventData
      })
      
      // Supabaseエラー時はローカルストレージに保存
      const createdAt = new Date().toISOString()
      const newEvent = {
        id: `event_${Date.now()}`,
        ...event,
        created_at: createdAt,
        createdAt: createdAt, // 両方のフィールドを設定
        organizer_id: organizerId,
        creator_id: organizerId,
        participants: 0,
        status: 'recruiting' as const
      }
      
      const savedEvents = localStorage.getItem('created_events')
      const events = savedEvents ? JSON.parse(savedEvents) : []
      events.unshift(newEvent)
      localStorage.setItem('created_events', JSON.stringify(events))
      
      return newEvent
    }

    // 定期開催イベントの場合、複数のイベントを作成
    if (event.recurring && event.recurring_frequency && event.recurring_end_date) {
      await createRecurringEvents(data.id, event)
    }

    return data
  } catch (error) {
    console.error('Unexpected error creating event:', error)
    
    // エラー時はローカルストレージに保存
    const createdAt = new Date().toISOString()
    const newEvent = {
      id: `event_${Date.now()}`,
      ...event,
      created_at: createdAt,
      createdAt: createdAt, // 両方のフィールドを設定
      organizer_id: organizerId,
      participants: 0,
      status: 'recruiting' as const
    }
    
    const savedEvents = localStorage.getItem('created_events')
    const events = savedEvents ? JSON.parse(savedEvents) : []
    events.unshift(newEvent)
    localStorage.setItem('created_events', JSON.stringify(events))
    
    return newEvent
  }
}

// 定期開催イベントを作成
async function createRecurringEvents(parentEventId: string, event: any) {
  const supabase = createClient()
  const events = []
  
  const startDate = new Date(event.event_date)
  const endDate = new Date(event.recurring_end_date)
  
  let currentDate = new Date(startDate)
  
  // 頻度に応じて日付を進める
  const incrementDays = {
    'weekly': 7,
    'biweekly': 14,
    'monthly': 30
  }
  
  while (currentDate <= endDate) {
    // 最初のイベントはスキップ（既に作成済み）
    if (currentDate.getTime() !== startDate.getTime()) {
      const recurringEvent = {
        ...event,
        event_date: currentDate.toISOString(),
        name: `${event.name} (${currentDate.toLocaleDateString('ja-JP')})`
      }
      events.push(recurringEvent)
    }
    
    // 次の日付に進める
    currentDate.setDate(currentDate.getDate() + incrementDays[event.recurring_frequency])
  }
  
  if (events.length > 0) {
    const { error } = await supabase
      .from('events')
      .insert(events)
    
    if (error) {
      console.error('Error creating recurring events:', error)
    }
  }
}

// イベント一覧を取得
export async function getEvents(filters?: {
  prefecture?: string
  region?: string
  type?: 'tournament' | 'practice'
  beginner_friendly?: boolean
}) {
  const supabase = createClient()
  
  // デモユーザーの場合は直接ローカルストレージから読み込む
  const demoUser = localStorage.getItem('demo_user')
  if (demoUser) {
    console.log('Demo user detected, loading from localStorage only')
    
    const savedEvents = localStorage.getItem('created_events')
    const createdEvents = savedEvents ? JSON.parse(savedEvents) : []
    console.log('Created events from localStorage:', createdEvents)
    
    const { mockEvents } = await import('@/lib/mock-data')
    
    // 削除されたイベントIDを取得
    const deletedEvents = localStorage.getItem('deleted_events')
    const deletedList = deletedEvents ? JSON.parse(deletedEvents) : []
    
    // モックイベントから削除されたものを除外
    const filteredMockEvents = mockEvents.filter(e => !deletedList.includes(e.id))
    
    let allEvents = [...createdEvents, ...filteredMockEvents]
    console.log('All events (created + mock):', allEvents.length)
    
    // フィルタリング
    if (filters?.type) {
      allEvents = allEvents.filter(e => e.type === filters.type)
    }
    if (filters?.prefecture) {
      allEvents = allEvents.filter(e => e.prefecture === filters.prefecture)
    }
    if (filters?.region) {
      // 地域フィルタリング
      const { REGION_PREFECTURES } = await import('@/lib/constants/regions')
      const regionPrefectures = REGION_PREFECTURES[filters.region as keyof typeof REGION_PREFECTURES] || []
      allEvents = allEvents.filter(e => regionPrefectures.includes(e.prefecture))
      console.log(`Filtering by region "${filters.region}", prefectures:`, regionPrefectures)
    }
    if (filters?.beginner_friendly) {
      allEvents = allEvents.filter(e => e.beginnerFriendly || e.beginner_friendly)
    }
    
    // 過去のイベントを除外し、日付順にソート
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 今日の開始時刻に設定
    
    console.log('Filtering events, current date:', now)
    
    const filteredEvents = allEvents.filter(e => {
      // 日付パースの処理
      let eventDate: Date
      
      // 日本語形式の日付 "YYYY年MM月DD日"
      const japaneseMatch = e.event_date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
      if (japaneseMatch) {
        eventDate = new Date(
          parseInt(japaneseMatch[1]),
          parseInt(japaneseMatch[2]) - 1,
          parseInt(japaneseMatch[3])
        )
      } else if (e.event_date.match(/^\d{4}-\d{2}-\d{2}/)) {
        // ISO形式の日付 "YYYY-MM-DD"
        eventDate = new Date(e.event_date)
      } else {
        console.warn('Invalid date format:', e.event_date)
        return false
      }
      
      eventDate.setHours(0, 0, 0, 0)
      const include = eventDate >= now
      console.log(`Event "${e.name}" date: ${e.event_date} (${eventDate.toISOString()}) - include: ${include}`)
      return include
    })
    
    console.log('Filtered events count:', filteredEvents.length)
    
    return filteredEvents
      .sort((a, b) => {
        // NEWイベントを最初に表示
        const aIsNew = isNewEvent(a.createdAt || a.created_at)
        const bIsNew = isNewEvent(b.createdAt || b.created_at)
        if (aIsNew && !bIsNew) return -1
        if (!aIsNew && bIsNew) return 1
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      })
      .map(e => ({
        ...e,
        participants_count: e.participants || e.participants_count || 0,
        is_participating: false,
        image_url: e.image || e.image_url,
        beginner_friendly: e.beginnerFriendly || e.beginner_friendly,
        created_at: e.createdAt || e.created_at
      }))
  }
  
  try {
    // Supabaseからイベントを取得（シンプルなクエリに変更）
    let query = supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (filters?.prefecture) {
      query = query.eq('prefecture', filters.prefecture)
    }
    
    if (filters?.region) {
      // 地域フィルタリング
      const { REGION_PREFECTURES } = await import('@/lib/constants/regions')
      const regionPrefectures = REGION_PREFECTURES[filters.region as keyof typeof REGION_PREFECTURES] || []
      if (regionPrefectures.length > 0) {
        query = query.in('prefecture', regionPrefectures)
      }
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    
    if (filters?.beginner_friendly) {
      query = query.eq('beginner_friendly', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events from Supabase:', error.message || error)
      console.error('Error details:', { code: error.code, details: error.details, hint: error.hint })
      throw error
    }

    // シンプルにイベントデータのみ返す（参加者数は0で固定）
    return data.map(event => ({
      ...event,
      participants_count: 0,
      is_participating: false
    }))
    
  } catch (error) {
    console.log('Falling back to local storage and mock data')
    
    // エラー時はローカルストレージとモックデータを使用
    const savedEvents = localStorage.getItem('created_events')
    const createdEvents = savedEvents ? JSON.parse(savedEvents) : []
    console.log('Created events from localStorage:', createdEvents)
    
    const { mockEvents } = await import('@/lib/mock-data')
    
    // 削除されたイベントIDを取得
    const deletedEvents = localStorage.getItem('deleted_events')
    const deletedList = deletedEvents ? JSON.parse(deletedEvents) : []
    
    // モックイベントから削除されたものを除外
    const filteredMockEvents = mockEvents.filter(e => !deletedList.includes(e.id))
    
    let allEvents = [...createdEvents, ...filteredMockEvents]
    console.log('All events (created + mock):', allEvents.length)
    
    // フィルタリング
    if (filters?.type) {
      allEvents = allEvents.filter(e => e.type === filters.type)
    }
    if (filters?.prefecture) {
      allEvents = allEvents.filter(e => e.prefecture === filters.prefecture)
    }
    if (filters?.region) {
      // 地域フィルタリング
      const { REGION_PREFECTURES } = await import('@/lib/constants/regions')
      const regionPrefectures = REGION_PREFECTURES[filters.region as keyof typeof REGION_PREFECTURES] || []
      allEvents = allEvents.filter(e => regionPrefectures.includes(e.prefecture))
      console.log(`Filtering by region "${filters.region}", prefectures:`, regionPrefectures)
    }
    if (filters?.beginner_friendly) {
      allEvents = allEvents.filter(e => e.beginnerFriendly || e.beginner_friendly)
    }
    
    // 過去のイベントを除外し、日付順にソート
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 今日の開始時刻に設定
    
    console.log('Filtering events, current date:', now)
    
    const filteredEvents = allEvents.filter(e => {
      // 日付パースの処理
      let eventDate: Date
      
      // 日本語形式の日付 "YYYY年MM月DD日"
      const japaneseMatch = e.event_date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
      if (japaneseMatch) {
        eventDate = new Date(
          parseInt(japaneseMatch[1]),
          parseInt(japaneseMatch[2]) - 1,
          parseInt(japaneseMatch[3])
        )
      } else if (e.event_date.match(/^\d{4}-\d{2}-\d{2}/)) {
        // ISO形式の日付 "YYYY-MM-DD"
        eventDate = new Date(e.event_date)
      } else {
        console.warn('Invalid date format:', e.event_date)
        return false
      }
      
      eventDate.setHours(0, 0, 0, 0)
      const include = eventDate >= now
      console.log(`Event "${e.name}" date: ${e.event_date} (${eventDate.toISOString()}) - include: ${include}`)
      return include
    })
    
    console.log('Filtered events count:', filteredEvents.length)
    
    return filteredEvents
      .sort((a, b) => {
        // NEWイベントを最初に表示
        const aIsNew = isNewEvent(a.createdAt || a.created_at)
        const bIsNew = isNewEvent(b.createdAt || b.created_at)
        if (aIsNew && !bIsNew) return -1
        if (!aIsNew && bIsNew) return 1
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      })
      .map(e => ({
        ...e,
        participants_count: e.participants || e.participants_count || 0,
        is_participating: false,
        image_url: e.image || e.image_url,
        beginner_friendly: e.beginnerFriendly || e.beginner_friendly,
        created_at: e.createdAt || e.created_at
      }))
  }
}

// 新規イベントかどうかをチェック（3日以内）
function isNewEvent(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  
  const today = new Date()
  const eventCreatedDate = new Date(createdAt)
  const diffTime = today.getTime() - eventCreatedDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  return diffDays <= 3
}

// 特定のイベントを取得
export async function getEventById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_participants (
        user_id
      ),
      organizer:profiles!organizer_id (
        id,
        full_name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return null
  }

  const { data: user } = await supabase.auth.getUser()
  const userId = user.user?.id

  return {
    ...data,
    participants_count: data.event_participants?.length || 0,
    is_participating: userId ? data.event_participants?.some(p => p.user_id === userId) : false
  }
}

// イベントに参加
export async function joinEvent(eventId: string) {
  const supabase = createClient()
  
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    throw new Error('ユーザーが認証されていません')
  }

  const { error } = await supabase
    .from('event_participants')
    .insert([{
      event_id: eventId,
      user_id: user.user.id
    }])

  if (error) {
    console.error('Error joining event:', error)
    throw error
  }
}

// イベントから退出
export async function leaveEvent(eventId: string) {
  const supabase = createClient()
  
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    throw new Error('ユーザーが認証されていません')
  }

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.user.id)

  if (error) {
    console.error('Error leaving event:', error)
    throw error
  }
}

// イベントを削除
export async function deleteEvent(eventId: string) {
  const supabase = createClient()
  
  // デモユーザーの場合はlocalStorageで処理（既に実装済み）
  const demoUser = localStorage.getItem('demo_user')
  if (demoUser) {
    console.log('Demo user: Event deletion handled in localStorage')
    return { success: true }
  }
  
  // 認証チェック
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    throw new Error('ユーザーが認証されていません')
  }

  try {
    // まず参加者を削除
    const { error: participantsError } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
    
    if (participantsError) {
      console.error('Error deleting participants:', participantsError)
    }

    // イベントを削除
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
    
    if (error) {
      console.error('Error deleting event from Supabase:', error)
      throw error
    }

    console.log('Event deleted from Supabase successfully')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting event:', error)
    throw error
  }
}

// 主催者のイベントを取得
export async function getOrganizerEvents() {
  const supabase = createClient()
  
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return []
  }

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_participants (
        user_id
      )
    `)
    .eq('organizer_id', user.user.id)
    .order('event_date', { ascending: false })

  if (error) {
    console.error('Error fetching organizer events:', error)
    return []
  }

  return data.map(event => ({
    ...event,
    participants_count: event.event_participants?.length || 0
  }))
}