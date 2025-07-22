"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Mail, Phone, CheckCircle, XCircle, UserX, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { LoadingSpinner } from "@/components/ui/spinner"

interface Participant {
  id: string
  name: string
  email: string
  phone?: string
  status: 'approved' | 'pending' | 'rejected'
  requestDate: string
  approvedDate?: string
  message?: string
  avatar?: string
  skillLevel?: string
}

interface EventDetails {
  id: string
  name: string
  date: string
  venue: string
  maxParticipants: number
  type: string
  creator_id: string
}

export default function ManageEventPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'all'>('approved')

  useEffect(() => {
    // Check if user is authorized
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push('/')
      return
    }
    
    const userData = JSON.parse(demoUser)
    
    // Load event details
    const savedEvents = localStorage.getItem('created_events')
    if (savedEvents) {
      const events = JSON.parse(savedEvents)
      const currentEvent = events.find((e: any) => e.id === eventId)
      
      if (currentEvent) {
        // Check if user is the creator
        if (currentEvent.creator_id !== userData.id && !userData.isAdmin && userData.role !== 'admin' && userData.role !== 'super_admin') {
          router.push('/organizer')
          return
        }
        
        setEvent({
          id: currentEvent.id,
          name: currentEvent.name,
          date: currentEvent.event_date,
          venue: currentEvent.venue,
          maxParticipants: currentEvent.max_participants || 20,
          type: currentEvent.type,
          creator_id: currentEvent.creator_id
        })
        
        // Load participants from practice requests
        loadParticipants(eventId)
      } else {
        router.push('/organizer')
      }
    }
    
    setIsLoading(false)
  }, [eventId, router, user])

  const loadParticipants = (eventId: string) => {
    // Get practice participation requests for this event
    const requests = localStorage.getItem('practice_participation_requests')
    if (requests) {
      const allRequests = JSON.parse(requests)
      const eventRequests = allRequests.filter((r: any) => r.eventId === eventId)
      
      const participantList: Participant[] = eventRequests.map((req: any) => {
        // Get user info
        const userInfo = req.userId === 'demo_user' ? JSON.parse(localStorage.getItem('demo_user') || '{}') : {
          name: `ユーザー${req.userId.slice(-4)}`,
          email: `user${req.userId.slice(-4)}@example.com`,
          avatar: null,
          skillLevel: 'intermediate'
        }
        
        return {
          id: req.userId,
          name: userInfo.name || `ユーザー${req.userId.slice(-4)}`,
          email: userInfo.email || `user${req.userId.slice(-4)}@example.com`,
          phone: userInfo.phone,
          status: req.status,
          requestDate: req.requestDate,
          approvedDate: req.approvedDate,
          message: req.message,
          avatar: userInfo.avatar,
          skillLevel: userInfo.skillLevel
        }
      })
      
      setParticipants(participantList)
    }
  }

  const handleApprove = (participantId: string) => {
    const requests = localStorage.getItem('practice_participation_requests')
    if (requests) {
      const allRequests = JSON.parse(requests)
      const updatedRequests = allRequests.map((req: any) => {
        if (req.eventId === eventId && req.userId === participantId) {
          return {
            ...req,
            status: 'approved',
            processedAt: new Date().toISOString()
          }
        }
        return req
      })
      
      localStorage.setItem('practice_participation_requests', JSON.stringify(updatedRequests))
      loadParticipants(eventId)
    }
  }

  const handleReject = (participantId: string) => {
    const requests = localStorage.getItem('practice_participation_requests')
    if (requests) {
      const allRequests = JSON.parse(requests)
      const updatedRequests = allRequests.map((req: any) => {
        if (req.eventId === eventId && req.userId === participantId) {
          return {
            ...req,
            status: 'rejected',
            processedAt: new Date().toISOString()
          }
        }
        return req
      })
      
      localStorage.setItem('practice_participation_requests', JSON.stringify(updatedRequests))
      loadParticipants(eventId)
    }
  }

  const handleRemove = (participantId: string) => {
    if (!confirm('この参加者を除外しますか？')) return
    
    const requests = localStorage.getItem('practice_participation_requests')
    if (requests) {
      const allRequests = JSON.parse(requests)
      const updatedRequests = allRequests.filter((req: any) => 
        !(req.eventId === eventId && req.userId === participantId)
      )
      
      localStorage.setItem('practice_participation_requests', JSON.stringify(updatedRequests))
      loadParticipants(eventId)
    }
  }

  const filteredParticipants = participants.filter(p => {
    if (activeTab === 'approved') return p.status === 'approved'
    if (activeTab === 'pending') return p.status === 'pending'
    return true
  })

  const approvedCount = participants.filter(p => p.status === 'approved').length
  const pendingCount = participants.filter(p => p.status === 'pending').length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>イベントが見つかりません</p>
      </div>
    )
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/organizer" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          イベント管理
        </h2>
      </div>

      {/* Event Info */}
      <div className="px-4 py-3 bg-muted/50">
        <h3 className="font-semibold text-base">{event.name}</h3>
        <p className="text-sm text-muted-foreground">
          {event.date} · {event.venue}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {approvedCount}/{event.maxParticipants}名
            </span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">
                {pendingCount}件の承認待ち
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-2">
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'approved' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          参加者 ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'pending' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          承認待ち ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          全て ({participants.length})
        </button>
      </div>

      {/* Participants List */}
      <div className="px-4 space-y-3">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {activeTab === 'approved' && '参加者はまだいません'}
            {activeTab === 'pending' && '承認待ちの申請はありません'}
            {activeTab === 'all' && '参加申請はありません'}
          </div>
        ) : (
          filteredParticipants.map((participant) => (
            <div key={participant.id} className="bg-card rounded-lg p-4 border">
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={(participant.avatar && participant.avatar !== "") ? participant.avatar : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"}
                    alt={participant.name}
                    fill
                    className="object-cover rounded-full"
                  />
                  {participant.status === 'approved' && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {participant.status === 'rejected' && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5">
                      <XCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.email}</p>
                      {participant.skillLevel && (
                        <p className="text-xs text-muted-foreground mt-1">
                          レベル: {
                            participant.skillLevel === 'beginner' ? '初級' :
                            participant.skillLevel === 'intermediate' ? '中級' :
                            participant.skillLevel === 'advanced' ? '上級' :
                            participant.skillLevel === 'expert' ? 'エキスパート' : '未設定'
                          }
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {participant.email && (
                        <a href={`mailto:${participant.email}`} className="text-muted-foreground hover:text-foreground">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {participant.phone && (
                        <a href={`tel:${participant.phone}`} className="text-muted-foreground hover:text-foreground">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {participant.message && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      {participant.message}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">
                      申請日: {new Date(participant.requestDate).toLocaleDateString('ja-JP')}
                    </p>
                    
                    {participant.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(participant.id)}
                          className="h-7 px-3 text-xs"
                        >
                          承認
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(participant.id)}
                          className="h-7 px-3 text-xs"
                        >
                          却下
                        </Button>
                      </div>
                    )}
                    
                    {participant.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(participant.id)}
                        className="h-7 px-3 text-xs text-red-600 hover:text-red-700"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        除外
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {participants.length > 0 && (
        <div className="px-4 py-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">参加状況サマリー</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>承認済み</span>
                <span className="font-medium">{approvedCount}名</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>承認待ち</span>
                <span className="font-medium text-orange-600">{pendingCount}名</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>残り枠</span>
                <span className="font-medium">{Math.max(0, event.maxParticipants - approvedCount)}名</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <BottomNavigation />
    </>
  )
}