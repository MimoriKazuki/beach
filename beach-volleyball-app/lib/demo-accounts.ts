// デモアカウントの定義
export interface DemoAccount {
  id: string
  email: string
  password: string
  name: string
  role: 'super_admin' | 'admin' | 'organizer' | 'participant'
  isAdmin: boolean
  isOrganizer: boolean
  canCreateEvents?: boolean
  description: string
  prefecture?: string  // ユーザーの都道府県
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'super_admin_001',
    email: 'super@example.com',
    password: 'super123',
    name: 'Super Admin',
    role: 'super_admin',
    isAdmin: true,
    isOrganizer: true,
    canCreateEvents: true,
    description: '全機能にアクセス可能（システム管理、大会作成、練習作成）',
    prefecture: '東京都'
  },
  {
    id: 'admin_001',
    email: 'admin@example.com',
    password: 'admin123',
    name: '管理者',
    role: 'admin',
    isAdmin: true,
    isOrganizer: true,
    canCreateEvents: true,
    description: '管理機能にアクセス可能（大会作成、練習作成）',
    prefecture: '埼玉県'
  },
  {
    id: 'organizer_001',
    email: 'organizer@example.com',
    password: 'organizer123',
    name: '主催者',
    role: 'organizer',
    isAdmin: false,
    isOrganizer: true,
    canCreateEvents: true,
    description: '練習会の作成が可能',
    prefecture: '千葉県'
  },
  {
    id: 'user_001',
    email: 'user@example.com',
    password: 'user123',
    name: '一般ユーザー',
    role: 'participant',
    isAdmin: false,
    isOrganizer: false,
    canCreateEvents: false,
    description: 'イベント参加のみ可能',
    prefecture: '神奈川県'
  }
]

// アカウントの検証
export function validateDemoAccount(email: string, password: string): DemoAccount | null {
  const account = DEMO_ACCOUNTS.find(
    acc => acc.email === email && acc.password === password
  )
  return account || null
}

// 権限の確認
export function checkPermissions(account: DemoAccount) {
  return {
    canAccessSystemAdmin: account.role === 'super_admin',
    canAccessAdmin: account.isAdmin,
    canCreateTournament: account.isAdmin,
    canCreatePractice: account.isOrganizer || account.isAdmin,
    canManageUsers: account.role === 'super_admin',
    canApproveRequests: account.isAdmin
  }
}