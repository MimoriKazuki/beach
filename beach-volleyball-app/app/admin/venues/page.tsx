"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, MapPin, Edit, Trash2, Search, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { LoadingSpinner } from "@/components/ui/spinner"
import { getAllVenues, deleteVenue, initializeDefaultVenues } from "@/lib/utils/venues"
import { Venue } from "@/lib/types/venue"
import { cn } from "@/lib/utils"

export default function AdminVenuesPage() {
  const router = useRouter()
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("")

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

    // デフォルト会場を初期化
    initializeDefaultVenues()
    
    // 会場一覧を読み込み
    loadVenues()
  }, [router])

  const loadVenues = () => {
    setIsLoading(true)
    const allVenues = getAllVenues()
    setVenues(allVenues)
    setIsLoading(false)
  }

  const handleDelete = async (venueId: string) => {
    if (!confirm('この会場を削除しますか？')) return
    
    deleteVenue(venueId)
    loadVenues()
  }

  // フィルタリング
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = searchTerm === "" || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPrefecture = selectedPrefecture === "" || venue.prefecture === selectedPrefecture
    
    return matchesSearch && matchesPrefecture
  })

  // 都道府県リスト
  const prefectures = Array.from(new Set(venues.map(v => v.prefecture))).sort()

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
        <Link href="/admin" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          会場管理
        </h2>
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <Link href="/admin/venues/create">
          <Button className="w-full" size="lg">
            <Plus className="h-5 w-5 mr-2" />
            新規会場を追加
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="会場名、住所で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        
        <select
          value={selectedPrefecture}
          onChange={(e) => setSelectedPrefecture(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">すべての都道府県</option>
          {prefectures.map(pref => (
            <option key={pref} value={pref}>{pref}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">登録会場数</span>
            </div>
            <span className="text-lg font-bold">{venues.filter(v => v.isActive).length}件</span>
          </div>
        </div>
      </div>

      {/* Venue List */}
      <div className="px-4 space-y-3">
        {filteredVenues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            該当する会場がありません
          </div>
        ) : (
          filteredVenues.map((venue) => (
            <div 
              key={venue.id} 
              className={cn(
                "bg-card rounded-lg p-4 border",
                !venue.isActive && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    {venue.name}
                    {!venue.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        削除済み
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {venue.prefecture} {venue.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {venue.address}
                    </p>
                    {venue.capacity && (
                      <p className="text-xs text-muted-foreground">
                        収容人数: {venue.capacity}名
                      </p>
                    )}
                    {venue.facilities && venue.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {venue.facilities.map((facility, index) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {venue.isActive && (
                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/venues/${venue.id}/edit`}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(venue.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}