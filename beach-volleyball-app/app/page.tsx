"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { Header } from "@/components/layout/header"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { getUpcomingEvents } from "@/lib/utils/event-participation"
import { getEvents } from "@/lib/supabase/events"
import { REGION_PREFECTURES, getRegionFromPrefecture } from "@/lib/constants/regions"
import { useAuth } from "@/components/providers/auth-provider"
import { LoadingSpinner } from "@/components/ui/spinner"

// Check if event was created within 3 days
function isNewEvent(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  
  const today = new Date()
  const eventCreatedDate = new Date(createdAt)
  const diffTime = today.getTime() - eventCreatedDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  return diffDays <= 3
}

// ダミー画像のリスト（ビーチバレー関連）
const dummyImages = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop", // ビーチバレー
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop", // ビーチバレー2
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=300&fit=crop", // ビーチバレー3
  "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=300&fit=crop", // ビーチシーン
  "https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=400&h=300&fit=crop", // スポーツ
]

// イベントIDに基づいてダミー画像を取得
function getEventImage(event: any): string {
  if (event.image_url && event.image_url !== "") {
    return event.image_url
  }
  // イベントIDのハッシュ値を使って画像をランダムに選択
  const index = event.id ? event.id.charCodeAt(0) % dummyImages.length : 0
  return dummyImages[index]
}

export default function HomePage() {
  const { userPrefecture } = useAuth()
  const [userRegion, setUserRegion] = useState<string | null>(null)
  const [nearbyTournaments, setNearbyTournaments] = useState<any[]>([])
  const [nearbyPractices, setNearbyPractices] = useState<any[]>([])
  const [latestEvents, setLatestEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [latestNews, setLatestNews] = useState<any[]>([])

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      
      // ユーザーの地域を取得
      let region = "関東"
      if (userPrefecture) {
        const userReg = getRegionFromPrefecture(userPrefecture)
        if (userReg) {
          region = userReg
        }
      }
      setUserRegion(region)

      try {
        // すべてのイベントを取得
        const allEvents = await getEvents()
        
        // 今日の日付
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // 新着イベントを取得（大会と練習会の両方、最新順）
        const sortedByNew = [...allEvents]
          .sort((a, b) => {
            // NEW（今日作成）のイベントを優先
            const aCreatedAt = a.created_at || a.createdAt
            const bCreatedAt = b.created_at || b.createdAt
            const aIsNew = isNewEvent(aCreatedAt)
            const bIsNew = isNewEvent(bCreatedAt)
            
            if (aIsNew && !bIsNew) return -1
            if (!aIsNew && bIsNew) return 1
            
            // 作成日時が新しい順
            const aCreated = new Date(aCreatedAt || '2000-01-01')
            const bCreated = new Date(bCreatedAt || '2000-01-01')
            return bCreated.getTime() - aCreated.getTime()
          })
          .slice(0, 3)
        
        setLatestEvents(sortedByNew)

        // 地域でフィルタリング
        const regionEvents = await getEvents({ region })
        
        // 大会と練習会を分ける（日付順）
        const sortedByDate = [...regionEvents].sort((a, b) => {
          const dateA = parseEventDate(a.event_date)
          const dateB = parseEventDate(b.event_date)
          return dateA.getTime() - dateB.getTime()
        })
        
        const tournaments = sortedByDate.filter(e => e.type === 'tournament').slice(0, 3)
        const practices = sortedByDate.filter(e => e.type === 'practice').slice(0, 3)
        
        setNearbyTournaments(tournaments)
        setNearbyPractices(practices)
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()

    // お知らせを読み込む
    const savedAnnouncements = localStorage.getItem('announcements')
    if (savedAnnouncements) {
      const announcementList = JSON.parse(savedAnnouncements)
      // アクティブなお知らせのみ表示（作成日順）
      const activeAnnouncements = announcementList
        .filter((a: any) => a.isActive)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setAnnouncements(activeAnnouncements)
    }

    // ニュース記事を読み込む
    const savedNews = localStorage.getItem('news_articles')
    if (savedNews) {
      const newsList = JSON.parse(savedNews)
      // 公開中のニュースのみ表示（最新3件）
      const publishedNews = newsList
        .filter((n: any) => n.isPublished)
        .sort((a: any, b: any) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
        .slice(0, 3)
      setLatestNews(publishedNews)
    }
  }, [userPrefecture])

  // 日付パース関数
  function parseEventDate(dateStr: string): Date {
    // 日本語形式 "YYYY年MM月DD日"
    const japaneseMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    if (japaneseMatch) {
      return new Date(
        parseInt(japaneseMatch[1]),
        parseInt(japaneseMatch[2]) - 1,
        parseInt(japaneseMatch[3])
      )
    }
    // ISO形式 "YYYY-MM-DD"
    return new Date(dateStr)
  }

  // 日付フォーマット関数（年は今年なら省略）
  function formatEventDate(dateStr: string): string {
    const date = parseEventDate(dateStr)
    const now = new Date()
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 今年の場合は年を省略
    if (date.getFullYear() === now.getFullYear()) {
      return `${month}月${day}日`
    }
    
    // 来年以降は年も表示
    return `${date.getFullYear()}年${month}月${day}日`
  }



  const communityHighlights = [
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=300&h=300&fit=crop"
  ]

  return (
    <>
      <Header />
      <div className="bg-background pt-16 pb-20">

      {/* Recent News Section - 1番上 */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
          最新のお知らせ
        </h2>
        <Link href="/news" className="text-primary text-sm font-medium">
          すべて見る
        </Link>
      </div>
      <div className="px-4 space-y-3">
        {latestNews.length === 0 ? (
          <div className="p-8 bg-muted/30 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">現在お知らせはありません</p>
          </div>
        ) : (
          latestNews.map((news) => (
            <Link key={news.id} href={`/news/${news.id}`} className="block">
              <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-foreground text-base font-medium leading-tight flex-1">{news.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    news.category === '施設情報' ? 'bg-blue-100 text-blue-700' :
                    news.category === '大会情報' ? 'bg-purple-100 text-purple-700' :
                    news.category === 'ルール' ? 'bg-green-100 text-green-700' :
                    news.category === '練習会' ? 'bg-orange-100 text-orange-700' :
                    'bg-pink-100 text-pink-700'
                  }`}>
                    {news.category}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm font-normal leading-normal line-clamp-2">
                  {news.summary}
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  {new Date(news.publishedAt || news.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Latest Events Section - 2番目 */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
          新着イベント
        </h2>
        <Link href="/events" className="text-primary text-sm font-medium">
          すべて見る
        </Link>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : latestEvents.length === 0 ? (
        <p className="text-muted-foreground text-sm px-4 py-8 text-center">
          新着イベントがありません
        </p>
      ) : (
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch px-4 py-3 gap-4">
            {latestEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="flex h-full flex-1 flex-col bg-card border border-border rounded-xl overflow-hidden min-w-[280px] hover:shadow-lg transition-all hover:scale-[1.02]">
                <div className="relative w-full aspect-video">
                  <Image
                    src={getEventImage(event)}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {isNewEvent(event.createdAt) && (
                      <div className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                        NEW
                      </div>
                    )}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      event.type === 'tournament' ? 'bg-primary' : 'bg-green-600'
                    }`}>
                      {event.type === 'tournament' ? '大会' : '練習会'}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-foreground text-lg font-bold mb-3 line-clamp-2">{event.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.prefecture}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{event.venue?.name || event.venue_other || '会場未定'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{formatEventDate(event.event_date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Tournaments Section - 3番目 */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {userRegion || "近辺"}の大会
        </h2>
        <Link href="/events?type=tournament" className="text-primary text-sm font-medium">
          すべて見る
        </Link>
      </div>
      {nearbyTournaments.length === 0 ? (
        <p className="text-muted-foreground text-sm px-4 py-8 text-center">
          {userRegion || "近辺"}で開催予定の大会はありません
        </p>
      ) : (
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch px-4 py-3 gap-4">
            {nearbyTournaments.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="flex h-full flex-1 flex-col bg-card border border-border rounded-xl overflow-hidden min-w-[280px] hover:shadow-lg transition-all hover:scale-[1.02]">
                <div className="relative w-full aspect-video">
                  <Image
                    src={getEventImage(event)}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                  {isNewEvent(event.created_at) && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                      NEW
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-foreground text-lg font-bold mb-3 line-clamp-2">{event.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.prefecture}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{event.venue?.name || event.venue_other || '会場未定'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{formatEventDate(event.event_date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Practice Sessions Section - 3番目 */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em]">
          {userRegion || "近辺"}の練習会
        </h2>
        <Link href="/events?type=practice" className="text-primary text-sm font-medium">
          すべて見る
        </Link>
      </div>
      {nearbyPractices.length === 0 ? (
        <p className="text-muted-foreground text-sm px-4 py-8 text-center">
          {userRegion || "近辺"}で開催予定の練習会はありません
        </p>
      ) : (
        <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch px-4 py-3 gap-4">
            {nearbyPractices.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="flex h-full flex-1 flex-col bg-card border border-border rounded-xl overflow-hidden min-w-[280px] hover:shadow-lg transition-all hover:scale-[1.02]">
                <div className="relative w-full aspect-video">
                  <Image
                    src={getEventImage(event)}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                  {isNewEvent(event.created_at) && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                      NEW
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-foreground text-lg font-bold mb-3 line-clamp-2">{event.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.prefecture}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{event.venue?.name || event.venue_other || '会場未定'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{formatEventDate(event.event_date)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}


      {/* Tournament Results Section */}
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        大会結果
      </h2>
      <div className="p-4 mb-4">
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">準備中</p>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}