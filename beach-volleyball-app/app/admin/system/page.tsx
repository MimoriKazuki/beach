"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database, Users, Calendar, Settings, Shield, Activity, Trash2, Download, Upload } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { cn } from "@/lib/utils"

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalEvents: number
  upcomingEvents: number
  totalRequests: number
  pendingRequests: number
  totalComments: number
  storageUsed: string
}

export default function SystemAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'users' | 'maintenance'>('overview')
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalComments: 0,
    storageUsed: '0 KB'
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 管理者権限をチェック
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      if (!userData.isAdmin) {
        router.push("/")
        return
      }
    } else {
      router.push("/")
      return
    }

    // システム統計を計算
    calculateSystemStats()
  }, [router])

  const calculateSystemStats = () => {
    // LocalStorageのデータを集計
    const createdEvents = JSON.parse(localStorage.getItem('created_events') || '[]')
    const participatingEvents = JSON.parse(localStorage.getItem('participating_events') || '[]')
    const practiceRequests = JSON.parse(localStorage.getItem('practice_participation_requests') || '[]')
    const adminInquiries = JSON.parse(localStorage.getItem('admin_inquiries') || '[]')
    const practiceCreateRequests = JSON.parse(localStorage.getItem('practice_requests') || '[]')
    
    // デモユーザー数をカウント（重複なし）
    const demoUserCount = 4 // User, Organizer, Admin, SuperAdmin
    
    // 実際のイベント数を計算
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const upcomingEvents = createdEvents.filter((e: any) => {
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
    
    // コメント数を計算
    let totalComments = 0
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (key.startsWith('event_comments_')) {
        const comments = JSON.parse(localStorage.getItem(key) || '[]')
        totalComments += comments.length
      }
    })

    // LocalStorageの使用量を計算
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    const sizeInKB = (totalSize / 1024).toFixed(2)

    // 統計を更新
    setStats({
      totalUsers: demoUserCount,
      activeUsers: participatingEvents.length > 0 ? Math.min(participatingEvents.length, demoUserCount) : 1,
      totalEvents: createdEvents.length,
      upcomingEvents: upcomingEvents.length,
      totalRequests: practiceRequests.length + adminInquiries.length + practiceCreateRequests.length,
      pendingRequests: practiceRequests.filter((r: any) => r.status === 'pending').length +
                      adminInquiries.filter((i: any) => i.status === 'unread').length +
                      practiceCreateRequests.filter((r: any) => r.status === 'pending').length,
      totalComments,
      storageUsed: `${sizeInKB} KB`
    })
  }

  const handleExportData = () => {
    const allData: any = {}
    
    // すべてのLocalStorageデータを収集
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '')
        } catch {
          allData[key] = localStorage.getItem(key)
        }
      }
    }

    // JSONファイルとしてダウンロード
    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `beach-volleyball-backup-${new Date().toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('データをエクスポートしました')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result)
          
          // 確認ダイアログ
          if (confirm('既存のデータが上書きされます。続行しますか？')) {
            // LocalStorageをクリア
            localStorage.clear()
            
            // インポートしたデータを設定
            for (let key in data) {
              if (data.hasOwnProperty(key)) {
                localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]))
              }
            }
            
            alert('データをインポートしました')
            calculateSystemStats()
          }
        } catch (error) {
          alert('ファイルの読み込みに失敗しました')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClearData = (dataType: string) => {
    const confirmMessage = dataType === 'all' 
      ? 'すべてのデータを削除します。この操作は取り消せません。続行しますか？'
      : `${dataType}のデータを削除します。続行しますか？`

    if (!confirm(confirmMessage)) return

    setIsLoading(true)

    switch (dataType) {
      case 'all':
        localStorage.clear()
        alert('すべてのデータを削除しました')
        router.push('/auth/login')
        break
      case 'events':
        localStorage.removeItem('events')
        localStorage.removeItem('participating_events')
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(key => {
          if (key.startsWith('event_comments_')) {
            localStorage.removeItem(key)
          }
        })
        alert('イベントデータを削除しました')
        break
      case 'users':
        localStorage.removeItem('users')
        localStorage.removeItem('demo_user')
        alert('ユーザーデータを削除しました')
        router.push('/auth/login')
        break
      case 'requests':
        localStorage.removeItem('practice_participation_requests')
        localStorage.removeItem('practice_requests')
        localStorage.removeItem('admin_inquiries')
        alert('申請データを削除しました')
        break
    }

    setIsLoading(false)
    calculateSystemStats()
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          システム管理
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
            onClick={() => setActiveTab('data')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'data'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            データ管理
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
            ユーザー
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
              activeTab === 'maintenance'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            メンテナンス
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">システム統計</h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium">総ユーザー数</p>
              </div>
              <p className="text-xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">アクティブ: {stats.activeUsers}</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium">総イベント数</p>
              </div>
              <p className="text-xl font-bold">{stats.totalEvents}</p>
              <p className="text-xs text-muted-foreground">開催予定: {stats.upcomingEvents}</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium">総申請数</p>
              </div>
              <p className="text-xl font-bold">{stats.totalRequests}</p>
              <p className="text-xs text-muted-foreground">未処理: {stats.pendingRequests}</p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium">ストレージ使用量</p>
              </div>
              <p className="text-xl font-bold">{stats.storageUsed}</p>
              <p className="text-xs text-muted-foreground">コメント数: {stats.totalComments}</p>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">システム情報</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• バージョン: 1.0.0</li>
              <li>• 環境: デモ環境（LocalStorage）</li>
              <li>• 最終更新: {new Date().toLocaleString('ja-JP')}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">データ管理</h3>
          
          <div className="space-y-3">
            {/* Export/Import */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">バックアップ・復元</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  データをエクスポート
                </Button>
                <Button
                  onClick={handleImportData}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Upload className="h-4 w-4" />
                  データをインポート
                </Button>
              </div>
            </div>

            {/* Data Clear */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 mb-3">データ削除</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => handleClearData('events')}
                  className="w-full"
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  イベントデータを削除
                </Button>
                <Button
                  onClick={() => handleClearData('requests')}
                  className="w-full"
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  申請データを削除
                </Button>
                <Button
                  onClick={() => handleClearData('users')}
                  className="w-full"
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                >
                  ユーザーデータを削除
                </Button>
                <div className="border-t pt-2 mt-2">
                  <Button
                    onClick={() => handleClearData('all')}
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    すべてのデータを削除
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">ユーザー管理</h3>
          
          <div className="space-y-3">
            {/* Admin User */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <p className="font-medium">システム管理者</p>
              </div>
              <p className="text-sm text-muted-foreground">admin@example.com</p>
              <p className="text-xs text-muted-foreground mt-1">すべての権限を持つスーパーユーザー</p>
            </div>

            {/* User Actions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">ユーザー操作</h4>
              <div className="space-y-2">
                <Link href="/admin">
                  <Button className="w-full" variant="outline" size="sm">
                    ユーザー権限管理
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    const demoUser = localStorage.getItem('demo_user')
                    if (demoUser) {
                      const userData = JSON.parse(demoUser)
                      userData.isOrganizer = true
                      localStorage.setItem('demo_user', JSON.stringify(userData))
                      alert('現在のユーザーに主催者権限を付与しました')
                    }
                  }}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  現在のユーザーに主催者権限を付与
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">メンテナンス</h3>
          
          <div className="space-y-3">
            {/* Cache Clear */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">キャッシュ管理</h4>
              <Button
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => {
                        caches.delete(name)
                      })
                    })
                    alert('キャッシュをクリアしました')
                  }
                }}
                className="w-full"
                variant="outline"
                size="sm"
              >
                ブラウザキャッシュをクリア
              </Button>
            </div>

            {/* System Actions */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">システム操作</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    calculateSystemStats()
                    alert('統計情報を更新しました')
                  }}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  統計情報を再計算
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('アプリケーションを再起動しますか？')) {
                      window.location.reload()
                    }
                  }}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  アプリケーションを再起動
                </Button>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-900 mb-2">デバッグ情報</h4>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• ブラウザ: {navigator.userAgent.split(' ').slice(-2).join(' ')}</li>
                <li>• 画面サイズ: {window.innerWidth} x {window.innerHeight}</li>
                <li>• オンライン: {navigator.onLine ? 'はい' : 'いいえ'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
    <BottomNavigation />
    </>
  )
}