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
  
  // URLパラメータからリダイレクト先を取得
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const redirectTo = searchParams.get('redirect') || '/'


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    console.log('ログイン試行:', formData.email)
    
    // Supabaseの環境変数をチェック
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                             process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // デモモードかどうかを先に確認
    const isDemo = !hasSupabaseConfig
    
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
        router.push(redirectTo)
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
      router.push(redirectTo)
      router.refresh()
      return
    }
    
    // デモモードの場合はここでエラーを表示
    if (isDemo) {
      setError("メールアドレスまたはパスワードが正しくありません")
      setIsLoading(false)
      return
    }
    
    // Supabaseまたはデモモードでの認証を実行
    console.log('環境をチェック中...')
    
    // Supabase接続に問題がある場合はデモモードで動作
    const forceDemo = false // デモモードの強制を解除
    
    // 本番環境の場合のみSupabase認証を実行
    try {
      console.log('Supabase認証を開始します...')
      const supabase = createClient()
      
      // Supabaseクライアントがnullの場合はデモモードとして扱う
      if (!supabase) {
        console.log('Supabaseクライアントが利用できません。デモモードで動作します。')
        setError("メールアドレスまたはパスワードが正しくありません")
        setIsLoading(false)
        return
      }
      
      console.log('Supabaseクライアントが正常に作成されました')
      
      // 5秒のタイムアウトを設定
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      console.log('signInWithPasswordを実行します...')
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        
        clearTimeout(timeoutId)
        console.log('signInWithPassword結果:', { data, error })

        if (error) {
          console.error('Login error details:', {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error
          })
          
          if (error.message.includes('confirm') || error.message.includes('verify')) {
            setError("メールアドレスの確認が必要です。登録時のメールをご確認ください。")
          } else if (error.message.includes('Invalid login credentials')) {
            setError("メールアドレスまたはパスワードが正しくありません。Supabaseダッシュボードでパスワードをリセットしてください。")
          } else {
            setError(error.message || "ログインに失敗しました")
          }
          setIsLoading(false)
          return
        }

        console.log('ログイン成功！リダイレクト中...')
        router.push(redirectTo)
        router.refresh()
      } catch (innerError: any) {
        clearTimeout(timeoutId)
        if (innerError.name === 'AbortError') {
          console.error('認証タイムアウト')
          setError('認証がタイムアウトしました。デモモードでのログインをお試しください。')
        } else {
          console.error('認証エラー:', innerError)
          setError('認証中にエラーが発生しました。')
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      // Supabase関連のエラーをより詳細に処理
      if (error instanceof Error) {
        setError("ログインに失敗しました: " + error.message)
      } else {
        setError("ネットワークエラーが発生しました。")
      }
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