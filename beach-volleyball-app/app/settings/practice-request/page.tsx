"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function PracticeRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasExistingRequest, setHasExistingRequest] = useState(false)
  const [existingRequest, setExistingRequest] = useState<any>(null)
  const [formData, setFormData] = useState({
    reason: "",
    experience: "",
    plan: "",
    location: "",
    frequency: ""
  })

  useEffect(() => {
    // 既存の申請を確認
    const requests = localStorage.getItem('practice_requests')
    if (requests) {
      const requestList = JSON.parse(requests)
      const userRequest = requestList.find((req: any) => req.userId === user?.id)
      if (userRequest) {
        setHasExistingRequest(true)
        setExistingRequest(userRequest)
      }
    }

    // 既に主催者権限を持っているか確認
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      if (userData.isOrganizer) {
        router.push("/settings")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.reason.trim() || !formData.experience.trim() || !formData.plan.trim() || !formData.location.trim() || !formData.frequency.trim()) {
      alert("すべての項目を入力してください")
      return
    }

    setIsSubmitting(true)

    // デモ用：申請内容を保存
    const requests = localStorage.getItem('practice_requests')
    const requestList = requests ? JSON.parse(requests) : []
    
    const newRequest = {
      id: `request_${Date.now()}`,
      userId: user?.id || 'anonymous',
      userEmail: user?.email || 'anonymous@example.com',
      userName: JSON.parse(localStorage.getItem('demo_user') || '{}').name || 'ユーザー',
      reason: formData.reason,
      experience: formData.experience,
      plan: formData.plan,
      location: formData.location,
      frequency: formData.frequency,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    requestList.push(newRequest)
    localStorage.setItem('practice_requests', JSON.stringify(requestList))

    // 管理者への通知（デモ）
    const notificationSettings = localStorage.getItem('notification_settings')
    const settings = notificationSettings ? JSON.parse(notificationSettings) : { pushEnabled: false, emailEnabled: true }

    if (settings.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('新しい練習作成申請', {
        body: `${newRequest.userName}様から申請がありました`,
        icon: '/icon-192x192.png'
      })
    }

    setTimeout(() => {
      setIsSubmitting(false)
      alert("練習作成申請を送信しました。管理者の承認をお待ちください。")
      router.push("/settings")
    }, 1000)
  }

  if (hasExistingRequest) {
    return (
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            練習作成申請
          </h2>
        </div>

        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-900">申請状況</p>
            </div>
            <p className="text-sm text-amber-800">
              {existingRequest.status === 'pending' ? '承認待ち' : 
               existingRequest.status === 'approved' ? '承認済み' : '却下'}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              申請日: {new Date(existingRequest.createdAt).toLocaleDateString('ja-JP')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">申請理由</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {existingRequest.reason}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">運営経験</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {existingRequest.experience}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">活動予定</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {existingRequest.plan}
              </p>
            </div>

            {existingRequest.location && (
              <div>
                <h3 className="text-sm font-medium mb-2">開催予定地域</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {existingRequest.location}
                </p>
              </div>
            )}

            {existingRequest.frequency && (
              <div>
                <h3 className="text-sm font-medium mb-2">開催頻度</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {existingRequest.frequency}
                </p>
              </div>
            )}
          </div>

          {existingRequest.status === 'pending' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                管理者が申請内容を確認中です。承認されると練習会を作成できるようになります。
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          練習作成申請
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            練習会の主催者権限を申請できます。承認されると、自分で練習会を作成・管理できるようになります。
          </p>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium mb-2">
            申請理由 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            required
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="なぜ練習会を主催したいか、どのような練習会を開催したいかを記入してください"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.reason.length}/500文字
          </p>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-2">
            運営経験 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="experience"
            required
            rows={3}
            maxLength={300}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            placeholder="過去のイベント運営経験やビーチボールバレーの経験年数などを記入してください"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.experience.length}/300文字
          </p>
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-medium mb-2">
            活動予定 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="plan"
            required
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.plan}
            onChange={(e) => setFormData({...formData, plan: e.target.value})}
            placeholder="どのような練習会を開催する予定か、具体的な活動計画を記入してください"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.plan.length}/500文字
          </p>
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

        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">申請者情報</h3>
          <p className="text-sm text-muted-foreground">
            メールアドレス: {user?.email || 'ログインしていません'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ※ 審査結果はこのメールアドレスに送信されます
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2">審査について</h3>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• 申請内容は管理者が確認します</li>
            <li>• 審査には数日かかる場合があります</li>
            <li>• 承認後は責任を持って練習会を運営してください</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "送信中..." : "申請する"}
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