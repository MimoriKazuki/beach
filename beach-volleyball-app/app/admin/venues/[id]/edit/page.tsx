"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { LoadingSpinner } from "@/components/ui/spinner"
import { getVenueById, updateVenue } from "@/lib/utils/venues"
import { VenueFormData } from "@/lib/types/venue"
import { PREFECTURES } from "@/lib/constants/prefectures"

const FACILITY_OPTIONS = [
  '更衣室',
  'シャワー',
  '駐車場',
  '自動販売機',
  '売店',
  'レストラン',
  'トイレ（多目的）',
  '冷暖房完備',
  'WiFi',
  'ロッカー'
]

export default function EditVenuePage() {
  const params = useParams()
  const router = useRouter()
  const venueId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    address: '',
    prefecture: '',
    city: '',
    googleMapUrl: '',
    capacity: undefined,
    facilities: [],
    parkingAvailable: false,
    nearestStation: '',
    phoneNumber: '',
    website: '',
    notes: ''
  })

  useEffect(() => {
    // 管理者権限をチェック
    const demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      router.push("/")
      return
    }
    
    const userData = JSON.parse(demoUser)
    if (!userData.isAdmin && userData.role !== 'admin' && userData.role !== 'super_admin') {
      router.push("/")
      return
    }

    // 会場情報を読み込み
    const venue = getVenueById(venueId)
    if (!venue) {
      router.push('/admin/venues')
      return
    }

    setFormData({
      name: venue.name,
      address: venue.address,
      prefecture: venue.prefecture,
      city: venue.city || '',
      googleMapUrl: venue.googleMapUrl || '',
      capacity: venue.capacity,
      facilities: venue.facilities || [],
      parkingAvailable: venue.parkingAvailable || false,
      nearestStation: venue.nearestStation || '',
      phoneNumber: venue.phoneNumber || '',
      website: venue.website || '',
      notes: venue.notes || ''
    })
    
    setIsLoading(false)
  }, [venueId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address || !formData.prefecture) {
      alert('会場名、住所、都道府県は必須項目です')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      updateVenue(venueId, formData)
      router.push('/admin/venues')
    } catch (error) {
      console.error('Error updating venue:', error)
      alert('会場の更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities?.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...(prev.facilities || []), facility]
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/admin/venues" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          会場を編集
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base">基本情報</h3>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              会場名 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="例: 東京体育館"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              都道府県 <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.prefecture}
              onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              required
            >
              <option value="">選択してください</option>
              {PREFECTURES.map(pref => (
                <option key={pref} value={pref}>{pref}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              市区町村
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="例: 渋谷区"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              住所 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="例: 東京都渋谷区千駄ヶ谷1-17-1"
              required
            />
          </div>
        </div>

        {/* Facility Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base">施設情報</h3>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              収容人数
            </label>
            <input
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="例: 500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              設備
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {FACILITY_OPTIONS.map(facility => (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.facilities?.includes(facility)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.parkingAvailable}
                onChange={(e) => setFormData({ ...formData, parkingAvailable: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">駐車場あり</span>
            </label>
          </div>
        </div>

        {/* Access Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base">アクセス情報</h3>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              最寄り駅
            </label>
            <input
              type="text"
              value={formData.nearestStation}
              onChange={(e) => setFormData({ ...formData, nearestStation: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="例: JR千駄ヶ谷駅から徒歩1分"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Google Map URL
            </label>
            <input
              type="url"
              value={formData.googleMapUrl}
              onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base">連絡先情報</h3>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              電話番号
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="例: 03-1234-5678"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              ウェブサイト
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            備考
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded-lg bg-background"
            rows={4}
            placeholder="その他の情報があれば記入してください"
          />
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-20 bg-background pt-4">
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>処理中...</>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                変更を保存
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
    <BottomNavigation />
    </>
  )
}