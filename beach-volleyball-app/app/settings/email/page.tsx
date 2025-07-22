"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function EmailSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentEmail: "",
    newEmail: "",
    confirmEmail: ""
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // デモユーザーの情報を読み込み
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      setFormData(prev => ({
        ...prev,
        currentEmail: userData.email || ""
      }))
    } else if (user?.email) {
      setFormData(prev => ({
        ...prev,
        currentEmail: user.email || ""
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.newEmail !== formData.confirmEmail) {
      setError("新しいメールアドレスが一致しません")
      setIsLoading(false)
      return
    }

    // デモモードでの更新
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      userData.email = formData.newEmail
      localStorage.setItem('demo_user', JSON.stringify(userData))
    }

    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => {
        router.push("/settings")
      }, 1500)
    }, 1000)
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          メールアドレス変更
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label htmlFor="currentEmail" className="block text-sm font-medium mb-2">
            現在のメールアドレス
          </label>
          <input
            id="currentEmail"
            type="email"
            disabled
            className="w-full px-3 py-2 border rounded-md bg-muted/50"
            value={formData.currentEmail}
          />
        </div>

        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium mb-2">
            新しいメールアドレス
          </label>
          <input
            id="newEmail"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.newEmail}
            onChange={(e) => setFormData({...formData, newEmail: e.target.value})}
          />
        </div>

        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium mb-2">
            新しいメールアドレス（確認）
          </label>
          <input
            id="confirmEmail"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.confirmEmail}
            onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm">
            メールアドレスを変更しました
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading || success}
          >
            {isLoading ? "変更中..." : "変更する"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings")}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}