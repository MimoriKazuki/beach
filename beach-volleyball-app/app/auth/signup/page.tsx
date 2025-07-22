"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SKILL_LEVELS } from "@/lib/constants/levels"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { PREFECTURES } from "@/lib/constants/prefectures"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'method' | 'email' | 'profile'>('method')
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    skillLevel: "",
    experienceYears: "",
    prefecture: ""
  })

  const [error, setError] = useState<string | null>(null)


  const handleEmailStart = () => {
    setStep('email')
    setError(null)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email) {
      setError('メールアドレスを入力してください')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }

    setStep('profile')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    console.log('新規登録開始:', formData)

    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません")
      setIsLoading(false)
      return
    }
    
    // 強制的にデモモードとして処理（開発用）
    const forceDemo = true
    
    // モックモードの場合
    if (forceDemo || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      console.log('デモモード: 新規登録', formData)
      
      // デモユーザーDB機能をインポート
      const { isEmailTaken, saveUser, setCurrentUser, initializeDemoAccounts } = await import('@/lib/demo-users-db')
      
      // 初回のみデモアカウントを初期化
      initializeDemoAccounts()
      
      // メールアドレスの重複チェック
      if (isEmailTaken(formData.email)) {
        setError("このメールアドレスは既に使用されています。")
        setIsLoading(false)
        return
      }
      
      // mimori@landbridge.co.jpの場合はSuper Adminに設定
      const isMimori = formData.email === 'mimori@landbridge.co.jp'
      
      const newUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        skillLevel: formData.skillLevel,
        experienceYears: formData.experienceYears,
        prefecture: formData.prefecture,
        createdAt: new Date().toISOString(),
        role: isMimori ? 'super_admin' as const : 'participant' as const,
        isAdmin: isMimori,
        isOrganizer: isMimori,
        canCreateEvents: isMimori,
        avatar: "",
        bio: "ビーチボールバレー愛好家",
        region: formData.prefecture,
        team: ""
      }
      
      // ユーザーを保存
      saveUser(newUser)
      
      // 現在のユーザーとして設定
      setCurrentUser(newUser)
      
      console.log('デモユーザー保存完了')
      // 即座にローディングを解除してリダイレクト
      setIsLoading(false)
      console.log('リダイレクト実行')
      router.push("/")
      router.refresh()
      return
    }
    
    try {
      const supabase = createClient()
      
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        if (signUpError.message.includes('email')) {
          setError("このメールアドレスは既に使用されています。")
        } else {
          setError("登録に失敗しました。もう一度お試しください。")
        }
        setIsLoading(false)
        return
      }

      // 登録成功後、自動的にログインを試みる
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error('Auto sign-in error:', signInError)
        // メール確認が必要な場合
        if (signInError.message.includes('confirm') || signInError.message.includes('verify')) {
          alert("登録が完了しました。メールを確認してアカウントを有効化してください。")
          router.push("/auth/login")
        } else {
          router.push("/auth/login")
        }
      } else {
        // ログイン成功
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error('サインアップエラー:', error)
      setError("ネットワークエラーが発生しました。")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">新規登録</h1>
          <p className="text-muted-foreground">
            ビーチボールバレーコミュニティへようこそ
          </p>
        </div>

        {/* Step 1: Choose signup method */}
        {step === 'method' && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="default"
              className="w-full flex items-center justify-center gap-2 h-14"
              onClick={handleEmailStart}
            >
              <Mail className="h-5 w-5" />
              メールで登録
            </Button>
          </div>
        )}

        {/* Step 2: Email and password */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="flex items-center mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('method')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold flex-1 text-center">メールで登録</h2>
              <div className="w-10" />
            </div>

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
                placeholder="example@email.com"
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
                minLength={6}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="パスワードを再入力"
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
            >
              次へ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Step 3: Profile information */}
        {step === 'profile' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('email')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold flex-1 text-center">プロフィール情報</h2>
              <div className="w-10" />
            </div>

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

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "登録中..." : "登録を完了"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}