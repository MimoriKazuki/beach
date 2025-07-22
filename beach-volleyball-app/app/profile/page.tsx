"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SKILL_LEVELS } from "@/lib/constants/levels"
import { getUpcomingEvents, getPastEvents } from "@/lib/utils/event-participation"
import { getFavoriteEvents } from "@/lib/utils/favorites"
import { LoadingSpinner } from "@/components/ui/spinner"

export default function ProfilePage() {
  const { user: authUser, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
  const [favoriteEvents, setFavoriteEvents] = useState<any[]>([])
  const [demoUser, setDemoUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // デモユーザーデータを取得
  useEffect(() => {
    console.log('Profile: Initializing...')
    if (typeof window !== 'undefined') {
      const demoUserData = localStorage.getItem('demo_user')
      console.log('Profile: Demo user data:', demoUserData)
      if (demoUserData) {
        try {
          const parsed = JSON.parse(demoUserData)
          console.log('Profile: Parsed demo user:', parsed)
          setDemoUser(parsed)
        } catch (e) {
          console.error('Profile: Error parsing demo user:', e)
        }
      }
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    // 参加予定のイベントを取得
    const upcoming = getUpcomingEvents()
    const past = getPastEvents()
    const favorites = getFavoriteEvents()
    
    // 日付フォーマットを調整
    const formatEvents = (events: any[]) => events.map(e => ({
      ...e,
      date: new Date(e.event_date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      })
    }))
    
    setUpcomingEvents(formatEvents(upcoming))
    setPastEvents(formatEvents(past))
    setFavoriteEvents(formatEvents(favorites))
  }, [])

  useEffect(() => {
    // 初期化が完了してから認証チェック
    console.log('Profile: Auth check - initialized:', isInitialized, 'loading:', loading, 'authUser:', authUser, 'demoUser:', demoUser)
    if (isInitialized && !loading && !authUser && !demoUser) {
      console.log('Profile: No user found, redirecting to login...')
      router.push("/auth/login")
    }
  }, [isInitialized, loading, authUser, router, demoUser])
  
  const user = {
    name: demoUser?.name || authUser?.user_metadata?.name || "ユーザー",
    username: authUser?.email ? `@${authUser.email.split('@')[0]}` : "@user",
    bio: demoUser?.bio || "ビーチボールバレー愛好家",
    region: demoUser?.region || "未設定",
    skillLevel: demoUser?.skillLevel || "beginner",
    experienceYears: demoUser?.experienceYears || "0",
    avatar: (demoUser?.avatar && demoUser.avatar !== "") ? demoUser.avatar : 
           (authUser?.user_metadata?.avatar_url && authUser?.user_metadata?.avatar_url !== "") ? authUser?.user_metadata?.avatar_url : 
           "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    team: demoUser?.team || "",
    role: demoUser?.role || "participant",
    email: demoUser?.email || authUser?.email || ""
  }

  const handleLogout = async () => {
    // デモユーザーの場合
    if (demoUser) {
      // デモユーザーDBのlogout関数を使用
      const { logout } = await import('@/lib/demo-users-db')
      logout()
      router.push("/auth/login")
      router.refresh()
      return
    }

    // Supabase認証の場合
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  console.log('Profile: Render check - loading:', loading, 'isInitialized:', isInitialized, 'authUser:', authUser, 'demoUser:', demoUser)
  
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!authUser && !demoUser) {
    return null
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          マイページ
        </h2>
      </div>

      {/* Profile Section */}
      <div className="flex p-4">
        <div className="flex w-full flex-col gap-4 items-center">
          <div className="flex gap-4 flex-col items-center">
            <div className="relative w-32 h-32">
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                {user.name}
              </p>
              <p className="text-muted-foreground text-base font-normal leading-normal text-center">
                {user.username}
              </p>
              <p className="text-muted-foreground text-base font-normal leading-normal text-center">
                {user.bio}
              </p>
              <p className="text-muted-foreground text-sm font-normal leading-normal text-center mt-1">
                📍 {user.region} · {SKILL_LEVELS.find(l => l.value === user.skillLevel)?.label || "初級"} · 経験{user.experienceYears}年
              </p>
              {user.team && (
                <p className="text-muted-foreground text-sm font-normal leading-normal text-center mt-1">
                  🏐 {user.team === "なし" ? "所属チームなし" : user.team}
                </p>
              )}
              
              {/* アカウント権限情報 */}
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">アカウント情報</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    メール: {user.email}
                  </p>
                  <p className="text-xs">
                    権限: {
                      user.role === 'super_admin' ? '👑 Super Admin' :
                      user.role === 'admin' ? '🔐 管理者' :
                      user.role === 'organizer' ? '📅 主催者' :
                      '👤 一般ユーザー'
                    }
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {user.role === 'super_admin' && (
                      <>✓ システム管理 ✓ 大会作成 ✓ 練習作成 ✓ ユーザー管理</>
                    )}
                    {user.role === 'admin' && (
                      <>✓ 大会作成 ✓ 練習作成 ✓ 申請承認</>
                    )}
                    {user.role === 'organizer' && (
                      <>✓ 練習作成</>
                    )}
                    {user.role === 'participant' && (
                      <>✓ イベント参加</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link href="/profile/edit" className="w-full max-w-[480px]">
            <Button
              variant="secondary"
              className="w-full"
            >
              プロフィールを編集
            </Button>
          </Link>
        </div>
      </div>

      {/* Request Management Link */}
      <div className="px-4 py-2">
        <Link href="/profile/requests">
          <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
            <p className="text-sm font-medium">参加申請管理</p>
            <p className="text-xs text-muted-foreground mt-1">
              練習会への参加申請の状況を確認
            </p>
          </div>
        </Link>
      </div>

      {/* Favorite Events Section */}
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        お気に入りのイベント
      </h2>
      {favoriteEvents.length === 0 ? (
        <p className="text-muted-foreground text-sm px-4 py-2">お気に入りのイベントはありません</p>
      ) : (
        favoriteEvents.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <div className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2 hover:bg-muted/20 transition-colors">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
              <Image
                src={(event.image && event.image !== "") ? event.image : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"}
                alt={event.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-1 right-1 bg-white/90 rounded-full p-1">
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-foreground text-base font-medium leading-normal line-clamp-1">
                {event.name}
              </p>
              <p className="text-muted-foreground text-sm font-normal leading-normal line-clamp-2">
                {event.date} · {event.type === 'tournament' ? '大会' : '練習会'}
              </p>
            </div>
          </div>
        </Link>
        ))
      )}

      {/* Joined Events Section */}
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        参加予定のイベント
      </h2>
      {upcomingEvents.length === 0 ? (
        <p className="text-muted-foreground text-sm px-4 py-2">参加予定のイベントはありません</p>
      ) : (
        upcomingEvents.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <div className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2 hover:bg-muted/20 transition-colors">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
              <Image
                src={(event.image && event.image !== "") ? event.image : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-foreground text-base font-medium leading-normal line-clamp-1">
                {event.name}
              </p>
              <p className="text-muted-foreground text-sm font-normal leading-normal line-clamp-2">
                {event.date}
              </p>
            </div>
          </div>
        </Link>
        ))
      )}

      {/* Participation History Section */}
      <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        参加履歴
      </h2>
      {pastEvents.length === 0 ? (
        <p className="text-muted-foreground text-sm px-4 py-2">参加履歴はありません</p>
      ) : (
        pastEvents.map((event) => (
        <div key={event.id} className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden">
            <Image
              src={event.image}
              alt={event.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-foreground text-base font-medium leading-normal line-clamp-1">
              {event.name}
            </p>
            <p className="text-muted-foreground text-sm font-normal leading-normal line-clamp-2">
              {event.date}
            </p>
          </div>
        </div>
        ))
      )}

      {/* Logout Button */}
      <div className="px-4 py-6">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}