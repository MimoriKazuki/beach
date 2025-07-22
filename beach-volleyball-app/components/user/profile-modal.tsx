"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { SKILL_LEVELS } from "@/lib/constants/levels"

interface UserProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  name: string
  email: string
  avatar?: string
  region?: string
  skillLevel?: string
  experienceYears?: string
  team?: string
  bio?: string
}

export function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (isOpen) {
      // デモモードでは、現在のユーザー情報を表示
      // 実際の実装では、userIdを使ってユーザー情報を取得
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        const userData = JSON.parse(demoUser)
        setUserProfile({
          name: userData.name || '名無しユーザー',
          email: userData.email,
          avatar: (userData.avatar && userData.avatar !== "") ? userData.avatar : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
          region: userData.region,
          skillLevel: userData.skillLevel,
          experienceYears: userData.experienceYears,
          team: userData.team,
          bio: userData.bio
        })
      }
    }
  }, [isOpen, userId])

  if (!isOpen || !userProfile) return null

  const skillLabel = SKILL_LEVELS.find(l => l.value === userProfile.skillLevel)?.label || "未設定"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-background rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">ユーザー情報</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24">
              <Image
                src={(userProfile.avatar && userProfile.avatar !== "") ? userProfile.avatar : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"}
                alt={userProfile.name}
                fill
                className="object-cover rounded-full"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{userProfile.name}</h3>
              {userProfile.bio && (
                <p className="text-sm text-muted-foreground mt-1">{userProfile.bio}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            {userProfile.region && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">居住地</span>
                <span className="text-sm font-medium">{userProfile.region}</span>
              </div>
            )}
            
            {userProfile.skillLevel && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">レベル</span>
                <span className="text-sm font-medium">{skillLabel}</span>
              </div>
            )}
            
            {userProfile.experienceYears && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">経験年数</span>
                <span className="text-sm font-medium">{userProfile.experienceYears}年</span>
              </div>
            )}
            
            {userProfile.team && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">所属チーム</span>
                <span className="text-sm font-medium">
                  {userProfile.team === "なし" ? "所属チームなし" : userProfile.team}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}