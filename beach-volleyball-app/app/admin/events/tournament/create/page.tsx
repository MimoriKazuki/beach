"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, Trophy, Upload } from "lucide-react"
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
import { createEvent, uploadEventImage } from "@/lib/supabase/events"
import Image from "next/image"

export default function CreateTournamentPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
    rules: "ラリーポイント制",
    description: "",
    beginnerFriendly: false,
    prizes: {
      first: "",
      second: "",
      third: ""
    }
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 画像をSupabaseにアップロード
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadEventImage(imageFile)
      }

      // イベントを作成
      const eventData = {
        name: formData.name,
        type: 'tournament' as const,
        event_date: formData.eventDate,
        start_time: formData.startTime || "大会要項をご確認ください",
        end_time: formData.endTime,
        venue: formData.venue,
        prefecture: formData.prefecture,
        description: formData.description,
        image_url: imageUrl || "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
        max_participants: parseInt(formData.maxParticipants) || 32,
        entry_fee: parseInt(formData.entryFee) || 3000,
        beginner_friendly: formData.beginnerFriendly,
        rules: formData.rules,
        prizes: formData.prizes
      }

      await createEvent(eventData)
      
      setIsLoading(false)
      alert("大会を作成しました！")
      router.push("/events")
    } catch (error) {
      console.error("Error creating tournament:", error)
      setIsLoading(false)
      alert("エラーが発生しました。もう一度お試しください。")
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
          大会を作成
        </h2>
      </div>

      {/* Admin Badge */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <Trophy className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium">管理者として大会を作成</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            大会名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="例: 春季ビーチボールバレー大会"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            大会画像
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {(imagePreview && imagePreview !== "") ? (
              <div className="relative w-full h-48">
                <Image
                  src={imagePreview}
                  alt="プレビュー"
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label htmlFor="image" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center py-8">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">画像をアップロード</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG (最大5MB)</p>
                </div>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
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

        <div className="bg-muted/50 rounded-lg p-4">
          <label htmlFor="startTime" className="block text-sm font-medium mb-2">
            開始時間（任意）
          </label>
          <input
            id="startTime"
            type="time"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
          <p className="text-xs text-muted-foreground mt-2">
            ※ 時間が未定の場合は、大会要項をご確認ください
          </p>
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
          <label htmlFor="rules" className="block text-sm font-medium mb-2">
            ルール
          </label>
          <select
            id="rules"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.rules}
            onChange={(e) => setFormData({...formData, rules: e.target.value})}
          >
            <option value="ラリーポイント制">ラリーポイント制</option>
            <option value="サイドアウト制">サイドアウト制</option>
            <option value="特別ルール">特別ルール</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2">
            最大参加チーム数 <span className="text-red-500">*</span>
          </label>
          <input
            id="maxParticipants"
            type="number"
            min="4"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
            placeholder="例: 32"
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
            placeholder="例: 3000"
          />
        </div>

        {/* 賞品設定 */}
        <div>
          <label className="block text-sm font-medium mb-2">賞品・賞金</label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="優勝賞品"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.prizes.first}
              onChange={(e) => setFormData({...formData, prizes: {...formData.prizes, first: e.target.value}})}
            />
            <input
              type="text"
              placeholder="準優勝賞品"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.prizes.second}
              onChange={(e) => setFormData({...formData, prizes: {...formData.prizes, second: e.target.value}})}
            />
            <input
              type="text"
              placeholder="3位賞品"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.prizes.third}
              onChange={(e) => setFormData({...formData, prizes: {...formData.prizes, third: e.target.value}})}
            />
          </div>
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
            大会説明・備考
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="大会の詳細、注意事項、持ち物など"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "作成中..." : "大会を作成"}
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