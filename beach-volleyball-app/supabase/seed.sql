-- Super Adminユーザーを直接作成
-- このスクリプトはSupabaseダッシュボードのSQL Editorで実行してください

-- 既存のユーザーを確認
SELECT id, email, created_at FROM auth.users WHERE email = 'mimori@landbridge.co.jp';

-- ユーザーが存在しない場合は、以下のコメントを外して実行してください
-- 注意: この方法は開発環境でのみ使用してください

/*
-- auth.usersテーブルに直接ユーザーを作成（開発環境用）
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'mimori@landbridge.co.jp',
  crypt('LB@123456', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Super Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);
*/

-- profilesテーブルにSuper Admin権限を設定
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'mimori@landbridge.co.jp'
);

-- 権限を確認
SELECT 
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'mimori@landbridge.co.jp';