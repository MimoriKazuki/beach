"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function PracticeRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    reason: "",
    experience: "",
    plan: "",
    location: "",
    frequency: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 認証情報をチェック
      if (!user) {
        alert('ログインが必要です')
        router.push('/auth/login')
        return
      }

      // デモユーザー情報を取得（権限チェック用）
      const demoUser = localStorage.getItem('demo_user')
      const userData = demoUser ? JSON.parse(demoUser) : null

      // 既に主催者権限を持っている場合
      if (userData?.isOrganizer || userData?.canCreateEvents) {
        alert('既に主催者権限をお持ちです')
        router.push('/organizer')
        return
      }

      // 申請データを作成
      const request = {
        id: `request_${Date.now()}`,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー',
        reason: formData.reason,
        experience: formData.experience,
        plan: formData.plan,
        location: formData.location,
        frequency: formData.frequency,
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      }

      // 既存の申請を取得
      const existingRequests = localStorage.getItem('practice_requests')
      const requests = existingRequests ? JSON.parse(existingRequests) : []
      
      // 既に申請中の場合はチェック
      const pendingRequest = requests.find((r: any) => 
        r.userId === user.id && r.status === 'pending'
      )
      
      if (pendingRequest) {
        alert('既に申請が提出されています。管理者の承認をお待ちください。')
        router.push('/others')
        return
      }
      
      // 新しい申請を追加
      requests.unshift(request)
      
      // localStorageに保存
      localStorage.setItem('practice_requests', JSON.stringify(requests))

      // 成功メッセージ
      alert('練習作成申請を送信しました。管理者の承認をお待ちください。')
      
      // フォームをリセット
      setFormData({
        reason: "",
        experience: "",
        plan: "",
        location: "",
        frequency: ""
      })
      
      // リダイレクト
      setTimeout(() => {
        router.push('/others')
      }, 1000)

    } catch (error) {
      console.error('Error sending request:', error)
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
          練習作成申請
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            練習会を作成するには主催者権限が必要です。
            以下のフォームから申請してください。
          </p>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium mb-2">
            申請理由 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="練習会を開催したい理由をお書きください"
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-2">
            ビーチボールバレー経験 <span className="text-red-500">*</span>
          </label>
          <input
            id="experience"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            placeholder="例: 5年、大会出場経験あり"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            開催予定地域 <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="例: 埼玉県川越市"
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium mb-2">
            開催頻度 <span className="text-red-500">*</span>
          </label>
          <input
            id="frequency"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.frequency}
            onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            placeholder="例: 週1回、毎週水曜日"
          />
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-medium mb-2">
            活動計画 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="plan"
            required
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.plan}
            onChange={(e) => setFormData({...formData, plan: e.target.value})}
            placeholder="どのような練習会を開催する予定か、具体的にお書きください"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "送信中..." : "申請を送信"}
          </Button>
        </div>
      </form>

      {/* Info */}
      <div className="px-4 pb-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">申請について</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 申請は管理者が確認し、承認/却下します</li>
            <li>• 承認されると練習会を作成できるようになります</li>
            <li>• 通常1〜2営業日以内に結果をお知らせします</li>
            <li>• 虚偽の申請は承認されません</li>
          </ul>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}