import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
    console.log('Supabase環境変数が設定されていません。デモモードで動作します。')
    // nullを返してデモモードとして動作
    return null
  }

  try {
    return createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    )
  } catch (error) {
    console.error('Supabaseクライアント作成エラー:', error)
    return null
  }
}