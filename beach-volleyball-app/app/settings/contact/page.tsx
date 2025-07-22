"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function ContactPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("件名とメッセージを入力してください")
      return
    }

    setIsSubmitting(true)

    // デモ用：お問い合わせ内容を保存
    const inquiries = localStorage.getItem('admin_inquiries')
    const inquiryList = inquiries ? JSON.parse(inquiries) : []
    
    const newInquiry = {
      id: `inquiry_${Date.now()}`,
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous@example.com',
      userName: JSON.parse(localStorage.getItem('demo_user') || '{}').name || 'ユーザー',
      subject: formData.subject,
      message: formData.message,
      createdAt: new Date().toISOString(),
      status: 'unread'
    }
    
    inquiryList.push(newInquiry)
    localStorage.setItem('admin_inquiries', JSON.stringify(inquiryList))

    // 通知設定を確認
    const notificationSettings = localStorage.getItem('notification_settings')
    const settings = notificationSettings ? JSON.parse(notificationSettings) : { pushEnabled: false, emailEnabled: true }

    // 管理者への通知（デモ）
    if (settings.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('新しいお問い合わせ', {
        body: `${newInquiry.userName}様からお問い合わせがありました`,
        icon: '/icon-192x192.png'
      })
    }

    // メール通知のシミュレーション
    if (settings.emailEnabled) {
      console.log('管理者へメール送信: 新しいお問い合わせ')
      console.log(`件名: ${formData.subject}`)
      console.log(`送信者: ${newInquiry.userName} (${newInquiry.userEmail})`)
    }

    setTimeout(() => {
      setIsSubmitting(false)
      alert("お問い合わせを送信しました。管理者からの返信をお待ちください。")
      router.push("/settings")
    }, 1000)
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          お問い合わせ
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            管理者へのお問い合わせフォームです。アプリの不具合、ご要望、その他ご質問などをお送りください。
          </p>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            件名 <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            required
            maxLength={100}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="お問い合わせの件名を入力"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            メッセージ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            rows={8}
            maxLength={1000}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="お問い合わせ内容を詳しくご記入ください"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.message.length}/1000文字
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">送信者情報</h3>
          <p className="text-sm text-muted-foreground">
            メールアドレス: {user?.email || 'ログインしていません'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ※ 返信はこのメールアドレスに送信されます
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "送信中..." : "送信する"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings")}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}