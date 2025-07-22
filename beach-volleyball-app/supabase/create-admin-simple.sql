-- Supabaseダッシュボードで実行する簡単な方法
-- 1. https://supabase.com にログイン
-- 2. プロジェクトを選択
-- 3. SQL Editor を開く
-- 4. 以下のコードを実行

-- まず、メール認証を一時的に無効化（開発環境用）
-- Authentication > Settings > Email Auth > Confirm email を無効にすることもできます

-- ユーザーが既に存在するか確認
DO $$
DECLARE
  user_exists boolean;
  user_id uuid;
BEGIN
  -- ユーザーの存在確認
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'mimori@landbridge.co.jp') INTO user_exists;
  
  IF user_exists THEN
    -- 既存のユーザーIDを取得
    SELECT id INTO user_id FROM auth.users WHERE email = 'mimori@landbridge.co.jp';
    RAISE NOTICE 'User already exists with ID: %', user_id;
    
    -- プロフィールが存在しない場合は作成
    INSERT INTO profiles (id, full_name, role)
    VALUES (user_id, 'Super Admin', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', full_name = 'Super Admin';
    
    RAISE NOTICE 'Profile updated to admin role';
  ELSE
    RAISE NOTICE 'User does not exist. Please create user through Supabase Dashboard:';
    RAISE NOTICE '1. Go to Authentication > Users';
    RAISE NOTICE '2. Click "Invite User"';
    RAISE NOTICE '3. Enter email: mimori@landbridge.co.jp';
    RAISE NOTICE '4. After user is created, run this script again to set admin role';
  END IF;
END $$;

-- 結果を確認
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'mimori@landbridge.co.jp';