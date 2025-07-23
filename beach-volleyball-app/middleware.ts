import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 認証が必要なページのリスト
  const protectedPaths = [
    '/profile',
    '/profile/edit',
    '/profile/requests',
    '/events/create',
    '/tournaments/create',
    '/admin',
    '/organizer',
    '/settings/email',
    '/settings/notifications',
    '/settings/admin-access',
    '/practice-request'
  ]
  
  // 現在のパスが保護されたパスかチェック
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  // Supabase環境が設定されていない場合（デモモード）
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    // デモモードでも認証チェック
    if (isProtectedPath) {
      // クッキーからデモユーザー情報を確認（サーバーサイドではlocalStorageが使えないため）
      const demoUserCookie = request.cookies.get('demo_user')
      if (!demoUserCookie) {
        // ログインページへリダイレクト
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
    }
    return NextResponse.next()
  }
  
  // Supabase環境の場合
  const response = await updateSession(request)
  
  // 保護されたパスで認証されていない場合
  if (isProtectedPath && response.status === 401) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}