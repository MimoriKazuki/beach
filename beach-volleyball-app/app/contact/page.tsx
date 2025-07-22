"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function ContactPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    email: "",
    name: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // デモユーザー情報を取得
      const demoUser = localStorage.getItem('demo_user')
      const userData = demoUser ? JSON.parse(demoUser) : null

      // お問い合わせデータを作成
      const inquiry = {
        id: `inquiry_${Date.now()}`,
        userId: userData?.id || 'guest',
        userEmail: formData.email || userData?.email || 'guest@example.com',
        userName: formData.name || userData?.name || 'ゲストユーザー',
        subject: formData.subject,
        message: formData.message,
        createdAt: new Date().toISOString(),
        status: 'unread' as const
      }

      // 既存のお問い合わせを取得
      const existingInquiries = localStorage.getItem('admin_inquiries')
      const inquiries = existingInquiries ? JSON.parse(existingInquiries) : []
      
      // 新しいお問い合わせを追加
      inquiries.unshift(inquiry)
      
      // localStorageに保存
      localStorage.setItem('admin_inquiries', JSON.stringify(inquiries))

      // 成功メッセージ
      alert('お問い合わせを送信しました。管理者からの返信をお待ちください。')
      
      // フォームをリセット
      setFormData({
        subject: "",
        message: "",
        email: "",
        name: ""
      })
      
      // 少し待ってからリダイレクト
      setTimeout(() => {
        router.push('/others')
      }, 1000)

    } catch (error) {
      console.error('Error sending inquiry:', error)
      alert('送信中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/others" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          お問い合わせ
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            管理者へのお問い合わせフォームです。返信はメールで行われます。
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            お名前
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="例: 山田 太郎"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="例: yamada@example.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            件名 <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder="お問い合わせの件名を入力"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            rows={6}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="お問い合わせ内容を詳しくお書きください"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "送信中..." : "送信する"}
          </Button>
        </div>
      </form>

      {/* Info */}
      <div className="px-4 pb-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">お問い合わせについて</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 通常1〜2営業日以内に返信いたします</li>
            <li>• 緊急の場合は直接ご連絡ください</li>
            <li>• イベントに関する質問は主催者へ直接お問い合わせください</li>
          </ul>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}