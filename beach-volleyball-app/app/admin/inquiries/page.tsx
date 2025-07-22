"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Inquiry {
  id: string
  userId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  createdAt: string
  status: 'unread' | 'read' | 'replied'
  reply?: string
  repliedAt?: string
}

export default function InquiriesListPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')

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

    // お問い合わせを読み込み
    const storedInquiries = localStorage.getItem('admin_inquiries')
    if (storedInquiries) {
      const inquiryList = JSON.parse(storedInquiries)
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
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'unread'
        },
        {
          id: 'demo_inquiry_2',
          userId: 'guest',
          userEmail: 'guest@example.com',
          userName: 'ゲスト',
          subject: '練習会の開催頻度について',
          message: '定期的に練習会は開催されていますか？平日の夜間に参加できる練習会を探しています。',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'read'
        },
        {
          id: 'demo_inquiry_3',
          userId: 'test_user',
          userEmail: 'test@example.com',
          userName: 'テストユーザー',
          subject: 'アカウントについて',
          message: 'パスワードを忘れてしまいました。リセット方法を教えてください。',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'replied',
          reply: 'パスワードリセットメールを送信しました。メールに記載のリンクからパスワードを再設定してください。',
          repliedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setInquiries(demoInquiries)
      localStorage.setItem('admin_inquiries', JSON.stringify(demoInquiries))
    }
  }, [router])

  useEffect(() => {
    // フィルタリング処理
    let filtered = inquiries

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter)
    }

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(i => 
        i.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredInquiries(filtered)
  }, [inquiries, statusFilter, searchQuery])

  const getUnreadCount = () => inquiries.filter(i => i.status === 'unread').length
  const getRepliedCount = () => inquiries.filter(i => i.status === 'replied').length

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          お問い合わせ管理
        </h2>
      </div>

      {/* Stats */}
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{getUnreadCount()}</p>
            <p className="text-xs text-muted-foreground">未読</p>
          </div>
          <div className="bg-green-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{getRepliedCount()}</p>
            <p className="text-xs text-muted-foreground">返信済み</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{inquiries.length}</p>
            <p className="text-xs text-muted-foreground">総数</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="検索..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === 'all' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            すべて
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === 'unread' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            未読
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === 'read' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            既読
          </button>
          <button
            onClick={() => setStatusFilter('replied')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === 'replied' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            返信済み
          </button>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="px-4">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>該当するお問い合わせはありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="block"
              >
                <div 
                  className={cn(
                    "p-4 rounded-lg transition-all hover:shadow-md",
                    inquiry.status === 'unread' ? "bg-primary/10 border-2 border-primary/30" : 
                    inquiry.status === 'replied' ? "bg-green-50 border border-green-200" :
                    "bg-white border border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{inquiry.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {inquiry.userName} · {inquiry.userEmail}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-3 py-1 rounded-full font-medium",
                      inquiry.status === 'unread' ? "bg-primary text-primary-foreground" :
                      inquiry.status === 'replied' ? "bg-green-600 text-white" :
                      "bg-gray-500 text-white"
                    )}>
                      {inquiry.status === 'unread' ? '未読' :
                       inquiry.status === 'replied' ? '返信済み' : '既読'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{inquiry.message}</p>
                  {inquiry.reply && (
                    <div className="bg-green-100/50 rounded p-2 mb-2">
                      <p className="text-xs text-green-800 line-clamp-1">
                        <span className="font-medium">返信:</span> {inquiry.reply}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      受信: {new Date(inquiry.createdAt).toLocaleDateString('ja-JP')}
                      {inquiry.repliedAt && (
                        <span className="ml-2">
                          · 返信: {new Date(inquiry.repliedAt).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-primary font-medium">
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}