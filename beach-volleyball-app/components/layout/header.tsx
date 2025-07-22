"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { User } from "lucide-react"
import Image from "next/image"

interface HeaderProps {
  title?: string
  showSettings?: boolean
}

export function Header({ title = "ビーチボールバレー", showSettings = true }: HeaderProps) {
  const { user } = useAuth()
  
  // デモユーザー情報を取得してアバターを表示
  const getDemoUserAvatar = () => {
    if (typeof window === 'undefined') {
      return null
    }
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      const userData = JSON.parse(demoUser)
      return userData.avatar
    }
    return null
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background">
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <div className="w-12" />
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {title}
        </h2>
        <div className="flex w-12 items-center justify-end">
          {user && showSettings ? (
            <Link href="/profile">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                {getDemoUserAvatar() ? (
                  <Image
                    src={getDemoUserAvatar()}
                    alt="ユーザーアイコン"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
            </Link>
          ) : (
            !user && showSettings && (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  ログイン
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  )
}