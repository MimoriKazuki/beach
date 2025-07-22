"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { PREFECTURES } from "@/lib/constants/prefectures"
import { VENUES_BY_PREFECTURE } from "@/lib/constants/venues"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function CreatePracticePage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    prefecture: "",
    maxParticipants: "",
    entryFee: "",
    skillLevel: "all",
    description: "",
    beginnerFriendly: true,
    recurring: false,
    recurringType: "weekly"
  })

  // useEffectで権限チェックを行う
  useEffect(() => {
    // ローディング中は何もしない
    if (authLoading) return
    
    // 管理者権限チェック
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      if (!userData.isAdmin && userData.role !== 'admin' && userData.role !== 'super_admin') {
        router.push("/admin")
      }
    } else if (!isAdmin) {
      router.push("/admin")
    }
  }, [isAdmin, router, authLoading])

  // ローディング中は何も表示しない
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  const venueSuggestions = formData.prefecture ? VENUES_BY_PREFECTURE[formData.prefecture] || [] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 現在のユーザー情報を取得
      const demoUser = localStorage.getItem('demo_user')
      if (!demoUser) {
        alert('ログインしてください')
        setIsLoading(false)
        return
      }
      
      const userData = JSON.parse(demoUser)
      
      // イベントデータを作成
      const newEvent = {
        id: `practice_${Date.now()}`,
        name: formData.name,
        type: 'practice',
        event_date: formData.eventDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        venue: formData.venue,
        venue_other: formData.venue,
        prefecture: formData.prefecture,
        max_participants: parseInt(formData.maxParticipants) || 20,
        entry_fee: parseInt(formData.entryFee) || 0,
        beginner_friendly: formData.beginnerFriendly,
        skill_level: formData.skillLevel,
        description: formData.description,
        recurring: formData.recurring,
        recurringType: formData.recurringType,
        creator_id: userData.id || userData.email,
        creator_name: userData.name || userData.email,
        created_at: new Date().toISOString(),
        participants_count: 0,
        status: 'recruiting'
      }
      
      // 既存のイベントを取得
      const existingEvents = localStorage.getItem('created_events')
      const events = existingEvents ? JSON.parse(existingEvents) : []
      
      // 新しいイベントを追加
      events.push(newEvent)
      
      // 保存
      localStorage.setItem('created_events', JSON.stringify(events))
      
      console.log("練習会を作成しました:", newEvent)
      
      setTimeout(() => {
        setIsLoading(false)
        router.push("/admin/events")
      }, 500)
    } catch (error) {
      console.error('練習会作成エラー:', error)
      alert('練習会の作成に失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          練習会を作成
        </h2>
      </div>

      {/* Admin Badge */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <Users className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium">管理者として練習会を作成</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            練習会名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="例: 水曜夜練習会"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            開催日 <span className="text-red-500">*</span>
          </label>
          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate)
                  if (newDate) {
                    setFormData({...formData, eventDate: format(newDate, "yyyy-MM-dd")})
                  }
                  setDatePopoverOpen(false)
                }}
                locale={ja}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium mb-2">
              開始時間 <span className="text-red-500">*</span>
            </label>
            <input
              id="startTime"
              type="time"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium mb-2">
              終了時間
            </label>
            <input
              id="endTime"
              type="time"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label htmlFor="prefecture" className="block text-sm font-medium mb-2">
            都道府県 <span className="text-red-500">*</span>
          </label>
          <select
            id="prefecture"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.prefecture}
            onChange={(e) => setFormData({...formData, prefecture: e.target.value})}
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium mb-2">
            会場名 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="venue"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              onFocus={() => setShowVenueSuggestions(true)}
              onBlur={() => setTimeout(() => setShowVenueSuggestions(false), 200)}
              placeholder={formData.prefecture ? `${formData.prefecture}の会場名を入力` : "都道府県を選択してから会場名を入力"}
            />
            {showVenueSuggestions && venueSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                {venueSuggestions.map((venue) => (
                  <button
                    key={venue}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                    onClick={() => {
                      setFormData({...formData, venue})
                      setShowVenueSuggestions(false)
                    }}
                  >
                    {venue}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="skillLevel" className="block text-sm font-medium mb-2">
            対象レベル
          </label>
          <select
            id="skillLevel"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.skillLevel}
            onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
          >
            <option value="all">全レベル</option>
            <option value="beginner">初心者向け</option>
            <option value="intermediate">中級者向け</option>
            <option value="advanced">上級者向け</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2">
            最大参加人数 <span className="text-red-500">*</span>
          </label>
          <input
            id="maxParticipants"
            type="number"
            min="4"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
            placeholder="例: 20"
          />
        </div>

        <div>
          <label htmlFor="entryFee" className="block text-sm font-medium mb-2">
            参加費（円） <span className="text-red-500">*</span>
          </label>
          <input
            id="entryFee"
            type="number"
            min="0"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.entryFee}
            onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
            placeholder="例: 500"
          />
        </div>

        {/* 定期開催設定 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.recurring}
              onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
            />
            <label htmlFor="recurring" className="text-sm font-medium">
              定期開催
            </label>
          </div>

          {formData.recurring && (
            <div>
              <label htmlFor="recurringType" className="block text-sm font-medium mb-2">
                開催頻度
              </label>
              <select
                id="recurringType"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.recurringType}
                onChange={(e) => setFormData({...formData, recurringType: e.target.value})}
              >
                <option value="weekly">毎週</option>
                <option value="biweekly">隔週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="beginnerFriendly"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={formData.beginnerFriendly}
            onChange={(e) => setFormData({...formData, beginnerFriendly: e.target.checked})}
          />
          <label htmlFor="beginnerFriendly" className="text-sm font-medium">
            初心者参加可能
          </label>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            練習内容・備考
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="練習メニュー、持ち物、注意事項など"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "作成中..." : "練習会を作成"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin")}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}