"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Key } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

export default function AdminAccessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [secretKey, setSecretKey] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // 既に管理者かチェック
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      setIsAdmin(userData.isAdmin || false)
    }
  }, [])

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // シークレットキーをチェック（実際のアプリでは環境変数などで管理）
    if (secretKey === "admin2024") {
      const demoUser = localStorage.getItem('demo_user')
      
      if (!demoUser) {
        // ログインしていない場合は、管理者アカウントを作成
        const adminUser = {
          id: 'admin-' + Date.now(),
          email: 'admin@example.com',
          name: 'システム管理者',
          isAdmin: true,
          isOrganizer: true,
          role: 'super_admin'
        }
        localStorage.setItem('demo_user', JSON.stringify(adminUser))
        
        alert("管理者アカウントでログインしました")
        // ページをリロードして認証状態を更新
        window.location.href = "/admin"
      } else {
        // 既存ユーザーに管理者権限を付与
        const userData = JSON.parse(demoUser)
        userData.isAdmin = true
        userData.isOrganizer = true
        userData.role = 'super_admin'
        localStorage.setItem('demo_user', JSON.stringify(userData))
        
        alert("管理者権限を付与しました")
        // ページをリロードして認証状態を更新
        window.location.href = "/admin"
      }
    } else {
      setError("シークレットキーが正しくありません")
    }
  }

  if (isAdmin) {
    return (
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center bg-background p-4 pb-2 justify-between">
          <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            管理者アクセス
          </h2>
        </div>

        <div className="p-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-900 mb-2">
              既に管理者権限を持っています
            </p>
            <Link href="/admin">
              <Button className="mt-4">
                管理画面へ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          管理者アクセス
        </h2>
      </div>

      <form onSubmit={handleAdminAccess} className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-amber-900">管理者権限の取得</p>
          </div>
          <p className="text-sm text-amber-800">
            システム管理者のみがアクセスできます。シークレットキーを入力してください。
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="secretKey" className="block text-sm font-medium mb-2">
            シークレットキー
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="シークレットキーを入力"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">ヒント</h3>
          <p className="text-xs text-blue-800">
            デモ環境のシークレットキー: admin2024
          </p>
        </div>

        <Button type="submit" className="w-full">
          管理者権限を取得
        </Button>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">管理者権限について</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• すべてのユーザーとイベントを管理できます</li>
            <li>• システム設定の変更が可能です</li>
            <li>• データのバックアップと復元ができます</li>
          </ul>
        </div>
      </form>
    </div>
  )
}