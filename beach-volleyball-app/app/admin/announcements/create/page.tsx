"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Megaphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"

export default function CreateAnnouncementPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as "info" | "warning" | "success",
    priority: "normal" as "normal" | "high"
  })

  useEffect(() => {
    // SuperAdmin権限チェック
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push('/')
      return
    }
    
    const userData = JSON.parse(demoUser)
    if (userData.role !== 'super_admin') {
      router.push('/admin')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // お知らせデータを作成
      const announcement = {
        id: `announcement_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        createdAt: new Date().toISOString(),
        createdBy: 'super_admin',
        isActive: true
      }

      // 既存のお知らせを取得
      const existingAnnouncements = localStorage.getItem('announcements')
      const announcements = existingAnnouncements ? JSON.parse(existingAnnouncements) : []
      
      // 新しいお知らせを追加（最初に表示）
      announcements.unshift(announcement)
      
      // 最大10件まで保存
      const savedAnnouncements = announcements.slice(0, 10)
      
      // localStorageに保存
      localStorage.setItem('announcements', JSON.stringify(savedAnnouncements))

      // 成功メッセージ
      alert('お知らせを作成しました')
      
      // フォームをリセット
      setFormData({
        title: "",
        content: "",
        type: "info",
        priority: "normal"
      })
      
      // お知らせ管理画面に戻る
      setTimeout(() => {
        router.push('/admin/announcements')
      }, 500)

    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('作成中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
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
          お知らせ作成
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">SuperAdmin限定機能</p>
          </div>
          <p className="text-xs text-purple-800">
            ここで作成したお知らせはホーム画面の上部に表示されます。
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={50}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="例: システムメンテナンスのお知らせ"
          />
          <p className="text-xs text-muted-foreground mt-1">
            最大50文字
          </p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            required
            rows={4}
            maxLength={200}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="お知らせの詳細内容を入力してください"
          />
          <p className="text-xs text-muted-foreground mt-1">
            最大200文字 ({formData.content.length}/200)
          </p>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2">
            種類 <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value as any})}
          >
            <option value="info">お知らせ（青）</option>
            <option value="warning">注意（黄）</option>
            <option value="success">完了（緑）</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-2">
            優先度 <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
          >
            <option value="normal">通常</option>
            <option value="high">高（目立つ表示）</option>
          </select>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "作成中..." : "お知らせを作成"}
          </Button>
        </div>
      </form>

      {/* Preview */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium mb-2">プレビュー</h3>
        <div className={`p-4 rounded-lg border ${
          formData.type === 'warning' ? 'bg-amber-50 border-amber-200' :
          formData.type === 'success' ? 'bg-green-50 border-green-200' :
          'bg-blue-50 border-blue-200'
        } ${formData.priority === 'high' ? 'ring-2 ring-offset-2 ' + (
          formData.type === 'warning' ? 'ring-amber-400' :
          formData.type === 'success' ? 'ring-green-400' :
          'ring-blue-400'
        ) : ''}`}>
          <h4 className={`font-medium mb-1 ${
            formData.type === 'warning' ? 'text-amber-900' :
            formData.type === 'success' ? 'text-green-900' :
            'text-blue-900'
          }`}>
            {formData.title || "タイトルを入力してください"}
          </h4>
          <p className={`text-sm ${
            formData.type === 'warning' ? 'text-amber-800' :
            formData.type === 'success' ? 'text-green-800' :
            'text-blue-800'
          }`}>
            {formData.content || "内容を入力してください"}
          </p>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}