// 会場情報の型定義

export interface Venue {
  id: string
  name: string
  address: string
  prefecture: string
  city?: string
  googleMapUrl?: string
  capacity?: number
  facilities?: string[]
  parkingAvailable?: boolean
  nearestStation?: string
  phoneNumber?: string
  website?: string
  notes?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface VenueFormData {
  name: string
  address: string
  prefecture: string
  city?: string
  googleMapUrl?: string
  capacity?: number
  facilities?: string[]
  parkingAvailable?: boolean
  nearestStation?: string
  phoneNumber?: string
  website?: string
  notes?: string
}