"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, UserCheck, UserX, Users, Calendar, Trophy, Plus, ChevronRight, MessageCircle, FileText, Settings, Newspaper, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { cn } from "@/lib/utils"

interface User {
  id: string
  email: string
  name: string
  isOrganizer: boolean
  isAdmin: boolean
  role?: string
}

interface Inquiry {
  id: string
  userId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  createdAt: string
  status: 'unread' | 'read' | 'replied'
}

export default function AdminPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'events' | 'inquiries' | 'requests'>('dashboard')
  const [users, setUsers] = useState<User[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [practiceRequests, setPracticeRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0)
  const [tournamentsCount, setTournamentsCount] = useState(0)
  const [practicesCount, setPracticesCount] = useState(0)
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin')

  useEffect(() => {
    // 管理者権限をチェック
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push("/")
      return
    }
    
    const userData = JSON.parse(demoUser)
    if (!userData.isAdmin) {
      router.push("/")
      return
    }

    // 現在のユーザーのロールを設定
    setCurrentUserRole(userData.role || 'admin')

    // 実際のユーザー数を計算
    const demoUsers = [
      userData, // 現在のユーザー
      {
        id: "demo_user",
        email: "user@example.com",
        name: "デモユーザー",
        isOrganizer: false,
        isAdmin: false,
        role: "user"
      },
      {
        id: "demo_organizer",
        email: "organizer@example.com",
        name: "デモ主催者",
        isOrganizer: true,
        isAdmin: false,
        role: "organizer"
      },
      {
        id: "demo_admin",
        email: "admin@example.com",
        name: "デモ管理者",
        isOrganizer: true,
        isAdmin: true,
        role: "admin"
      },
      {
        id: "demo_super_admin",
        email: "superadmin@example.com",
        name: "デモSuperAdmin",
        isOrganizer: true,
        isAdmin: true,
        role: "super_admin"
      }
    ]
    
    // 重複を除去
    const uniqueUsers = demoUsers.filter((user, index, self) => 
      index === self.findIndex((u) => u.id === user.id)
    )
    setUsers(uniqueUsers)
    
    // イベント数を計算
    const savedEvents = localStorage.getItem('created_events')
    if (savedEvents) {
      const events = JSON.parse(savedEvents)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      const upcomingEvents = events.filter((e: any) => {
        let eventDate: Date
        const japaneseMatch = e.event_date.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
        if (japaneseMatch) {
          eventDate = new Date(
            parseInt(japaneseMatch[1]),
            parseInt(japaneseMatch[2]) - 1,
            parseInt(japaneseMatch[3])
          )
        } else if (e.event_date.match(/^\d{4}-\d{2}-\d{2}/)) {
          eventDate = new Date(e.event_date)
        } else {
          return false
        }
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= now
      })
      
      setUpcomingEventsCount(upcomingEvents.length)
      setTournamentsCount(upcomingEvents.filter((e: any) => e.type === 'tournament').length)
      setPracticesCount(upcomingEvents.filter((e: any) => e.type === 'practice').length)
    }
    
    // お問い合わせを読み込み
    const storedInquiries = localStorage.getItem('admin_inquiries')
    console.log('Loading inquiries from localStorage:', storedInquiries)
    if (storedInquiries) {
      const inquiryList = JSON.parse(storedInquiries)
      console.log('Parsed inquiries:', inquiryList)
      setInquiries(inquiryList.sort((a: Inquiry, b: Inquiry) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } else {
      // デモ用のお問い合わせデータ
      const demoInquiries: Inquiry[] = [
        {
          id: 'demo_inquiry_1',
          userId: 'demo_user',
          userEmail: 'user@example.com',
          userName: 'デモユーザー',
          subject: '大会参加について',
          message: '春季大会に参加したいのですが、初心者でも参加可能でしょうか？',
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1時間前
          status: 'unread'
        },
        {
          id: 'demo_inquiry_2',
          userId: 'guest',
          userEmail: 'guest@example.com',
          userName: 'ゲスト',
          subject: '練習会の開催頻度について',
          message: '定期的に練習会は開催されていますか？平日の夜間に参加できる練習会を探しています。',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
          status: 'read'
        }
      ]
      setInquiries(demoInquiries)
      // デモデータを保存（次回読み込み用）
      localStorage.setItem('admin_inquiries', JSON.stringify(demoInquiries))
    }

    // 練習作成申請を読み込み
    const storedRequests = localStorage.getItem('practice_requests')
    console.log('Loading practice requests:', storedRequests)
    if (storedRequests) {
      const requestList = JSON.parse(storedRequests)
      setPracticeRequests(requestList.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } else {
      // デモ用の申請データ
      const demoRequests = [
        {
          id: 'demo_request_1',
          userId: 'demo_user_2',
          userEmail: 'tanaka@example.com',
          userName: '田中太郎',
          reason: '地域のビーチボールバレーコミュニティを活性化させたいです。',
          experience: '7年間プレイヤーとして活動、地区大会優勝経験あり',
          plan: '初心者向けの基礎練習から、中級者向けの戦術練習まで幅広く対応。月に2回のミニ大会も開催予定。',
          location: '千葉県船橋市',
          frequency: '毎週土曜日 18:00-21:00',
          createdAt: new Date(Date.now() - 7200000).toISOString(), // 2時間前
          status: 'pending'
        },
        {
          id: 'demo_request_2',
          userId: 'demo_user_3',
          userEmail: 'suzuki@example.com',
          userName: '鈴木花子',
          reason: '女性プレイヤーが気軽に参加できる環境を作りたい',
          experience: '3年、女子チームキャプテン経験',
          plan: '女性限定の練習会を月2回開催。基礎技術の向上と交流を重視。',
          location: '神奈川県横浜市',
          frequency: '第2・第4日曜日 13:00-16:00',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2日前
          status: 'approved'
        }
      ]
      setPracticeRequests(demoRequests)
      // デモデータを保存
      localStorage.setItem('practice_requests', JSON.stringify(demoRequests))
    }
  }, [router])

  const toggleOrganizerPermission = (userId: string) => {
    setIsLoading(true)
    
    // デモ：権限の切り替え
    setTimeout(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isOrganizer: !user.isOrganizer }
            : user
        )
      )
      setIsLoading(false)
    }, 500)
  }

  const toggleAdminPermission = (userId: string) => {
    setIsLoading(true)
    
    // デモ：管理者権限の切り替え
    setTimeout(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const newIsAdmin = !user.isAdmin
            return { 
              ...user, 
              isAdmin: newIsAdmin,
              // 管理者権限を付与する場合は、主催者権限も自動的に付与
              isOrganizer: newIsAdmin ? true : user.isOrganizer
            }
          }
          return user
        })
      )
      setIsLoading(false)
    }, 500)
  }

  const updateUserRole = (userId: string, role: string) => {
    setIsLoading(true)
    
    setTimeout(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            // ロールに基づいて権限を設定
            const updates: Partial<User> = { role }
            
            switch (role) {
              case 'super_admin':
                updates.isAdmin = true
                updates.isOrganizer = true
                break
              case 'admin':
                updates.isAdmin = true
                updates.isOrganizer = true
                break
              case 'organizer':
                updates.isAdmin = false
                updates.isOrganizer = true
                break
              case 'user':
              default:
                updates.isAdmin = false
                updates.isOrganizer = false
                break
            }
            
            return { ...user, ...updates }
          }
          return user
        })
      )
      setIsLoading(false)
    }, 500)
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          ユーザー管理
        </h2>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'dashboard'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            ダッシュボード
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'users'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            ユーザー管理
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
            イベント管理
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'inquiries'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            お問い合わせ
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'requests'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            申請管理
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="px-4 py-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className="bg-muted/50 rounded-lg p-4 text-left hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">総ユーザー数</p>
              </div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">デモユーザー含む</p>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className="bg-muted/50 rounded-lg p-4 text-left hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">開催予定</p>
              </div>
              <p className="text-2xl font-bold">{upcomingEventsCount}</p>
              <p className="text-xs text-muted-foreground">大会: {tournamentsCount}, 練習会: {practicesCount}</p>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className="bg-muted/50 rounded-lg p-4 text-left hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">お問い合わせ</p>
              </div>
              <p className="text-2xl font-bold">{inquiries.length}</p>
              <p className="text-xs text-muted-foreground">
                未読: {inquiries.filter(i => i.status === 'unread').length}件
              </p>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className="bg-muted/50 rounded-lg p-4 text-left hover:bg-muted/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">練習作成申請</p>
              </div>
              <p className="text-2xl font-bold">{practiceRequests.length}</p>
              <p className="text-xs text-muted-foreground">
                承認待ち: {practiceRequests.filter(r => r.status === 'pending').length}件
              </p>
            </button>
          </div>

          {/* Quick Actions */}
          <h3 className="text-base font-semibold mb-3">クイックアクション</h3>
          <div className="space-y-2 mb-6">
            <Link href="/admin/events" className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">全イベント管理</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/admin/events/tournament/create" className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">大会を作成</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/admin/events/practice/create" className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">練習会を作成</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/admin/news" className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <Newspaper className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">ニュース管理</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/admin/venues" className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">会場管理</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/admin/system" className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">システム管理</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>

          {/* Recent Activities */}
          <h3 className="text-base font-semibold mb-3">最近のアクティビティ</h3>
          <div className="space-y-2">
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <p className="font-medium">新規ユーザー登録</p>
              <p className="text-xs text-muted-foreground">田中 花子さん - 10分前</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <p className="font-medium">大会参加申込</p>
              <p className="text-xs text-muted-foreground">春季大会に5名参加 - 1時間前</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">登録ユーザー一覧</h3>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {user.role === 'super_admin' && (
                    <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full">
                      SuperAdmin
                    </span>
                  )}
                  {user.role === 'admin' || (user.isAdmin && user.role !== 'super_admin') ? (
                    <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                      管理者
                    </span>
                  ) : null}
                  {user.role === 'organizer' || (user.isOrganizer && !user.isAdmin) ? (
                    <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full">
                      主催者権限
                    </span>
                  ) : null}
                </div>
              </div>
              
              {/* SuperAdminは全ての権限を管理可能 */}
              {currentUserRole === 'super_admin' && user.role !== 'super_admin' ? (
                <div className="flex flex-col gap-2">
                  <select
                    className="px-3 py-1.5 text-sm border rounded-md"
                    value={user.role || (user.isAdmin ? 'admin' : user.isOrganizer ? 'organizer' : 'user')}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="user">一般ユーザー</option>
                    <option value="organizer">主催者</option>
                    <option value="admin">管理者</option>
                  </select>
                </div>
              ) : (
                /* 通常の管理者は主催者権限のみ管理 */
                !user.isAdmin && currentUserRole !== 'super_admin' && (
                  <Button
                    variant={user.isOrganizer ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleOrganizerPermission(user.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {user.isOrganizer ? (
                      <>
                        <UserX className="h-4 w-4" />
                        権限解除
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        権限付与
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-4 bg-muted/30 rounded-lg mt-4">
            <h4 className="text-sm font-medium mb-2">権限について</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <span className="font-medium">一般ユーザー</span>: イベントへの参加のみ可能</li>
              <li>• <span className="font-medium">主催者</span>: 練習会と大会の作成・管理が可能</li>
              <li>• <span className="font-medium">管理者</span>: 主催者権限の付与・解除、全イベントの管理が可能</li>
              {currentUserRole === 'super_admin' && (
                <>
                  <li>• <span className="font-medium">SuperAdmin</span>: 全ての権限を管理可能</li>
                  <li className="text-purple-600 font-medium mt-2">※ あなたはSuperAdminとして全ての権限を管理できます</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="px-4 py-4">
          {/* Link to full event management page */}
          <div className="mb-4">
            <Link href="/admin/events" className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">全イベント管理</p>
                  <p className="text-xs text-muted-foreground">すべてのイベントを編集・削除</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">イベント作成</h3>
            <div className="flex gap-2">
              <Link href="/admin/events/tournament/create">
                <Button size="sm" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  大会作成
                </Button>
              </Link>
              <Link href="/admin/events/practice/create">
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  練習会作成
                </Button>
              </Link>
            </div>
          </div>

          {/* Event List */}
          <div className="space-y-2">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">春季ビーチボールバレー大会</p>
                <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">大会</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">2025年8月20日 · 大宮市民体育館</p>
              <div className="flex items-center justify-between">
                <p className="text-xs">参加者: 24/32</p>
                <Link href="/admin/events/1/edit" className="text-xs text-primary hover:underline">編集</Link>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">水曜練習会</p>
                <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">練習会</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">2025年7月30日 · 川越第二体育館</p>
              <div className="flex items-center justify-between">
                <p className="text-xs">参加者: 12/20</p>
                <Link href="/admin/events/2/edit" className="text-xs text-primary hover:underline">編集</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">お問い合わせ管理</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {inquiries.filter(i => i.status === 'unread').length} 件の未読
              </div>
              <Link href="/admin/inquiries">
                <Button size="sm" variant="outline">
                  すべて見る
                </Button>
              </Link>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>お問い合わせはありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/admin/inquiries/${inquiry.id}`}
                  className="block"
                >
                  <div 
                    className={cn(
                      "p-4 rounded-lg transition-colors hover:bg-muted/70",
                      inquiry.status === 'unread' ? "bg-primary/10 border border-primary/20" : 
                      inquiry.status === 'replied' ? "bg-green-50 border border-green-200" :
                      "bg-muted/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{inquiry.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {inquiry.userName} ({inquiry.userEmail})
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        inquiry.status === 'unread' ? "bg-primary text-primary-foreground" :
                        inquiry.status === 'replied' ? "bg-green-600 text-white" :
                        "bg-gray-500 text-white"
                      )}>
                        {inquiry.status === 'unread' ? '未読' :
                         inquiry.status === 'replied' ? '返信済み' : '既読'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{inquiry.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(inquiry.createdAt).toLocaleString('ja-JP')}
                      </p>
                      <span className="text-xs text-primary">
                        詳細を見る →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">お問い合わせ対応について</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• クリックして詳細ページへ移動できます</li>
              <li>• 詳細ページで返信・削除が可能です</li>
              <li>• 返信済みのお問い合わせは緑色で表示されます</li>
            </ul>
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">練習作成申請管理</h3>
            <div className="text-sm text-muted-foreground">
              {practiceRequests.filter(r => r.status === 'pending').length} 件の承認待ち
            </div>
          </div>

          {practiceRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>申請はありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {practiceRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={cn(
                    "p-4 rounded-lg",
                    request.status === 'pending' ? "bg-amber-50 border border-amber-200" : "bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{request.userName}様からの申請</p>
                      <p className="text-xs text-muted-foreground">
                        {request.userEmail}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      request.status === 'pending' ? "bg-amber-600 text-white" : 
                      request.status === 'approved' ? "bg-green-600 text-white" : 
                      "bg-red-600 text-white"
                    )}>
                      {request.status === 'pending' ? '承認待ち' : 
                       request.status === 'approved' ? '承認済み' : '却下'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">申請理由:</p>
                      <p className="text-sm line-clamp-2">{request.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">経験:</p>
                      <p className="text-sm line-clamp-1">{request.experience}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">開催地域:</p>
                      <p className="text-sm">{request.location} / {request.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">活動計画:</p>
                      <p className="text-sm line-clamp-2">{request.plan}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleString('ja-JP')}
                    </p>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          onClick={() => {
                            // 承認処理
                            const updatedRequests = practiceRequests.map(r => 
                              r.id === request.id ? {...r, status: 'approved'} : r
                            )
                            setPracticeRequests(updatedRequests)
                            localStorage.setItem('practice_requests', JSON.stringify(updatedRequests))
                            
                            // ユーザーに主催者権限とイベント作成権限を付与
                            const demoUser = localStorage.getItem('demo_user')
                            if (demoUser && JSON.parse(demoUser).email === request.userEmail) {
                              const userData = JSON.parse(demoUser)
                              userData.isOrganizer = true
                              userData.canCreateEvents = true // イベント作成権限を付与
                              localStorage.setItem('demo_user', JSON.stringify(userData))
                            }
                            
                            // ユーザーリストも更新
                            const updatedUsers = users.map(u => 
                              u.email === request.userEmail ? {
                                ...u, 
                                isOrganizer: true,
                                canCreateEvents: true
                              } : u
                            )
                            setUsers(updatedUsers)
                            
                            alert(`${request.userName}様の申請を承認しました。イベント作成権限が付与されました。`)
                          }}
                        >
                          承認
                        </button>
                        <button 
                          className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => {
                            // 却下処理
                            const updatedRequests = practiceRequests.map(r => 
                              r.id === request.id ? {...r, status: 'rejected'} : r
                            )
                            setPracticeRequests(updatedRequests)
                            localStorage.setItem('practice_requests', JSON.stringify(updatedRequests))
                            alert(`${request.userName}様の申請を却下しました`)
                          }}
                        >
                          却下
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">申請承認について</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 申請内容を確認して承認/却下してください</li>
              <li>• 承認すると申請者に主催者権限が付与されます</li>
              <li>• 主催者権限では練習会と大会の作成が可能になります</li>
              <li>• 権限付与後は管理者画面から解除できます</li>
            </ul>
          </div>
        </div>
      )}
    </div>
    <BottomNavigation />
    </>
  )
}