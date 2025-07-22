"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Users, MessageCircle, Settings, ChevronRight, Plus, Clock, CheckCircle, XCircle, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { cn } from "@/lib/utils"
import { getOrganizerPracticeRequests } from "@/lib/utils/practice-requests"
import Image from "next/image"

interface OrganizerEvent {
  id: string
  name: string
  date: string
  venue: string
  participants: number
  maxParticipants: number
  status: 'upcoming' | 'past'
  recurring?: boolean
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'requests'>('overview')
  const [myEvents, setMyEvents] = useState<OrganizerEvent[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isOrganizer, setIsOrganizer] = useState(false)

  useEffect(() => {
    // 主催者権限をチェック
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      // canCreateEventsがtrueの場合も主催者として扱う
      if (!userData.isOrganizer && !userData.isAdmin && !userData.canCreateEvents) {
        router.push("/")
        return
      }
      setIsOrganizer(true)
      
      // 主催者のイベントを取得
      loadOrganizerEvents(userData.id || user?.id || '')
      
      // 承認待ちの申請を取得
      const requests = getOrganizerPracticeRequests(userData.id || user?.id || '')
      setPendingRequests(requests.filter(r => r.status === 'pending'))
    } else {
      router.push("/")
    }
  }, [user, router])

  const loadOrganizerEvents = (organizerId: string) => {
    // localStorageからイベントを取得
    const savedEvents = localStorage.getItem('created_events')
    if (savedEvents) {
      const events = JSON.parse(savedEvents)
      // 主催者のイベントのみフィルター
      const organizerEvents = events
        .filter((e: any) => e.creator_id === organizerId && e.type === 'practice')
        .map((e: any) => ({
          id: e.id,
          name: e.name,
          date: e.event_date + ' ' + e.start_time,
          venue: e.venue,
          participants: e.participants || 0,
          maxParticipants: e.max_participants || 20,
          status: 'upcoming' as const,
          recurring: e.recurring || false
        }))
      setMyEvents(organizerEvents)
    } else {
      // モックデータをフォールバック
      const mockOrganizerEvents: OrganizerEvent[] = [
        {
          id: "1",
          name: "水曜夜練習会",
          date: "毎週水曜日 19:00",
          venue: "川越第二体育館",
          participants: 12,
          maxParticipants: 20,
          status: 'upcoming',
          recurring: true
        },
        {
          id: "2",
          name: "週末練習会",
          date: "2025年8月10日 13:00",
          venue: "熊谷スポーツセンター",
          participants: 8,
          maxParticipants: 20,
          status: 'upcoming'
        }
      ]
      setMyEvents(mockOrganizerEvents)
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm('この練習会を削除してもよろしいですか？この操作は取り消せません。')) {
      return
    }

    // localStorageから削除
    const savedEvents = localStorage.getItem('created_events')
    if (savedEvents) {
      const events = JSON.parse(savedEvents)
      const updatedEvents = events.filter((e: any) => e.id !== eventId)
      localStorage.setItem('created_events', JSON.stringify(updatedEvents))
    }

    // 表示を更新
    setMyEvents(prev => prev.filter(e => e.id !== eventId))
    alert('練習会を削除しました')
  }

  if (!isOrganizer) {
    return null
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          主催者管理
        </h2>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'overview'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            概要
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'events'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            練習会
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative",
              activeTab === 'requests'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            参加申請
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-4 py-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium">開催中の練習会</p>
              </div>
              <p className="text-2xl font-bold">{myEvents.filter(e => e.status === 'upcoming').length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium">承認待ち申請</p>
              </div>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-base font-semibold mb-3">クイックアクション</h3>
          <div className="space-y-2">
            <Link href="/events/create" className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">新しい練習会を作成</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/profile/requests" className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">参加申請を確認</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">主催する練習会</h3>
            <Link href="/events/create">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新規作成
              </Button>
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>主催している練習会はありません</p>
              <Link href="/events/create">
                <Button size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  練習会を作成
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myEvents.map((event) => (
                <div key={event.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{event.name}</p>
                      {event.recurring && (
                        <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          定期
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.date} · {event.venue}
                    </p>
                  </div>
                  <Link href={`/events/${event.id}/manage`} className="text-xs text-primary hover:underline">
                    管理
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs">
                    参加者: {event.participants}/{event.maxParticipants}
                  </p>
                  <div className="flex gap-2">
                    <Link 
                      href={`/events/${event.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      詳細
                    </Link>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">定期練習会について</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 毎週同じ曜日・時間に開催できます</li>
              <li>• 参加者は一度承認されれば継続参加可能</li>
              <li>• 個別の日程で中止することも可能</li>
            </ul>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">承認待ち申請</h3>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>承認待ちの申請はありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{request.userName}</p>
                      <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-600 text-white rounded-full">
                      承認待ち
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {request.eventName}
                  </p>
                  {request.message && (
                    <p className="text-xs bg-white p-2 rounded mb-2">{request.message}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      承認
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 h-8">
                      <XCircle className="h-3 w-3 mr-1" />
                      却下
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    <BottomNavigation />
    </>
  )
}