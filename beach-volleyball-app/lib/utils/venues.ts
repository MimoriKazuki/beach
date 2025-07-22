// 会場管理のユーティリティ関数

import { Venue, VenueFormData } from '@/lib/types/venue'

const VENUES_STORAGE_KEY = 'venues'

// すべての会場を取得
export function getAllVenues(): Venue[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(VENUES_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

// アクティブな会場のみ取得
export function getActiveVenues(): Venue[] {
  return getAllVenues().filter(venue => venue.isActive)
}

// 都道府県で会場を取得
export function getVenuesByPrefecture(prefecture: string): Venue[] {
  return getActiveVenues().filter(venue => venue.prefecture === prefecture)
}

// 会場をIDで取得
export function getVenueById(id: string): Venue | null {
  const venues = getAllVenues()
  return venues.find(venue => venue.id === id) || null
}

// 会場を作成
export function createVenue(data: VenueFormData): Venue {
  const venues = getAllVenues()
  
  const newVenue: Venue = {
    ...data,
    id: `venue_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
  
  venues.push(newVenue)
  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(venues))
  
  return newVenue
}

// 会場を更新
export function updateVenue(id: string, data: Partial<VenueFormData>): Venue | null {
  const venues = getAllVenues()
  const index = venues.findIndex(venue => venue.id === id)
  
  if (index === -1) return null
  
  venues[index] = {
    ...venues[index],
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(venues))
  
  return venues[index]
}

// 会場を削除（論理削除）
export function deleteVenue(id: string): boolean {
  const venues = getAllVenues()
  const index = venues.findIndex(venue => venue.id === id)
  
  if (index === -1) return false
  
  venues[index] = {
    ...venues[index],
    isActive: false,
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(venues))
  
  return true
}

// 会場を物理削除
export function permanentlyDeleteVenue(id: string): boolean {
  const venues = getAllVenues()
  const filteredVenues = venues.filter(venue => venue.id !== id)
  
  if (venues.length === filteredVenues.length) return false
  
  localStorage.setItem(VENUES_STORAGE_KEY, JSON.stringify(filteredVenues))
  
  return true
}

// デフォルトの会場データを初期化
export function initializeDefaultVenues(): void {
  const existingVenues = getAllVenues()
  if (existingVenues.length > 0) return
  
  const defaultVenues: VenueFormData[] = [
    {
      name: '大宮市民体育館',
      address: '埼玉県さいたま市大宮区高鼻町4',
      prefecture: '埼玉県',
      city: 'さいたま市',
      capacity: 500,
      facilities: ['更衣室', 'シャワー', '駐車場', '自動販売機'],
      parkingAvailable: true,
      nearestStation: 'JR大宮駅から徒歩20分'
    },
    {
      name: '川越第二体育館',
      address: '埼玉県川越市郭町2-30-1',
      prefecture: '埼玉県',
      city: '川越市',
      capacity: 300,
      facilities: ['更衣室', '駐車場'],
      parkingAvailable: true,
      nearestStation: '西武新宿線本川越駅から徒歩15分'
    },
    {
      name: '東京体育館',
      address: '東京都渋谷区千駄ヶ谷1-17-1',
      prefecture: '東京都',
      city: '渋谷区',
      capacity: 1000,
      facilities: ['更衣室', 'シャワー', '売店', 'レストラン'],
      parkingAvailable: true,
      nearestStation: 'JR千駄ヶ谷駅から徒歩1分',
      phoneNumber: '03-5474-1111',
      website: 'https://www.tef.or.jp/tmg/'
    },
    {
      name: '浦和スポーツセンター',
      address: '埼玉県さいたま市浦和区元町1-29-10',
      prefecture: '埼玉県',
      city: 'さいたま市',
      capacity: 400,
      facilities: ['更衣室', 'シャワー', '駐車場'],
      parkingAvailable: true,
      nearestStation: 'JR浦和駅から徒歩10分'
    },
    {
      name: '横浜武道館',
      address: '神奈川県横浜市中区翁町2-9-10',
      prefecture: '神奈川県',
      city: '横浜市',
      capacity: 800,
      facilities: ['更衣室', 'シャワー', '売店', '駐車場'],
      parkingAvailable: true,
      nearestStation: 'JR関内駅から徒歩6分',
      website: 'https://yokohama-budoukan.jp/'
    },
    {
      name: '世田谷スポーツセンター',
      address: '東京都世田谷区大蔵4-6-1',
      prefecture: '東京都',
      city: '世田谷区',
      capacity: 600,
      facilities: ['更衣室', 'シャワー', '駐車場', '自動販売機'],
      parkingAvailable: true,
      nearestStation: '小田急線祖師ヶ谷大蔵駅から徒歩20分'
    }
  ]
  
  defaultVenues.forEach(venue => createVenue(venue))
}