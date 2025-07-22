-- Supabase接続テスト用SQL
-- SQL Editorで実行して、接続とテーブルの状態を確認

-- 1. profilesテーブルの確認
SELECT COUNT(*) as profile_count FROM profiles;
SELECT * FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

-- 2. eventsテーブルの確認
SELECT COUNT(*) as event_count FROM events;
SELECT * FROM events ORDER BY created_at DESC LIMIT 5;

-- 3. RLSポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('events', 'profiles')
ORDER BY tablename, policyname;

-- 4. テストイベントの作成（手動テスト用）
-- INSERT INTO events (
--   name,
--   type,
--   event_date,
--   venue,
--   organizer_id,
--   prefecture,
--   start_time,
--   max_participants,
--   entry_fee,
--   beginner_friendly,
--   status
-- ) VALUES (
--   'テスト練習会',
--   'practice',
--   NOW() + INTERVAL '7 days',
--   'テスト会場',
--   '00000000-0000-0000-0000-000000000001',
--   '東京都',
--   '19:00',
--   20,
--   500,
--   true,
--   'recruiting'
-- );