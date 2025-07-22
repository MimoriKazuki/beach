"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Plus, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success'
  priority: 'normal' | 'high'
  isActive: boolean
  createdAt: string
}

export default function AnnouncementsManagementPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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
      setAnnouncements(JSON.parse(savedAnnouncements))
    }
  }, [router])

  const toggleActive = (id: string) => {
    const updatedAnnouncements = announcements.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    )
    setAnnouncements(updatedAnnouncements)
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
  }

  const deleteAnnouncement = (id: string) => {
    setIsDeleting(id)
    setTimeout(() => {
      const updatedAnnouncements = announcements.filter(a => a.id !== id)
      setAnnouncements(updatedAnnouncements)
      localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements))
      setIsDeleting(null)
    }, 300)
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          お知らせ管理
        </h2>
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <Link href="/admin/announcements/create">
          <Button className="w-full flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新しいお知らせを作成
          </Button>
        </Link>
      </div>

      {/* Announcements List */}
      <div className="px-4 py-3">
        <h3 className="text-base font-semibold mb-3">お知らせ一覧</h3>
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>お知らせはまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border transition-all ${
                  isDeleting === announcement.id ? 'opacity-50 scale-95' : ''
                } ${
                  !announcement.isActive ? 'bg-gray-50 opacity-60' : 
                  announcement.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                  announcement.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        announcement.type === 'warning' ? 'text-amber-900' :
                        announcement.type === 'success' ? 'text-green-900' :
                        'text-blue-900'
                      }`}>
                        {announcement.title}
                      </h4>
                      {announcement.priority === 'high' && (
                        <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">
                          高優先度
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        announcement.type === 'warning' ? 'bg-amber-600 text-white' :
                        announcement.type === 'success' ? 'bg-green-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {announcement.type === 'warning' ? '警告' :
                         announcement.type === 'success' ? '成功' : '情報'}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${
                      announcement.type === 'warning' ? 'text-amber-700' :
                      announcement.type === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      作成日: {new Date(announcement.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => toggleActive(announcement.id)}
                    className="flex items-center gap-2 text-sm"
                  >
                    {announcement.isActive ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-600" />
                        <span className="text-green-600">アクティブ</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">非アクティブ</span>
                      </>
                    )}
                  </button>
                  <div className="flex-1" />
                  <Link href={`/admin/announcements/${announcement.id}/edit`}>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('このお知らせを削除してもよろしいですか？')) {
                        deleteAnnouncement(announcement.id)
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 mt-6">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">お知らせ管理について</h4>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>• アクティブなお知らせのみホームページに表示されます</li>
            <li>• 高優先度のお知らせは目立つように表示されます</li>
            <li>• 最大10件まで保存可能です</li>
          </ul>
        </div>
      </div>
    </div>
  )
}