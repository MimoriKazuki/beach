"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, LogOut, Mail, Bell, Shield, Info, UserCog, MessageCircle, FileText, Key, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // デモモードの場合
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
        // LocalStorageをクリア
        localStorage.clear()
        // SessionStorageもクリア
        sessionStorage.clear()
      } else {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
      
      // 少し遅延を入れてからリダイレクト
      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const settingsItems = [
    {
      icon: Mail,
      label: "メールアドレス変更",
      href: "/settings/email",
      description: "ログイン用のメールアドレスを変更"
    },
    {
      icon: Bell,
      label: "通知設定",
      href: "/settings/notifications",
      description: "通知の受け取り方法を設定"
    },
    {
      icon: Shield,
      label: "プライバシー設定",
      href: "/settings/privacy",
      description: "プロフィールの公開範囲を設定"
    },
    {
      icon: MessageCircle,
      label: "お問い合わせ",
      href: "/settings/contact",
      description: "管理者へのお問い合わせ"
    },
    {
      icon: FileText,
      label: "練習作成申請",
      href: "/settings/practice-request",
      description: "練習会主催の権限申請"
    },
    {
      icon: Info,
      label: "アプリについて",
      href: "/settings/about",
      description: "バージョン情報・利用規約"
    }
  ]

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/profile" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          設定
        </h2>
      </div>

      {/* Settings List */}
      <div className="px-4 py-3">
        {/* Admin Section - 管理者のみ表示 */}
        {isAdmin && (
          <>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">管理者メニュー</h3>
            <Link
              href="/admin"
              className="flex items-center justify-between p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground text-base font-medium">
                    システム管理
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Super Admin専用
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="border-b mb-4" />
          </>
        )}
        
        {/* Organizer Section - 主催者のみ表示 */}
        {user && (() => {
          const demoUser = localStorage.getItem('demo_user')
          const userData = demoUser ? JSON.parse(demoUser) : null
          return userData?.isOrganizer || userData?.isAdmin
        })() && (
          <>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">主催者メニュー</h3>
            <Link
              href="/organizer"
              className="flex items-center justify-between p-4 bg-green-600/10 rounded-lg hover:bg-green-600/20 transition-colors mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-foreground text-base font-medium">
                    練習会管理
                  </p>
                  <p className="text-muted-foreground text-sm">
                    練習会の作成・管理
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div className="border-b mb-4" />
          </>
        )}
        
        <div className="space-y-2">
          {settingsItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-base font-medium">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "ログアウト中..." : "ログアウト"}
          </Button>
        </div>

        {/* Admin Access - 開発者向け */}
        <div className="mt-8 border-t pt-6">
          <Link
            href="/settings/admin-access"
            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-muted"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600/10 rounded-full flex items-center justify-center">
                <Key className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-foreground text-base font-medium">
                  管理者アクセス
                </p>
                <p className="text-muted-foreground text-sm">
                  システム管理者用
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            ビーチボールバレー コミュニティ
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}