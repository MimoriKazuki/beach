"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, MapPin, Heart, Trash2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { cn } from "@/lib/utils"
import { 
  addParticipatingEvent, 
  removeParticipatingEvent, 
  isParticipatingInEvent 
} from "@/lib/utils/event-participation"
import { toggleFavoriteEvent, isFavoriteEvent } from "@/lib/utils/favorites"
import { CommentSection } from "@/components/event/comment-section"
import { mockEvents } from "@/lib/mock-data"
import {
  createPracticeRequest,
  getUserRequestStatus
} from "@/lib/utils/practice-requests"
import { useAuth } from "@/components/providers/auth-provider"
import { getEventById } from "@/lib/supabase/events"
import { LoadingSpinner } from "@/components/ui/spinner"

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const { user } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [visibleParticipants, setVisibleParticipants] = useState<string[]>([])
  const [hiddenCount, setHiddenCount] = useState(0)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [requestStatus, setRequestStatus] = useState<any>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestMessage, setRequestMessage] = useState("")
  const [isEventCreator, setIsEventCreator] = useState(false)

  // イベントデータを取得
  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true)
      
      // まずローカルストレージから検索
      const savedEvents = localStorage.getItem('created_events')
      if (savedEvents) {
        const events = JSON.parse(savedEvents)
        const localEvent = events.find((e: any) => e.id === eventId)
        if (localEvent) {
          // 詳細ページ用にデータを整形
          const formattedEvent = {
            ...localEvent,
            time: localEvent.end_time 
              ? `${localEvent.start_time} - ${localEvent.end_time}` 
              : localEvent.start_time,
            rules: localEvent.rules || (localEvent.type === "tournament" ? "ラリーポイント制" : "自由練習"),
            organizer: localEvent.organizer_name || "主催者",
            participant_count: localEvent.participants || 0,
            entry_fee: localEvent.entry_fee ? `${localEvent.entry_fee.toLocaleString()}円` : "無料",
            participants: [],
            practiceType: localEvent.skill_level,
            notes: localEvent.description,
            creator_id: localEvent.creator_id
          }
          setEvent(formattedEvent)
          setIsLoading(false)
          return
        }
      }
      
      // モックデータから検索
      const foundEvent = mockEvents.find(e => e.id === eventId)
      if (foundEvent) {
        const formattedEvent = {
          ...foundEvent,
          time: foundEvent.type === "tournament" 
            ? `${foundEvent.start_time} - 17:00` 
            : `${foundEvent.start_time} - 21:00`,
          rules: foundEvent.rules || (foundEvent.type === "tournament" ? "ラリーポイント制" : "自由練習"),
          organizer: foundEvent.type === "tournament" ? "山田 太郎" : "ビーチボールバレー愛好会",
          participant_count: foundEvent.participants,
          entry_fee: foundEvent.entryFee ? `${foundEvent.entryFee.toLocaleString()}円` : "無料",
          participants: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100&h=100&fit=crop"
          ].slice(0, Math.min(5, foundEvent.participants)),
          practiceType: foundEvent.type === "practice" ? "バラ練習" : "",
          notes: foundEvent.description
        }
        setEvent(formattedEvent)
      }
      
      setIsLoading(false)
    }
    
    loadEvent()
  }, [eventId])

  // その他の状態を管理
  useEffect(() => {
    if (!event) return
    
    // 参加状態を確認
    setIsRegistered(isParticipatingInEvent(eventId))
    // お気に入り状態を確認
    setIsFavorited(isFavoriteEvent(eventId))
    
    // 主催者かどうかを確認（デモ用）
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      setIsOrganizer(userData.isOrganizer || userData.isAdmin || false)
      
      // イベント作成者かどうかを確認
      if (event.creator_id && userData.id === event.creator_id) {
        setIsEventCreator(true)
      }
      
      // 練習会の場合は申請状態も確認
      if (event.type === 'practice' && user) {
        const status = getUserRequestStatus(eventId, userData.id || user.id)
        setRequestStatus(status)
        // 承認済みの場合は参加登録状態にする
        if (status?.status === 'approved') {
          setIsRegistered(true)
        }
      }
    }
    
    // プライバシー設定を考慮した参加者リストを作成
    if (event.type === "practice" && event.participants) {
      const privacySettings = localStorage.getItem('privacy_settings')
      const settings = privacySettings ? JSON.parse(privacySettings) : { hideFromParticipants: false }
      
      // デモ用：一部の参加者を非表示にする（固定的に）
      const visible: string[] = []
      let hidden = 0
      
      event.participants.forEach((participant: string, index: number) => {
        // 最初の参加者は主催者として常に表示
        // 偶数インデックスの参加者を表示（デモ用の固定ルール）
        if (index === 0 || (!settings.hideFromParticipants && index % 2 === 0)) {
          visible.push(participant)
        } else {
          hidden++
        }
      })
      
      setVisibleParticipants(visible)
      setHiddenCount(hidden)
    }
  }, [event, eventId, user])

  if (isLoading) {
    return (
      <>
        <div className="bg-background min-h-screen pb-20">
          <div className="flex items-center bg-background p-4 pb-2 justify-between">
            <Link href="/events" className="text-foreground flex size-12 shrink-0 items-center">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
              イベント詳細
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

  if (!event) {
    return (
      <>
        <div className="bg-background min-h-screen pb-20">
          <div className="flex items-center bg-background p-4 pb-2 justify-between">
            <Link href="/events" className="text-foreground flex size-12 shrink-0 items-center">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
              エラー
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">イベントが見つかりませんでした</p>
          </div>
        </div>
        <BottomNavigation />
      </>
    )
  }

  const handleFavoriteToggle = () => {
    const newFavoritedState = toggleFavoriteEvent({
      id: eventId as string,
      name: event.name,
      type: event.type,
      event_date: event.event_date,
      venue: event.venue,
      prefecture: event.prefecture || "未設定",
      image: event.image
    })
    setIsFavorited(newFavoritedState)
  }

  const handleParticipation = async () => {
    // 練習会の場合は申請フローを使用
    if (event.type === 'practice' && !isOrganizer) {
      // 既に承認済みの場合はキャンセル
      if (requestStatus?.status === 'approved') {
        setIsLoading(true)
        setTimeout(() => {
          removeParticipatingEvent(eventId as string)
          setRequestStatus(null)
          setIsRegistered(false)
          setIsLoading(false)
        }, 500)
        return
      }
      
      // 申請モーダルを表示
      setShowRequestModal(true)
      return
    }
    
    // 大会または主催者の場合は従来通り
    setIsLoading(true)

    setTimeout(() => {
      const newRegisteredState = !isRegistered
      setIsRegistered(newRegisteredState)
      setIsLoading(false)

      // 参加状態を更新
      if (newRegisteredState) {
        // 参加登録
        addParticipatingEvent({
          id: eventId as string,
          name: event.name,
          type: event.type,
          event_date: event.event_date,
          start_time: event.start_time,
          venue: event.venue,
          image: event.image
        })
      } else {
        // 参加キャンセル
        removeParticipatingEvent(eventId as string)
      }

      // 通知設定を確認
      const notificationSettings = localStorage.getItem('notification_settings')
      const settings = notificationSettings ? JSON.parse(notificationSettings) : { pushEnabled: false, emailEnabled: true }

      if (newRegisteredState) {
        // 参加登録時の通知
        if (settings.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('参加登録完了', {
            body: `${event.name}への参加登録が完了しました`,
            icon: '/icon-192x192.png'
          })
        }

        // 主催者への通知（デモ）
        console.log('主催者への通知: 新しい参加者が登録されました')
        
        // メール通知のシミュレーション
        if (settings.emailEnabled) {
          console.log('メール送信: 主催者へ参加者登録通知')
        }
      }
    }, 500)
  }

  const handleDelete = () => {
    if (!confirm('このイベントを削除してもよろしいですか？この操作は取り消せません。')) {
      return
    }

    // localStorageから削除
    const savedEvents = localStorage.getItem('created_events')
    if (savedEvents) {
      const events = JSON.parse(savedEvents)
      const updatedEvents = events.filter((e: any) => e.id !== eventId)
      localStorage.setItem('created_events', JSON.stringify(updatedEvents))
    }

    alert('イベントを削除しました')
    router.push('/events')
  }

  return (
    <>
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/events" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          イベント詳細
        </h2>
      </div>

      {/* Event Image */}
      <div className="relative w-full aspect-video">
        <Image
          src={(event.image_url && event.image_url !== "") ? event.image_url : (event.image && event.image !== "") ? event.image : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"}
          alt={event.name}
          fill
          className="object-cover"
          priority
        />
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <Heart 
            className={cn(
              "h-6 w-6 transition-colors",
              isFavorited 
                ? "fill-red-500 text-red-500" 
                : "text-white"
            )} 
          />
        </button>
      </div>

      {/* Event Title and Host */}
      <div className="px-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] text-left flex-1">
            {event.name}
          </h1>
          {isEventCreator && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              削除
            </Button>
          )}
        </div>
      </div>

      {/* Event Information Grid */}
      <div className="p-4 grid grid-cols-[20%_1fr] gap-x-6">
        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
          <p className="text-muted-foreground text-sm font-normal leading-normal">日付</p>
          <p className="text-foreground text-sm font-normal leading-normal text-left flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {event.event_date}
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
          <p className="text-muted-foreground text-sm font-normal leading-normal">
            {event.type === "tournament" ? "開催時間" : "時間"}
          </p>
          <p className="text-foreground text-sm font-normal leading-normal">
            {event.type === "tournament" ? event.start_time : event.time}
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
          <p className="text-muted-foreground text-sm font-normal leading-normal">ルール</p>
          <p className="text-foreground text-sm font-normal leading-normal">{event.rules}</p>
        </div>
        <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
          <p className="text-muted-foreground text-sm font-normal leading-normal">参加費</p>
          <p className="text-foreground text-sm font-normal leading-normal">{event.entry_fee}</p>
        </div>
        {event.type === "practice" && event.practiceType && event.practiceType !== "all" && (
          <div className="col-span-2 grid grid-cols-subgrid border-t border-border py-5">
            <p className="text-muted-foreground text-sm font-normal leading-normal">練習タイプ</p>
            <p className="text-foreground text-sm font-normal leading-normal">{event.practiceType}</p>
          </div>
        )}
        {event.notes && (
          <div className="col-span-2 border-t border-border py-5">
            <p className="text-muted-foreground text-sm font-normal leading-normal mb-2">備考</p>
            <p className="text-foreground text-sm font-normal leading-normal whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}
      </div>

      {/* Participants Section - 練習会のみ表示 */}
      {event.type === "practice" && (visibleParticipants.length > 0 || hiddenCount > 0 || isOrganizer) && (
        <>
          <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
            参加者
          </h2>
          <div className="flex items-center px-4 py-3 justify-start gap-2">
            {visibleParticipants.map((participant, index) => (
              <div 
                key={index} 
                className="relative"
                style={{ width: index < 4 ? '34px' : '44px' }}
              >
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover border-background rounded-full flex items-center justify-center size-11 border-4"
                  style={{ backgroundImage: `url("${participant}")` }}
                />
                {index === 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    主
                  </div>
                )}
              </div>
            ))}
            {hiddenCount > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                +{hiddenCount}名
              </span>
            )}
          </div>
          {isOrganizer && hiddenCount > 0 && (
            <p className="text-xs text-muted-foreground px-4 pb-3">
              ※ プライバシー設定により一部の参加者は非表示になっています
            </p>
          )}
        </>
      )}

      {/* Map Section */}
      <div className="px-4 pt-5">
        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
          会場
        </h2>
        <div className="mb-3">
          <p className="text-foreground text-base font-medium">{event.venue}</p>
          <p className="text-muted-foreground text-sm">{event.prefecture || "未設定"}</p>
        </div>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(event.venue + ', ' + (event.prefecture || ''))}&zoom=15`}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-6">
        <CommentSection eventId={eventId as string} />
      </div>

      {/* Action Button - 練習会のみ表示 */}
      {event.type === "practice" && (
        <div className="flex px-4 py-3 pb-24">
          <Button
            className={cn(
              "flex-1 h-12",
              requestStatus?.status === 'pending'
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : requestStatus?.status === 'approved' || isRegistered
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
            size="lg"
            onClick={handleParticipation}
            disabled={isLoading || requestStatus?.status === 'pending'}
          >
            {isLoading ? "処理中..." : (
              requestStatus?.status === 'pending' ? "承認待ち" :
              requestStatus?.status === 'approved' || isRegistered ? "参加を取り消す" :
              "参加申請する"
            )}
          </Button>
        </div>
      )}
      
      {/* 参加申請モーダル */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">練習会への参加申請</h3>
            <p className="text-sm text-muted-foreground mb-4">
              この練習会への参加には主催者の承認が必要です。
            </p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="メッセージ（任意）"
              className="w-full h-24 p-3 border rounded-md resize-none mb-4"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  const demoUser = localStorage.getItem('demo_user')
                  const userData = demoUser ? JSON.parse(demoUser) : null
                  
                  try {
                    createPracticeRequest({
                      eventId: eventId as string,
                      eventName: event.name,
                      eventDate: event.event_date,
                      eventVenue: event.venue,
                      userId: userData?.id || user?.id || 'demo_user',
                      userName: userData?.name || '参加者',
                      userEmail: userData?.email || user?.email || 'user@example.com',
                      message: requestMessage,
                      status: 'pending',
                      organizerId: event.organizer // 本来は主催者のIDを使用
                    })
                    
                    setRequestStatus({ status: 'pending' })
                    setShowRequestModal(false)
                    setRequestMessage("")
                    alert("参加申請を送信しました。主催者の承認をお待ちください。")
                  } catch (error: any) {
                    alert(error.message)
                  }
                }}
              >
                申請する
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRequestModal(false)
                  setRequestMessage("")
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    <BottomNavigation />
    </>
  )
}