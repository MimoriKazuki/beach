"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, EyeOff, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"

interface PrivacySettings {
  hideFromParticipants: boolean
}

export default function PrivacySettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<PrivacySettings>({
    hideFromParticipants: false
  })

  useEffect(() => {
    // Load privacy settings from localStorage
    const savedSettings = localStorage.getItem('privacy_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    
    // Save to localStorage
    localStorage.setItem('privacy_settings', JSON.stringify(settings))
    
    setTimeout(() => {
      setIsLoading(false)
      router.push("/settings")
    }, 500)
  }

  return (
    <>
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between">
        <Link href="/settings" className="text-foreground flex size-12 shrink-0 items-center">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          プライバシー設定
        </h2>
      </div>

      {/* Settings */}
      <div className="p-4 space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">練習会の参加者リスト表示</h3>
              <p className="text-sm text-muted-foreground mb-3">
                練習会の参加者一覧にあなたのプロフィール画像を表示するかを設定します
              </p>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.hideFromParticipants ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {settings.hideFromParticipants ? "非表示" : "表示"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {settings.hideFromParticipants 
                        ? "他の参加者には表示されません" 
                        : "他の参加者に表示されます"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={settings.hideFromParticipants ? "outline" : "default"}
                  size="sm"
                  onClick={() => setSettings({
                    ...settings,
                    hideFromParticipants: !settings.hideFromParticipants
                  })}
                >
                  {settings.hideFromParticipants ? "表示する" : "非表示にする"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "保存中..." : "設定を保存"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/settings")}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
    <BottomNavigation />
    </>
  )
}