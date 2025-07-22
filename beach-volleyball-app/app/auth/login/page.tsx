"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleLineLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github', // 一時的にGitHubを使用（LINEプロバイダー設定後に'line'に変更）
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('LINE login error:', error)
        setError('LINEログインに失敗しました')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('LINE login error:', error)
      setError('LINEログインに失敗しました')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    console.log('ログイン試行:', formData.email)
    
    // 強制的にデモモードとして処理（開発用）
    const forceDemo = true
    
    // デモモードかどうかを先に確認
    const isDemo = forceDemo || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'
    
    // デモユーザーDB機能をインポート
    const { validateLogin, setCurrentUser, initializeDemoAccounts } = await import('@/lib/demo-users-db')
    
    // 初回のみデモアカウントを初期化
    initializeDemoAccounts()
    
    // まず、デモアカウントの検証を試みる
    try {
      const { validateDemoAccount } = await import('@/lib/demo-accounts')
      const demoAccount = validateDemoAccount(formData.email, formData.password)
      
      if (demoAccount) {
        console.log('デモアカウント: ログイン成功', demoAccount)
        
        const user = {
          id: demoAccount.id,
          email: demoAccount.email,
          password: formData.password,
          name: demoAccount.name,
          role: demoAccount.role,
          isAdmin: demoAccount.isAdmin,
          isOrganizer: demoAccount.isOrganizer,
          canCreateEvents: demoAccount.canCreateEvents || demoAccount.isOrganizer,
          avatar: "",
          bio: "ビーチボールバレー愛好家",
          region: demoAccount.prefecture || "東京都",
          skillLevel: "intermediate",
          experienceYears: "3",
          team: "",
          prefecture: demoAccount.prefecture || "東京都",
          createdAt: new Date().toISOString()
        }
        
        setCurrentUser(user)
        setIsLoading(false)
        router.push("/")
        router.refresh()
        return
      }
    } catch (err) {
      console.error('デモアカウント検証エラー:', err)
    }
    
    // 次に、保存されたユーザーでのログインを試みる
    const savedUser = validateLogin(formData.email, formData.password)
    if (savedUser) {
      console.log('保存されたユーザー: ログイン成功', savedUser)
      setCurrentUser(savedUser)
      setIsLoading(false)
      router.push("/")
      router.refresh()
      return
    }
    
    // デモモードの場合はここでエラーを表示
    if (isDemo) {
      setError("メールアドレスまたはパスワードが正しくありません")
      setIsLoading(false)
      return
    }
    
    // 本番環境の場合のみSupabase認証を実行
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('Login error:', error)
        if (error.message.includes('confirm') || error.message.includes('verify')) {
          setError("メールアドレスの確認が必要です。登録時のメールをご確認ください。")
        } else if (error.message.includes('Invalid login credentials')) {
          setError("メールアドレスまたはパスワードが正しくありません")
        } else {
          setError(error.message || "ログインに失敗しました")
        }
        setIsLoading(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error('ログインエラー:', error)
      setError("ネットワークエラーが発生しました。")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ログイン</h1>
          <p className="text-muted-foreground">
            ビーチボールバレーコミュニティへようこそ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Mail className="h-4 w-4" />
            {isLoading ? "ログイン中..." : "メールでログイン"}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLineLogin}
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                fill="#00B900"
              />
              <path
                d="M12 8.5C9.51472 8.5 7.5 10.2157 7.5 12.3333C7.5 13.9106 8.37965 15.2925 9.69033 16.0644C9.76842 16.1054 9.82137 16.1833 9.82137 16.2717C9.82137 16.3162 9.81209 16.3607 9.79477 16.4013L9.21201 17.7952C9.17976 17.8714 9.24642 17.95 9.32822 17.95C9.36926 17.95 9.40777 17.9314 9.43415 17.8987L11.1402 16.0238C11.1882 15.9684 11.2576 15.936 11.3316 15.936C11.5479 15.9563 11.7705 15.9667 12 15.9667C14.4853 15.9667 16.5 14.451 16.5 12.3333C16.5 10.2157 14.4853 8.5 12 8.5Z"
                fill="white"
              />
            </svg>
            {isLoading ? "接続中..." : "LINEでログイン"}
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                新規登録
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}