"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"
import { 
  getUserPracticeRequests,
  getOrganizerPracticeRequests,
  updatePracticeRequestStatus
} from "@/lib/utils/practice-requests"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function RequestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent')
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // デモユーザー情報を取得
    const demoUser = localStorage.getItem('demo_user')
    const userData = demoUser ? JSON.parse(demoUser) : null
    
    if (userData) {
      setIsOrganizer(userData.isOrganizer || userData.isAdmin || false)
      
      // 送信した申請を取得
      const sent = getUserPracticeRequests(userData.id || user.id)
      setSentRequests(sent.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      
      // 主催者の場合は受信した申請も取得
      if (userData.isOrganizer || userData.isAdmin) {
        const received = getOrganizerPracticeRequests(userData.id || user.id)
        setReceivedRequests(received.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      }
    }
  }, [user, router])

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    setIsProcessing(true)
    const demoUser = localStorage.getItem('demo_user')
    const userData = demoUser ? JSON.parse(demoUser) : null
    
    try {
      updatePracticeRequestStatus(requestId, action, userData?.id || user?.id || '')
      
      // リストを更新
      const received = getOrganizerPracticeRequests(userData?.id || user?.id || '')
      setReceivedRequests(received.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      
      alert(`申請を${action === 'approved' ? '承認' : '却下'}しました`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/profile" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          参加申請管理
        </h2>
      </div>

      {/* Tabs */}
      {isOrganizer && (
        <div className="px-4 pt-2 pb-1">
          <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('sent')}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === 'sent'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              送信した申請
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                activeTab === 'received'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              受信した申請
            </button>
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">送信した参加申請</h3>
          {sentRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              送信した申請はありません
            </p>
          ) : (
            <div className="space-y-2">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    "p-4 rounded-lg",
                    request.status === 'pending' ? "bg-amber-50 border border-amber-200" :
                    request.status === 'approved' ? "bg-green-50 border border-green-200" :
                    "bg-red-50 border border-red-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{request.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.eventDate} · {request.eventVenue}
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
                  {request.message && (
                    <p className="text-sm text-muted-foreground mb-2">{request.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    申請日: {new Date(request.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                  {request.status === 'approved' && (
                    <Link href={`/events/${request.eventId}`}>
                      <Button size="sm" className="mt-2">
                        イベント詳細を見る
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Requests */}
      {activeTab === 'received' && isOrganizer && (
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold mb-3">受信した参加申請</h3>
          {receivedRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              受信した申請はありません
            </p>
          ) : (
            <div className="space-y-2">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    "p-4 rounded-lg",
                    request.status === 'pending' ? "bg-amber-50 border border-amber-200" :
                    "bg-muted/50"
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {request.eventName}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {request.eventDate} · {request.eventVenue}
                  </p>
                  {request.message && (
                    <div className="bg-background p-2 rounded mb-2">
                      <p className="text-sm">{request.message}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    申請日: {new Date(request.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(request.id, 'approved')}
                        disabled={isProcessing}
                      >
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequestAction(request.id, 'rejected')}
                        disabled={isProcessing}
                      >
                        却下
                      </Button>
                    </div>
                  )}
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