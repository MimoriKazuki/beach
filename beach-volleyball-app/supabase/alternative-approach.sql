-- 代替案：実際のユーザーを使用する

-- 方法2: Supabaseの管理者機能を使用してデモユーザーを作成
-- 注意: これはSupabaseダッシュボードから実行する必要があります

-- 1. Supabaseダッシュボード > Authentication > Users
-- 2. "Invite user" ボタンをクリック
-- 3. 以下のメールアドレスで4つのユーザーを作成:
--    - super@example.com
--    - admin@example.com
--    - organizer@example.com
--    - user@example.com

-- ユーザーが作成されたら、以下のSQLを実行してロールを設定:

-- Super Admin
UPDATE profiles 
SET role = 'admin', full_name = 'Super Admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'super@example.com');

-- Admin
UPDATE profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');

-- Organizer
UPDATE profiles 
SET role = 'organizer', full_name = 'Organizer User'
WHERE id = (SELECT id FROM auth.users WHERE email = 'organizer@example.com');

-- Participant
UPDATE profiles 
SET role = 'participant', full_name = 'Demo User'
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- 確認
SELECT 
  u.email,
  p.full_name,
  p.role
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN (
  'super@example.com',
  'admin@example.com',
  'organizer@example.com',
  'user@example.com'
);