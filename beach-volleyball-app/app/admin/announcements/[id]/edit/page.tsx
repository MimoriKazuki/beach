"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/spinner"

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success'
  priority: 'normal' | 'high'
  isActive: boolean
  createdAt: string
}

export default function EditAnnouncementPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as const,
    priority: "normal" as const,
  })

  useEffect(() => {
    // SuperAdmin権限をチェック
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push("/")
      return
    }
    
    const userData = JSON.parse(demoUser)
    if (userData.role !== 'super_admin') {
      router.push("/admin")
      return
    }

    // お知らせを読み込む
    const savedAnnouncements = localStorage.getItem('announcements')
    if (savedAnnouncements) {
      const announcements = JSON.parse(savedAnnouncements)
      const targetAnnouncement = announcements.find((a: Announcement) => a.id === params.id)
      if (targetAnnouncement) {
        setAnnouncement(targetAnnouncement)
        setFormData({
          title: targetAnnouncement.title,
          content: targetAnnouncement.content,
          type: targetAnnouncement.type,
          priority: targetAnnouncement.priority,
        })
      } else {
        router.push("/admin/announcements")
      }
    }
  }, [router, params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 既存のお知らせを更新
    const savedAnnouncements = localStorage.getItem('announcements')
    if (savedAnnouncements && announcement) {
      const announcements = JSON.parse(savedAnnouncements)
      const updatedAnnouncements = announcements.map((a: Announcement) =>
        a.id === announcement.id
          ? {
              ...a,
              ...formData,
            }
          : a
      )
      
      localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
      
      setTimeout(() => {
        setIsLoading(false)
        router.push("/admin/announcements")
      }, 500)
    }
  }

  if (!announcement) {
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
        <Link href="/admin/announcements" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          お知らせを編集
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">
            タイトル
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={50}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            内容
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.content.length}/200文字
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            種類
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'info' | 'warning' | 'success' })}
          >
            <option value="info">情報（青）</option>
            <option value="warning">警告（黄）</option>
            <option value="success">成功（緑）</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            優先度
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'normal' | 'high' })}
          >
            <option value="normal">通常</option>
            <option value="high">高（目立つ表示）</option>
          </select>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">プレビュー</h3>
          <div
            className={`relative overflow-hidden rounded-xl shadow-sm ${
              formData.type === 'warning' ? 'bg-gradient-to-r from-amber-50 to-orange-50' :
              formData.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
              'bg-gradient-to-r from-blue-50 to-indigo-50'
            } ${formData.priority === 'high' ? 'border-l-4 ' + (
              formData.type === 'warning' ? 'border-amber-500' :
              formData.type === 'success' ? 'border-green-500' :
              'border-blue-500'
            ) : ''}`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.type === 'warning' ? 'bg-amber-100' :
                  formData.type === 'success' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  <span className="text-lg">
                    {formData.type === 'warning' ? '⚠️' :
                     formData.type === 'success' ? '✅' :
                     '📢'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-base mb-1 ${
                    formData.type === 'warning' ? 'text-amber-900' :
                    formData.type === 'success' ? 'text-green-900' :
                    'text-blue-900'
                  }`}>
                    {formData.title || "タイトル"}
                  </h4>
                  <p className={`text-sm leading-relaxed ${
                    formData.type === 'warning' ? 'text-amber-700' :
                    formData.type === 'success' ? 'text-green-700' :
                    'text-blue-700'
                  }`}>
                    {formData.content || "内容がここに表示されます"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading || !formData.title || !formData.content}
        >
          {isLoading ? "更新中..." : "お知らせを更新"}
        </Button>
      </form>
    </div>
  )
}