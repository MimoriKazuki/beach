// デモユーザーのデータベース（localStorage）管理

export interface DemoUser {
  id: string
  email: string
  password: string
  name: string
  role: 'super_admin' | 'admin' | 'organizer' | 'participant'
  isAdmin: boolean
  isOrganizer: boolean
  canCreateEvents: boolean
  avatar: string
  bio: string
  region: string
  skillLevel: string
  experienceYears: string
  team: string
  prefecture: string
  createdAt: string
}

const USERS_KEY = 'demo_users_db'
const CURRENT_USER_KEY = 'demo_user'

// 全ユーザーを取得
export function getAllUsers(): DemoUser[] {
  if (typeof window === 'undefined') return []
  
  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return []
  
  try {
    return JSON.parse(usersData)
  } catch {
    return []
  }
}

// ユーザーを保存
export function saveUser(user: DemoUser): void {
  if (typeof window === 'undefined') return
  
  const users = getAllUsers()
  const existingIndex = users.findIndex(u => u.email === user.email)
  
  if (existingIndex >= 0) {
    // 既存ユーザーを更新
    users[existingIndex] = user
  } else {
    // 新規ユーザーを追加
    users.push(user)
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// メールアドレスでユーザーを検索
export function findUserByEmail(email: string): DemoUser | null {
  const users = getAllUsers()
  return users.find(u => u.email === email) || null
}

// ログイン検証
export function validateLogin(email: string, password: string): DemoUser | null {
  const user = findUserByEmail(email)
  if (!user) return null
  
  // パスワードが一致するかチェック
  if (user.password === password) {
    return user
  }
  
  return null
}

// 現在のユーザーをセット
export function setCurrentUser(user: DemoUser): void {
  if (typeof window === 'undefined') return
  
  // 現在のユーザーとして保存（パスワードは除外）
  const { password, ...userWithoutPassword } = user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))
}

// メールアドレスの重複チェック
export function isEmailTaken(email: string): boolean {
  return findUserByEmail(email) !== null
}

// デモアカウントを初期化（初回のみ）
export function initializeDemoAccounts(): void {
  if (typeof window === 'undefined') return
  
  const users = getAllUsers()
  if (users.length > 0) return // 既にユーザーが存在する場合はスキップ
  
  // デモアカウントを追加
  const demoAccounts: DemoUser[] = [
    {
      id: 'super_admin_001',
      email: 'super@example.com',
      password: 'super123',
      name: 'Super Admin',
      role: 'super_admin',
      isAdmin: true,
      isOrganizer: true,
      canCreateEvents: true,
      avatar: '',
      bio: 'システム管理者',
      region: '東京都',
      skillLevel: 'advanced',
      experienceYears: '10',
      team: '',
      prefecture: '東京都',
      createdAt: new Date().toISOString()
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
      avatar: '',
      bio: '大会運営管理者',
      region: '埼玉県',
      skillLevel: 'intermediate',
      experienceYears: '5',
      team: '',
      prefecture: '埼玉県',
      createdAt: new Date().toISOString()
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
      avatar: '',
      bio: '練習会主催者',
      region: '千葉県',
      skillLevel: 'intermediate',
      experienceYears: '3',
      team: '',
      prefecture: '千葉県',
      createdAt: new Date().toISOString()
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
      avatar: '',
      bio: 'ビーチボールバレー愛好家',
      region: '神奈川県',
      skillLevel: 'beginner',
      experienceYears: '1',
      team: '',
      prefecture: '神奈川県',
      createdAt: new Date().toISOString()
    }
  ]
  
  localStorage.setItem(USERS_KEY, JSON.stringify(demoAccounts))
}