"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { getEvents, deleteEvent } from "@/lib/supabase/events"
import { LoadingSpinner } from "@/components/ui/spinner"

// 管理者用：過去のイベントも含めて全て取得
async function getAllEventsForAdmin() {
  const savedEvents = localStorage.getItem('created_events')
  const createdEvents = savedEvents ? JSON.parse(savedEvents) : []
  
  const { mockEvents } = await import('@/lib/mock-data')
  
  // 削除されたイベントIDを取得
  const deletedEvents = localStorage.getItem('deleted_events')
  const deletedList = deletedEvents ? JSON.parse(deletedEvents) : []
  
  // 全イベントを結合し、削除されたものを除外（文字列で比較）
  const deletedListStr = deletedList.map((id: any) => String(id))
  const allEvents = [...createdEvents, ...mockEvents].filter(e => !deletedListStr.includes(String(e.id)))
  
  // 重複を除去
  const eventMap = new Map()
  allEvents.forEach(event => {
    eventMap.set(event.id, event)
  })
  
  return Array.from(eventMap.values())
}

interface Event {
  id: string
  name: string
  type: 'tournament' | 'practice'
  event_date: string
  start_time?: string
  venue: string
  prefecture: string
  image_url?: string
  status?: string
  organizer_name?: string
  created_at?: string
}

export default function EventManagementPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<'all' | 'tournament' | 'practice'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, eventId: string | null, eventName: string}>({
    show: false,
    eventId: null,
    eventName: ''
  })

  // Super Admin権限チェック
  useEffect(() => {
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push('/')
      return
    }
    
    const userData = JSON.parse(demoUser)
    if (userData.role !== 'super_admin') {
      router.push('/')
      return
    }
  }, [router])

  // イベント一覧を取得する関数
  const loadEvents = async () => {
    setIsLoading(true)
    try {
      console.log('=== loadEvents started ===')
      
      // すべてのイベントを取得（管理画面なので過去のイベントも含める）
      const allEvents = await getAllEventsForAdmin()
      console.log('Events from getEvents:', allEvents.length, allEvents)
      
      // 日付順にソート（新しいものから）
      const sortedEvents = allEvents.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || '0')
        const dateB = new Date(b.created_at || b.createdAt || '0')
        return dateB.getTime() - dateA.getTime()
      })
      
      console.log('Final sorted events:', sortedEvents.length)
      setEvents(sortedEvents)
      setFilteredEvents(sortedEvents)
      
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // イベント一覧を取得
  useEffect(() => {
    loadEvents()
  }, [])

  // フィルタリング処理
  useEffect(() => {
    let filtered = [...events]

    // タイプでフィルタリング
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType)
    }

    // 検索クエリでフィルタリング
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.prefecture.includes(searchQuery)
      )
    }

    setFilteredEvents(filtered)
  }, [events, selectedType, searchQuery])

  const handleDelete = (eventId: string) => {
    console.log('handleDelete called with eventId:', eventId)
    
    // 削除対象のイベントを探す
    const eventToDelete = events.find(e => String(e.id) === String(eventId))
    
    if (!eventToDelete) {
      alert('イベントが見つかりません')
      return
    }
    
    // カスタム確認モーダルを表示
    setDeleteConfirm({
      show: true,
      eventId: eventId,
      eventName: eventToDelete.name
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.eventId) return
    
    console.log('削除処理を開始します...')
    
    try {
      // Supabaseから削除を試みる
      try {
        await deleteEvent(deleteConfirm.eventId)
        console.log('Supabaseから削除しました')
      } catch (supabaseError) {
        console.log('Supabase削除エラー（デモモードまたは接続エラー）:', supabaseError)
      }
      
      // localStorageから削除
      const savedEvents = localStorage.getItem('created_events')
      if (savedEvents) {
        const events = JSON.parse(savedEvents)
        const updatedEvents = events.filter((e: any) => String(e.id) !== String(deleteConfirm.eventId))
        localStorage.setItem('created_events', JSON.stringify(updatedEvents))
        console.log('created_eventsから削除しました')
      }
      
      // 削除されたイベントのリストを管理
      const deletedEvents = localStorage.getItem('deleted_events')
      const deletedList = deletedEvents ? JSON.parse(deletedEvents) : []
      
      // 文字列に変換してから比較
      const eventIdStr = String(deleteConfirm.eventId)
      const deletedListStr = deletedList.map((id: any) => String(id))
      
      if (!deletedListStr.includes(eventIdStr)) {
        deletedList.push(deleteConfirm.eventId)
        localStorage.setItem('deleted_events', JSON.stringify(deletedList))
        console.log('deleted_eventsに追加しました')
      }

      // モーダルを閉じる
      setDeleteConfirm({ show: false, eventId: null, eventName: '' })
      
      // 削除成功メッセージ
      alert(`「${deleteConfirm.eventName}」を削除しました`)
      
      // ページをリロードして変更を反映
      window.location.reload()
      
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('削除中にエラーが発生しました')
    }
  }

  const formatDate = (dateStr: string) => {
    // 日本語形式とISO形式の両方に対応
    const japaneseMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    if (japaneseMatch) {
      return dateStr
    }
    
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const date = new Date(dateStr)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    
    return dateStr
  }

  if (isLoading) {
    return (
      <>
        <div className="bg-background min-h-screen pb-20">
          <div className="flex items-center bg-background p-4 pb-2 justify-between">
            <Link href="/others" className="text-foreground flex size-12 shrink-0 items-center">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
              イベント管理
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
        <BottomNavigation />
      </>
    )
  }

  return (
    <>
      <div className="bg-background min-h-screen pb-20">
        {/* 削除確認モーダル */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">削除の確認</h3>
              <p className="mb-6">
                「{deleteConfirm.eventName}」を本当に削除しますか？
                <br />
                <span className="text-sm text-red-600 mt-2 block">
                  この操作は取り消せません。
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, eventId: null, eventName: '' })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/others" className="text-foreground flex size-12 shrink-0 items-center">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            イベント管理
          </h2>
        </div>

        {/* Stats */}
        <div className="px-4 py-4 grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedType('all')}
            className={cn(
              "rounded-lg p-3 text-center transition-colors",
              selectedType === 'all' ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted/70"
            )}
          >
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-xs">全イベント</p>
          </button>
          <button
            onClick={() => setSelectedType('tournament')}
            className={cn(
              "rounded-lg p-3 text-center transition-colors",
              selectedType === 'tournament' ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted/70"
            )}
          >
            <p className="text-2xl font-bold">
              {events.filter(e => e.type === 'tournament').length}
            </p>
            <p className="text-xs">大会</p>
          </button>
          <button
            onClick={() => setSelectedType('practice')}
            className={cn(
              "rounded-lg p-3 text-center transition-colors",
              selectedType === 'practice' ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted/70"
            )}
          >
            <p className="text-2xl font-bold">
              {events.filter(e => e.type === 'practice').length}
            </p>
            <p className="text-xs">練習会</p>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-4 pb-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="イベント名、会場、都道府県で検索"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

        </div>

        {/* Event List */}
        <div className="px-4 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">イベントが見つかりません</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-lg p-4 space-y-3 relative">
                <div className="flex items-start gap-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={(event.image_url && event.image_url !== "") ? event.image_url : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop"}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.event_date)} · {event.start_time}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.venue} · {event.prefecture}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        event.type === 'tournament' 
                          ? "bg-primary/10 text-primary" 
                          : "bg-green-100 text-green-700"
                      )}>
                        {event.type === 'tournament' ? '大会' : '練習会'}
                      </span>
                      {event.organizer_name && (
                        <span className="text-xs text-muted-foreground">
                          主催: {event.organizer_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 relative z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    編集
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Delete button clicked!', event.id)
                      handleDelete(event.id)
                    }}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    style={{ zIndex: 50, pointerEvents: 'auto' }}
                  >
                    <Trash2 className="h-4 w-4 pointer-events-none" />
                    <span className="pointer-events-none">削除</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNavigation />
    </>
  )
}