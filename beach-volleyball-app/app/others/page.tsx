"use client"

import { useState } from "react"
import { ArrowLeft, Shield, Users, Calendar, MessageCircle, ChevronRight, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

export default function OthersPage() {
  const router = useRouter()
  const { user, isOrganizer, isAdmin } = useAuth()
  
  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      // LocalStorageをクリア
      localStorage.clear()
      // SessionStorageもクリア
      sessionStorage.clear()
      // 少し遅延を入れてからリダイレクト
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 100)
    }
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          その他
        </h2>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-2">
        {/* Admin Menu */}
        {isAdmin && (
          <>
            <Link 
              href="/admin" 
              className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">ユーザー管理</p>
                  <p className="text-xs text-muted-foreground">Admin権限</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link 
              href="/admin/events" 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-sm font-medium">イベント管理</p>
                  <p className="text-xs text-muted-foreground">全イベントの管理</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link 
              href="/admin/system" 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-sm font-medium">システム管理</p>
                  <p className="text-xs text-muted-foreground">データ管理・統計</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </>
        )}

        {/* Organizer Menu */}
        {isOrganizer && (
          <>
            <Link 
              href="/organizer" 
              className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">主催者管理</p>
                  <p className="text-xs text-muted-foreground">練習会の管理</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link 
              href="/events/create" 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-sm font-medium">練習会を作成</p>
                  <p className="text-xs text-muted-foreground">新規イベント作成</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </>
        )}

        {/* Common Menu Items */}
        <Link 
          href="/contact" 
          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-foreground" />
            <div>
              <p className="text-sm font-medium">お問い合わせ</p>
              <p className="text-xs text-muted-foreground">管理者への連絡</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        {!isOrganizer && (
          <Link 
            href="/practice-request" 
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-sm font-medium">練習作成申請</p>
                <p className="text-xs text-muted-foreground">主催者権限の申請</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-red-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-900">ログアウト</p>
              <p className="text-xs text-red-700">アカウントから離脱</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-red-400" />
        </button>
      </div>

      {/* User Info */}
      <div className="px-4 mt-6 mb-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">ログイン情報</h3>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              ユーザー名: {user?.email || 'ゲスト'}
            </p>
            <p className="text-xs text-muted-foreground">
              権限: {isAdmin ? '管理者' : isOrganizer ? '主催者' : '一般ユーザー'}
            </p>
          </div>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}