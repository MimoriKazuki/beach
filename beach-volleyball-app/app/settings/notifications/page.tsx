"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, Mail, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    pushEnabled: false,
    emailEnabled: true,
    inAppEnabled: true,
    // 通知種別
    newParticipant: true,      // 新規参加者
    eventReminder: true,        // イベントリマインダー
    eventCancellation: true,    // イベントキャンセル
    eventUpdate: true,          // イベント情報更新
  })

  useEffect(() => {
    // 保存された設定を読み込み
    const savedSettings = localStorage.getItem('notification_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // プッシュ通知の権限状態を確認
    if ('Notification' in window) {
      setSettings(prev => ({
        ...prev,
        pushEnabled: Notification.permission === 'granted'
      }))
    }
  }, [])

  const handlePushToggle = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザはプッシュ通知に対応していません')
      return
    }

    if (settings.pushEnabled) {
      // プッシュ通知を無効化
      setSettings(prev => ({ ...prev, pushEnabled: false }))
    } else {
      // プッシュ通知の権限をリクエスト
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, pushEnabled: true }))
        // テスト通知を送信
        new Notification('ビーチボールバレー コミュニティ', {
          body: 'プッシュ通知が有効になりました',
          icon: '/icon-192x192.png'
        })
      }
    }
  }

  const handleSave = () => {
    setIsLoading(true)
    
    // 設定を保存
    localStorage.setItem('notification_settings', JSON.stringify(settings))
    
    setTimeout(() => {
      setIsLoading(false)
      router.push("/settings")
    }, 500)
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          通知設定
        </h2>
      </div>

      {/* Notification Methods */}
      <div className="px-4 py-3">
        <h3 className="text-base font-medium mb-3">通知方法</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">プッシュ通知</p>
                <p className="text-xs text-muted-foreground">
                  スマートフォンに通知を送信
                </p>
              </div>
            </div>
            <button
              onClick={handlePushToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.pushEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">メール通知</p>
                <p className="text-xs text-muted-foreground">
                  登録メールアドレスに送信
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">アプリ内通知</p>
                <p className="text-xs text-muted-foreground">
                  アプリ使用中に表示
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, inAppEnabled: !prev.inAppEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.inAppEnabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.inAppEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Types */}
        <h3 className="text-base font-medium mb-3 mt-6">通知する内容</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 rounded text-primary"
              checked={settings.newParticipant}
              onChange={(e) => setSettings(prev => ({ ...prev, newParticipant: e.target.checked }))}
            />
            <div>
              <p className="text-sm font-medium">新規参加者の通知</p>
              <p className="text-xs text-muted-foreground">
                主催イベントに参加者が登録した時
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 rounded text-primary"
              checked={settings.eventReminder}
              onChange={(e) => setSettings(prev => ({ ...prev, eventReminder: e.target.checked }))}
            />
            <div>
              <p className="text-sm font-medium">イベントリマインダー</p>
              <p className="text-xs text-muted-foreground">
                参加予定イベントの前日に通知
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 rounded text-primary"
              checked={settings.eventCancellation}
              onChange={(e) => setSettings(prev => ({ ...prev, eventCancellation: e.target.checked }))}
            />
            <div>
              <p className="text-sm font-medium">イベントキャンセル</p>
              <p className="text-xs text-muted-foreground">
                参加予定イベントがキャンセルされた時
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 rounded text-primary"
              checked={settings.eventUpdate}
              onChange={(e) => setSettings(prev => ({ ...prev, eventUpdate: e.target.checked }))}
            />
            <div>
              <p className="text-sm font-medium">イベント情報更新</p>
              <p className="text-xs text-muted-foreground">
                参加予定イベントの情報が変更された時
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "保存中..." : "設定を保存"}
          </Button>
        </div>
      </div>
    </div>
  )
}