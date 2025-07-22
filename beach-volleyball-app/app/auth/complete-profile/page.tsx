"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SKILL_LEVELS } from "@/lib/constants/levels"
import { PREFECTURES } from "@/lib/constants/prefectures"
import { useAuth } from "@/components/providers/auth-provider"

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    prefecture: "",
    experienceYears: "",
    skillLevel: ""
  })

  useEffect(() => {
    // すでにプロフィールが完成している場合はホームへ
    if (user && user.name && user.prefecture) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // プロフィール情報を保存
    const currentUser = JSON.parse(localStorage.getItem('demo_user') || '{}')
    const updatedUser = {
      ...currentUser,
      name: formData.name,
      prefecture: formData.prefecture,
      experienceYears: formData.experienceYears,
      skillLevel: formData.skillLevel,
      profileCompleted: true
    }
    
    localStorage.setItem('demo_user', JSON.stringify(updatedUser))
    
    setTimeout(() => {
      router.push("/")
      router.refresh()
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">プロフィールを完成させましょう</h1>
          <p className="text-muted-foreground">
            あと少しで完了です！
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              お名前 <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label htmlFor="prefecture" className="block text-sm font-medium mb-2">
              都道府県 <span className="text-destructive">*</span>
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
            <label htmlFor="experienceYears" className="block text-sm font-medium mb-2">
              ビーチボールバレー経験年数
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
            <label htmlFor="skillLevel" className="block text-sm font-medium mb-2">
              レベル <span className="text-destructive">*</span>
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中..." : "プロフィールを保存"}
          </Button>
        </form>
      </div>
    </div>
  )
}