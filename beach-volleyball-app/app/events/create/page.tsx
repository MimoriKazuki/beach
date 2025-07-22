"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarIcon, Upload, Image as ImageIcon } from "lucide-react"
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
import { BottomNavigation } from "@/components/layout/bottom-navigation"

export default function CreateEventPage() {
  const router = useRouter()
  const { isOrganizer, loading: authLoading, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [startTimePopoverOpen, setStartTimePopoverOpen] = useState(false)
  const [endTimePopoverOpen, setEndTimePopoverOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    prefecture: "",
    maxParticipants: "",
    entryFee: "",
    beginnerFriendly: false,
    practiceType: "",
    description: "",
    recurring: false,
    recurringFrequency: "weekly",
    recurringDays: [] as string[],
    recurringEndDate: ""
  })

  const venueSuggestions = formData.prefecture ? VENUES_BY_PREFECTURE[formData.prefecture] || [] : []

  // useEffectで権限チェックを行う
  useEffect(() => {
    // ローディング中は何もしない
    if (authLoading) return
    
    // デバッグ用のログ
    console.log('CreateEventPage - Auth check:', {
      user,
      isOrganizer,
      authLoading,
      demoUser: localStorage.getItem('demo_user')
    })
    
    // ユーザー情報を直接チェック
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      // canCreateEvents、isOrganizer、isAdmin、roleのいずれかをチェック
      if (!userData.canCreateEvents && !userData.isOrganizer && !userData.isAdmin && userData.role !== 'admin' && userData.role !== 'super_admin') {
        console.log('No permission to create events, redirecting...')
        router.push("/")
      }
    } else if (!isOrganizer) {
      console.log('Not an organizer, redirecting...')
      router.push("/")
    }
  }, [isOrganizer, router, authLoading, user])

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

      // イベントを作成（空文字列を除外）
      const eventData = {
        name: formData.name,
        type: 'practice' as const,
        event_date: formData.eventDate,
        start_time: formData.startTime || "19:00",
        ...(formData.endTime && { end_time: formData.endTime }), // 空文字列の場合は含めない
        venue: formData.venue,
        prefecture: formData.prefecture,
        ...(formData.description && { description: formData.description }),
        image_url: imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
        max_participants: parseInt(formData.maxParticipants) || 20,
        entry_fee: parseInt(formData.entryFee) || 500,
        beginner_friendly: formData.beginnerFriendly,
        skill_level: formData.practiceType || null,
        recurring: formData.recurring,
        ...(formData.recurring && {
          recurring_frequency: formData.recurringFrequency as 'weekly' | 'biweekly' | 'monthly',
          ...(formData.recurringDays.length > 0 && { recurring_days: formData.recurringDays }),
          ...(formData.recurringEndDate && { recurring_end_date: formData.recurringEndDate })
        })
      }

      const result = await createEvent(eventData)
      console.log("Event creation result:", result)
      
      // イベントが作成された場合（IDがある場合）は成功とみなす
      if (result && result.id) {
        alert("練習会を作成しました！")
        router.push("/events")
      } else {
        throw new Error("イベント作成に失敗しました")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      alert("エラーが発生しました。もう一度お試しください。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/events" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          練習会を作成
        </h2>
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            イベント画像
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {imagePreview ? (
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
                    setDatePopoverOpen(false)
                  }
                  setDatePopoverOpen(false)
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                locale={ja}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              開始時間 <span className="text-red-500">*</span>
            </label>
            <Popover open={startTimePopoverOpen} onOpenChange={setStartTimePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startTime && "text-muted-foreground"
                  )}
                >
                  {formData.startTime || "時間を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">開始時間を選択</p>
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">時</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md text-center"
                          value={formData.startTime ? formData.startTime.split(':')[0] : ''}
                          onChange={(e) => {
                            const hour = e.target.value
                            const minute = formData.startTime ? formData.startTime.split(':')[1] : '00'
                            setFormData({...formData, startTime: `${hour}:${minute}`})
                          }}
                        >
                          <option value="">-</option>
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>
                              {i}時
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-lg font-medium">:</span>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">分</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md text-center"
                          value={formData.startTime ? formData.startTime.split(':')[1] : ''}
                          onChange={(e) => {
                            const hour = formData.startTime ? formData.startTime.split(':')[0] : '19'
                            const minute = e.target.value
                            setFormData({...formData, startTime: `${hour}:${minute}`})
                          }}
                        >
                          <option value="">-</option>
                          {['00', '15', '30', '45'].map(min => (
                            <option key={min} value={min}>{min}分</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setStartTimePopoverOpen(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (formData.startTime && formData.startTime.includes(':')) {
                          setStartTimePopoverOpen(false)
                        }
                      }}
                      disabled={!formData.startTime || !formData.startTime.includes(':')}
                    >
                      決定
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              終了時間
            </label>
            <Popover open={endTimePopoverOpen} onOpenChange={setEndTimePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endTime && "text-muted-foreground"
                  )}
                >
                  {formData.endTime || "時間を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">終了時間を選択</p>
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">時</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md text-center"
                          value={formData.endTime ? formData.endTime.split(':')[0] : ''}
                          onChange={(e) => {
                            const hour = e.target.value
                            const minute = formData.endTime ? formData.endTime.split(':')[1] : '00'
                            setFormData({...formData, endTime: `${hour}:${minute}`})
                          }}
                        >
                          <option value="">-</option>
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>
                              {i}時
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-lg font-medium">:</span>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">分</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md text-center"
                          value={formData.endTime ? formData.endTime.split(':')[1] : ''}
                          onChange={(e) => {
                            const hour = formData.endTime ? formData.endTime.split(':')[0] : '21'
                            const minute = e.target.value
                            setFormData({...formData, endTime: `${hour}:${minute}`})
                          }}
                        >
                          <option value="">-</option>
                          {['00', '15', '30', '45'].map(min => (
                            <option key={min} value={min}>{min}分</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEndTimePopoverOpen(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (formData.endTime && formData.endTime.includes(':')) {
                          setEndTimePopoverOpen(false)
                        }
                      }}
                      disabled={!formData.endTime || !formData.endTime.includes(':')}
                    >
                      決定
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
          {formData.prefecture && venueSuggestions.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formData.prefecture}の主な会場から選択できます
            </p>
          )}
        </div>

        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium mb-2">
            最大参加人数
          </label>
          <input
            id="maxParticipants"
            type="number"
            min="1"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
          />
        </div>

        <div>
          <label htmlFor="entryFee" className="block text-sm font-medium mb-2">
            参加費（円）
          </label>
          <input
            id="entryFee"
            type="number"
            min="0"
            placeholder="無料の場合は0"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.entryFee}
            onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
          />
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
          <label htmlFor="practiceType" className="block text-sm font-medium mb-2">
            練習タイプ
          </label>
          <select
            id="practiceType"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.practiceType}
            onChange={(e) => setFormData({...formData, practiceType: e.target.value})}
          >
            <option value="">選択してください</option>
            <option value="チーム練習">チーム練習</option>
            <option value="バラ練習">バラ練習</option>
            <option value="合同練習">合同練習</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            説明・備考
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="練習内容、持ち物、注意事項など"
          />
        </div>

        {/* 定期開催設定 */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.recurring}
              onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
            />
            <label htmlFor="recurring" className="text-sm font-medium">
              定期開催する
            </label>
          </div>

          {formData.recurring && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  開催頻度
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.recurringFrequency}
                  onChange={(e) => setFormData({...formData, recurringFrequency: e.target.value})}
                >
                  <option value="weekly">毎週</option>
                  <option value="biweekly">隔週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>

              {formData.recurringFrequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    開催曜日
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                      <label key={day} className="flex flex-col items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={formData.recurringDays.includes(String(index))}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...formData.recurringDays, String(index)]
                              : formData.recurringDays.filter(d => d !== String(index))
                            setFormData({...formData, recurringDays: days})
                          }}
                        />
                        <span className="text-xs mt-1">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="recurringEndDate" className="block text-sm font-medium mb-2">
                  終了日（任意）
                </label>
                <input
                  type="date"
                  id="recurringEndDate"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.recurringEndDate}
                  onChange={(e) => setFormData({...formData, recurringEndDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          )}
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
            onClick={() => router.push("/events")}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
    <BottomNavigation />
    </>
  )
}