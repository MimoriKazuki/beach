"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { REGIONS } from "@/lib/constants/regions"
import { SKILL_LEVELS } from "@/lib/constants/levels"
import Image from "next/image"

export default function ProfileEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop")
  const [hasNoTeam, setHasNoTeam] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    region: "",
    skillLevel: "",
    experienceYears: "",
    bio: "",
    isOrganizer: false,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    team: ""
  })

  useEffect(() => {
    // デモユーザー情報を読み込み
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        region: userData.region || "",
        skillLevel: userData.skillLevel || "",
        experienceYears: userData.experienceYears || "",
        bio: userData.bio || "ビーチボールバレー愛好家",
        isOrganizer: userData.isOrganizer || false,
        avatar: (userData.avatar && userData.avatar !== "") ? userData.avatar : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
        team: userData.team || ""
      })
      setAvatarPreview((userData.avatar && userData.avatar !== "") ? userData.avatar : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop")
      setHasNoTeam(userData.team === "なし" || !userData.team)
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（5MBまで）
      if (file.size > 5 * 1024 * 1024) {
        alert('画像サイズは5MB以下にしてください')
        return
      }

      // プレビュー用にData URLを作成
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setFormData({...formData, avatar: result})
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // デモモードでローカルストレージに保存
    const userData = {
      email: formData.email,
      name: formData.name,
      region: formData.region,
      skillLevel: formData.skillLevel,
      experienceYears: formData.experienceYears,
      bio: formData.bio,
      isOrganizer: formData.isOrganizer,
      avatar: (formData.avatar && formData.avatar !== "") ? formData.avatar : avatarPreview,
      team: hasNoTeam ? "なし" : formData.team
    }
    localStorage.setItem('demo_user', JSON.stringify(userData))

    setTimeout(() => {
      setIsLoading(false)
      router.push("/profile")
    }, 500)
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/profile" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          プロフィール編集
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* プロフィール画像 */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              {(avatarPreview && avatarPreview !== "") ? (
                <Image
                  src={avatarPreview}
                  alt="プロフィール画像"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">タップして画像を変更</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            お名前
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
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium mb-2">
            居住地（地域）
          </label>
          <select
            id="region"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.region}
            onChange={(e) => setFormData({...formData, region: e.target.value})}
          >
            <option value="">選択してください</option>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="skillLevel" className="block text-sm font-medium mb-2">
            レベル
          </label>
          <select
            id="skillLevel"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.skillLevel}
            onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
          >
            <option value="">選択してください</option>
            {SKILL_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="experienceYears" className="block text-sm font-medium mb-2">
            ビーチバレー経験年数
          </label>
          <div className="flex items-center gap-2">
            <input
              id="experienceYears"
              type="number"
              min="0"
              max="50"
              className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.experienceYears}
              onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
              placeholder="0"
            />
            <span className="text-sm">年</span>
          </div>
        </div>

        <div>
          <label htmlFor="team" className="block text-sm font-medium mb-2">
            所属チーム
          </label>
          <div className="space-y-2">
            <input
              id="team"
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
              value={formData.team}
              onChange={(e) => setFormData({...formData, team: e.target.value})}
              placeholder="チーム名を入力"
              disabled={hasNoTeam}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noTeam"
                checked={hasNoTeam}
                onChange={(e) => {
                  setHasNoTeam(e.target.checked)
                  if (e.target.checked) {
                    setFormData({...formData, team: ""})
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="noTeam" className="text-sm">
                所属チームなし
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            自己紹介
          </label>
          <textarea
            id="bio"
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>


        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "保存中..." : "保存する"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/profile")}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}