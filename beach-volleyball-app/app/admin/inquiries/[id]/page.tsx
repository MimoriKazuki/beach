"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, User, Mail, Calendar, Send, Check, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/spinner"

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

export default function InquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

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

    // お問い合わせを読み込む
    const storedInquiries = localStorage.getItem('admin_inquiries')
    if (storedInquiries) {
      const inquiries: Inquiry[] = JSON.parse(storedInquiries)
      const targetInquiry = inquiries.find(i => i.id === params.id)
      
      if (targetInquiry) {
        // 既読にする
        if (targetInquiry.status === 'unread') {
          targetInquiry.status = 'read'
          localStorage.setItem('admin_inquiries', JSON.stringify(inquiries))
        }
        setInquiry(targetInquiry)
        if (targetInquiry.reply) {
          setReplyMessage(targetInquiry.reply)
        }
      } else {
        router.push("/admin")
      }
    }
  }, [router, params.id])

  const handleReply = () => {
    if (!inquiry || !replyMessage.trim()) return

    setIsReplying(true)

    // 返信を保存
    const storedInquiries = localStorage.getItem('admin_inquiries')
    if (storedInquiries) {
      const inquiries: Inquiry[] = JSON.parse(storedInquiries)
      const updatedInquiries = inquiries.map(i => {
        if (i.id === inquiry.id) {
          return {
            ...i,
            status: 'replied' as const,
            reply: replyMessage,
            repliedAt: new Date().toISOString()
          }
        }
        return i
      })
      
      localStorage.setItem('admin_inquiries', JSON.stringify(updatedInquiries))
      
      // UIを更新
      setInquiry({
        ...inquiry,
        status: 'replied',
        reply: replyMessage,
        repliedAt: new Date().toISOString()
      })
      
      setTimeout(() => {
        setIsReplying(false)
        setShowReplyForm(false)
        alert('返信を送信しました')
      }, 500)
    }
  }

  const handleDelete = () => {
    if (!inquiry) return
    
    if (confirm('このお問い合わせを削除してもよろしいですか？')) {
      const storedInquiries = localStorage.getItem('admin_inquiries')
      if (storedInquiries) {
        const inquiries: Inquiry[] = JSON.parse(storedInquiries)
        const updatedInquiries = inquiries.filter(i => i.id !== inquiry.id)
        localStorage.setItem('admin_inquiries', JSON.stringify(updatedInquiries))
        router.push("/admin")
      }
    }
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          お問い合わせ詳細
        </h2>
      </div>

      {/* Status Badge */}
      <div className="px-4 pt-2">
        <div className="inline-flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            inquiry.status === 'unread' ? 'bg-red-100 text-red-800' :
            inquiry.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {inquiry.status === 'unread' ? '未読' :
             inquiry.status === 'read' ? '既読' : '返信済み'}
          </span>
          {inquiry.repliedAt && (
            <span className="text-xs text-muted-foreground">
              返信日: {new Date(inquiry.repliedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
      </div>

      {/* Inquiry Details */}
      <div className="px-4 py-4 space-y-4">
        {/* Subject */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold mb-2">{inquiry.subject}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{inquiry.userName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{inquiry.userEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(inquiry.createdAt).toLocaleString('ja-JP')}</span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm mb-1">{inquiry.userName}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
            </div>
          </div>
        </div>

        {/* Reply Section */}
        {inquiry.reply && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-blue-700" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1 text-blue-900">管理者からの返信</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{inquiry.reply}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reply Form */}
        {showReplyForm && !inquiry.reply && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h4 className="font-medium mb-3">返信を作成</h4>
            <textarea
              className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
              rows={5}
              placeholder="返信内容を入力してください..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              disabled={isReplying}
            />
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyMessage.trim() || isReplying}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isReplying ? "送信中..." : "返信を送信"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReplyForm(false)
                  setReplyMessage("")
                }}
                disabled={isReplying}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!inquiry.reply && !showReplyForm && (
            <Button
              className="flex-1"
              onClick={() => setShowReplyForm(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              返信する
            </Button>
          )}
          {inquiry.status === 'unread' && (
            <Button
              variant="outline"
              onClick={() => {
                const storedInquiries = localStorage.getItem('admin_inquiries')
                if (storedInquiries) {
                  const inquiries: Inquiry[] = JSON.parse(storedInquiries)
                  const updatedInquiries = inquiries.map(i => 
                    i.id === inquiry.id ? {...i, status: 'read' as const} : i
                  )
                  localStorage.setItem('admin_inquiries', JSON.stringify(updatedInquiries))
                  setInquiry({...inquiry, status: 'read'})
                }
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              既読にする
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <X className="h-4 w-4 mr-2" />
            削除
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">お問い合わせ対応について</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 返信はユーザーのメールアドレスに送信されます</li>
            <li>• 返信後もこちらで履歴を確認できます</li>
            <li>• 重要な問い合わせは別途管理することをお勧めします</li>
          </ul>
        </div>
      </div>
    </div>
  )
}