"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type AuthContextType = {
  user: User | null
  loading: boolean
  isOrganizer: boolean
  isAdmin: boolean
  userPrefecture?: string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isOrganizer: false,
  isAdmin: false,
  userPrefecture: undefined,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userPrefecture, setUserPrefecture] = useState<string | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()

    // 初期化時にデモユーザー情報をチェック
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        return
      }
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        try {
          const userData = JSON.parse(demoUser)
          setUser({
            id: userData.id || 'demo-user-id',
            email: userData.email,
            user_metadata: { name: userData.name }
          } as any)
          // 権限をチェック
          setIsOrganizer(userData.isOrganizer || userData.canCreateEvents || false)
          setIsAdmin(userData.isAdmin || false)
          
          // Super Adminの場合は両方の権限を持つ
          if (userData.role === 'super_admin') {
            setIsOrganizer(true)
            setIsAdmin(true)
          }
          
          // 管理者の場合も主催者権限を持つ
          if (userData.role === 'admin' || userData.isAdmin) {
            setIsOrganizer(true)
          }
          
          // 都道府県を設定
          setUserPrefecture(userData.prefecture)
        } catch (error) {
          console.error('Error parsing demo user:', error)
          // パースエラーの場合はクリア
          localStorage.removeItem('demo_user')
          setUser(null)
          setIsOrganizer(false)
          setIsAdmin(false)
        }
      } else {
        // demo_userがない場合はクリア
        setUser(null)
        setIsOrganizer(false)
        setIsAdmin(false)
      }
    }

    checkAuth()
    
    // カスタムイベントをリッスン
    const handleAuthChange = (event: CustomEvent) => {
      checkAuth()
    }
    
    window.addEventListener('demo-auth-change', handleAuthChange as any)
    
    // ストレージの変更を監視（他のタブでの変更に対応）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'demo_user') {
        checkAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Supabaseの環境変数をチェック
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                             process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Supabase環境が設定されていない場合はここで終了
    if (!hasSupabaseConfig) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      
      // ユーザーの権限情報を取得
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setIsOrganizer(profile.role === 'organizer' || profile.role === 'admin')
          setIsAdmin(profile.role === 'admin')
        }
      }
      
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      // ユーザーの権限情報を取得
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setIsOrganizer(profile.role === 'organizer' || profile.role === 'admin')
          setIsAdmin(profile.role === 'admin')
        }
      } else {
        setIsOrganizer(false)
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('demo-auth-change', handleAuthChange as any)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isOrganizer, isAdmin, userPrefecture }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}