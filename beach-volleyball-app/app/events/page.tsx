"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronDown, MapPin, Heart, MessageCircle, Calendar, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { REGIONS, REGION_PREFECTURES, getRegionFromPrefecture } from "@/lib/constants/regions"
import { toggleFavoriteEvent, isFavoriteEvent } from "@/lib/utils/favorites"
import { getEventCommentCount } from "@/lib/utils/comments"
import { getEvents } from "@/lib/supabase/events"
import { useAuth } from "@/components/providers/auth-provider"
import { LoadingSpinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type EventType = "tournament" | "practice"

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

interface Event {
  id: string
  name: string
  type: EventType
  event_date: string
  start_time?: string
  end_time?: string
  venue: string
  prefecture: string
  region?: string
  image_url?: string
  date_obj?: Date
  status?: 'recruiting' | 'closed' | 'finished'
  participants_count?: number
  max_participants?: number
  beginner_friendly?: boolean
  created_at?: string
  is_participating?: boolean
}

// モックデータ
const mockEvents: Event[] = [
  {
    id: "1",
    name: "春季ビーチボールバレー大会",
    type: "tournament",
    event_date: "2025年8月20日",
    venue: "大宮市民体育館",
    prefecture: "埼玉県",
    image_url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop",
    status: "registered",
    participant_count: 24,
    max_participants: 32
  },
  {
    id: "2",
    name: "水曜練習会",
    type: "practice",
    event_date: "2025年7月30日",
    venue: "川越第二体育館",
    prefecture: "埼玉県",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    status: "available",
    participant_count: 12,
    max_participants: 20,
    beginnerFriendly: true
  },
  {
    id: "3",
    name: "夏季チャンピオンシップ",
    type: "tournament",
    event_date: "2025年9月15日",
    venue: "東京体育館",
    prefecture: "東京都",
    image_url: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=300&fit=crop",
    status: "available",
    participant_count: 8,
    max_participants: 32
  },
  {
    id: "4",
    name: "初心者向け練習会",
    type: "practice",
    event_date: "2025年8月5日",
    venue: "浦和スポーツセンター",
    prefecture: "埼玉県",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    status: "full",
    participant_count: 20,
    max_participants: 20,
    beginnerFriendly: true
  },
  {
    id: "5",
    name: "関東地区選手権",
    type: "tournament",
    event_date: "2025年10月10日",
    venue: "横浜武道館",
    prefecture: "神奈川県",
    image_url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=300&fit=crop",
    status: "available",
    participant_count: 16,
    max_participants: 48
  },
  {
    id: "6",
    name: "朝練習会",
    type: "practice",
    event_date: "2025年8月3日",
    venue: "世田谷スポーツセンター",
    prefecture: "東京都",
    image_url: "https://images.unsplash.com/photo-1519684093736-8a5d1a69fb7f?w=400&h=300&fit=crop",
    status: "registered",
    participant_count: 15,
    max_participants: 30,
    beginnerFriendly: false
  },
  {
    id: "7",
    name: "全国大会",
    type: "tournament",
    event_date: "2025年11月20日",
    venue: "国立スポーツ科学センター",
    prefecture: "全国",
    image_url: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=300&fit=crop",
    status: "available",
    participant_count: 48,
    max_participants: 64
  },
  {
    id: "8",
    name: "過去の大会（テスト用）",
    type: "tournament",
    event_date: "2025年3月15日",
    venue: "テスト会場",
    prefecture: "東京都",
    image_url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop",
    status: "available",
    participant_count: 20,
    max_participants: 32
  }
]

// Check if event was created within 3 days
function isNewEvent(createdAt: string | undefined): boolean {
  if (!createdAt) return false
  
  const today = new Date()
  const eventCreatedDate = new Date(createdAt)
  const diffTime = today.getTime() - eventCreatedDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  return diffDays <= 3
}

// Comment count component that handles SSR
function CommentCount({ eventId }: { eventId: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setCount(getEventCommentCount(eventId))
  }, [eventId])
  
  return <span className="text-xs">{count}</span>
}

export default function EventsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { userPrefecture, isOrganizer, isAdmin } = useAuth()
  const [selectedType, setSelectedType] = useState<EventType>("practice")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>()
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set())
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false)
  const [monthPopoverOpen, setMonthPopoverOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>()

  // Memoize today's date for calendar
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  // Set default region based on user's prefecture and current month
  useEffect(() => {
    if (userPrefecture && !selectedRegion) {
      const region = getRegionFromPrefecture(userPrefecture)
      if (region) {
        setSelectedRegion(region)
      }
    }
    
    // Set default month to current month
    if (!selectedMonth) {
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      setSelectedMonth(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`)
    }
  }, [userPrefecture, selectedRegion, selectedMonth])

  useEffect(() => {
    // イベントとお気に入りを読み込み
    const loadEvents = async () => {
      setIsLoading(true)
      try {
        console.log('Loading events with filters:', {
          region: selectedRegion,
          type: selectedType,
          beginner_friendly: undefined
        })
        
        const events = await getEvents({
          region: selectedRegion,
          type: selectedType,
          beginner_friendly: undefined
        })
        
        console.log('Loaded events:', events)
        setAllEvents(events)
        
        // お気に入りをチェック
        const favorites = new Set<string>()
        events.forEach(event => {
          if (isFavoriteEvent(event.id)) {
            favorites.add(event.id)
          }
        })
        setFavoriteEvents(favorites)
      } catch (error) {
        console.error('Error loading events:', error)
        // エラー時は空配列を設定
        setAllEvents([])
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [selectedType, selectedRegion])

  const handleFavoriteToggle = (e: React.MouseEvent, event: Event) => {
    e.preventDefault()
    e.stopPropagation()
    
    const isFavorited = toggleFavoriteEvent({
      id: event.id,
      name: event.name,
      type: event.type,
      event_date: event.event_date,
      venue: event.venue,
      prefecture: event.prefecture,
      image: event.image_url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
    })
    
    setFavoriteEvents(prev => {
      const newSet = new Set(prev)
      if (isFavorited) {
        newSet.add(event.id)
      } else {
        newSet.delete(event.id)
      }
      return newSet
    })
  }

  // Events are already filtered by getEvents, just apply additional client-side filtering for date
  const filteredEvents = allEvents
    .filter(event => {
      // Parse date format - both "YYYY年MM月DD日" and "YYYY-MM-DD"
      let eventDate: Date
      
      const japaneseMatch = event.event_date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
      if (japaneseMatch) {
        eventDate = new Date(
          parseInt(japaneseMatch[1]),
          parseInt(japaneseMatch[2]) - 1,
          parseInt(japaneseMatch[3])
        )
      } else if (event.event_date.match(/^\d{4}-\d{2}-\d{2}/)) {
        eventDate = new Date(event.event_date)
      } else {
        return false
      }
      
      // Exclude past events
      if (eventDate < today) return false
      
      // Filter by selected month if any
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-')
        const eventYear = eventDate.getFullYear()
        const eventMonth = eventDate.getMonth() + 1
        if (eventYear !== parseInt(year) || eventMonth !== parseInt(month)) return false
      }
      
      // Filter by selected date if any
      if (selectedDate) {
        const selectedDateOnly = new Date(selectedDate)
        selectedDateOnly.setHours(0, 0, 0, 0)
        eventDate.setHours(0, 0, 0, 0)
        if (eventDate.getTime() !== selectedDateOnly.getTime()) return false
      }
      
      return true
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <div className="w-12" />
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          イベント
        </h2>
        <div className="w-12" />
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => setSelectedType("practice")}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              selectedType === "practice"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            練習会
          </button>
          <button
            onClick={() => setSelectedType("tournament")}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              selectedType === "tournament"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            大会
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 p-3 overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        <Popover open={monthPopoverOpen} onOpenChange={setMonthPopoverOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-4 pr-2",
              selectedMonth ? "bg-primary text-primary-foreground" : "bg-secondary"
            )}>
              <Calendar className="h-4 w-4" />
              <p className="text-sm font-medium leading-normal">
                {selectedMonth ? (() => {
                  const [year, month] = selectedMonth.split('-')
                  return `${year}年${parseInt(month)}月`
                })() : "月選択"}
              </p>
              <ChevronDown className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {(() => {
                const months = []
                const currentDate = new Date()
                // 過去3ヶ月から未来6ヶ月まで表示
                for (let i = -3; i <= 6; i++) {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
                  const year = date.getFullYear()
                  const month = date.getMonth() + 1
                  const monthStr = `${year}-${month.toString().padStart(2, '0')}`
                  const label = `${year}年${month}月`
                  months.push({ value: monthStr, label })
                }
                return months.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedMonth(value)
                      setMonthPopoverOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors",
                      selectedMonth === value && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {label}
                  </button>
                ))
              })()}
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-4 pr-2",
              selectedRegion ? "bg-primary text-primary-foreground" : "bg-secondary"
            )}>
              <MapPin className="h-4 w-4" />
              <p className="text-sm font-medium leading-normal">
                {selectedRegion || "地域"}
              </p>
              <ChevronDown className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedRegion(undefined)
                  setRegionPopoverOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-muted-foreground"
              >
                すべての地域
              </button>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    setSelectedRegion(region)
                    setRegionPopoverOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors",
                    selectedRegion === region && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Event List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedType === "tournament" ? "開催予定の大会はありません" : "開催予定の練習会はありません"}
          </p>
        </div>
      ) : (
      <div className="space-y-0">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="block">
            <div className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-foreground text-base font-bold leading-tight">
                    {event.name}
                  </p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    {(() => {
                      const date = new Date(event.event_date);
                      const month = date.getMonth() + 1;
                      const day = date.getDate();
                      const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
                      const weekDay = weekDays[date.getDay()];
                      return `${month}月${day}日(${weekDay})`;
                    })()}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3">
                      <p className="text-muted-foreground text-xs font-normal leading-normal">
                        📍 {event.prefecture}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <CommentCount eventId={event.id} />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {isNewEvent(event.created_at || event.createdAt) && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                          NEW
                        </span>
                      )}
                      {event.beginnerFriendly && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          初心者可
                        </span>
                      )}
                      {event.type === "practice" && event.status && event.status !== "registered" && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          event.status === "available" && "bg-green-100 text-green-700",
                          event.status === "full" && "bg-red-100 text-red-700"
                        )}>
                          {event.status === "available" && "参加可"}
                          {event.status === "full" && "満员"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden flex-1">
                  <Image
                    src={getEventImage(event)}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={(e) => handleFavoriteToggle(e, event)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <Heart 
                      className={cn(
                        "h-5 w-5 transition-colors",
                        favoriteEvents.has(event.id) 
                          ? "fill-red-500 text-red-500" 
                          : "text-white"
                      )} 
                    />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
    <BottomNavigation />
    </>
  )
}