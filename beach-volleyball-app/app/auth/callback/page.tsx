"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/spinner"

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        const isSignup = searchParams.get('signup') === 'true'
        
        // URLからコードを取得してセッションを確立
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.search)
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }
        
        // 新規登録の場合
        if (isSignup && data.user) {
          // ユーザー情報を仮保存
          localStorage.setItem('demo_user', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            avatar: data.user.user_metadata?.avatar_url || '',
            provider: data.user.app_metadata?.provider || 'email',
            profileCompleted: false
          }))
          
          // プロフィール完成ページへ
          router.push('/auth/complete-profile')
        } else {
          // ログインの場合はホームへ
          router.push('/')
          router.refresh()
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth/login?error=callback_failed')
      }
    }
    
    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner text="ログイン処理中" />
        <p className="mt-4 text-sm text-muted-foreground">
          しばらくお待ちください...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="読み込み中" />
      </div>
    }>
      <AuthCallback />
    </Suspense>
  )
}