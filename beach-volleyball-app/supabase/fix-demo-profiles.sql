-- デモユーザー用プロファイルを確実に作成する

-- 1. 既存のデモプロファイルを確認
SELECT id, full_name, role FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

-- 2. デモプロファイルを作成（存在しない場合のみ）
-- Super Admin
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Admin
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Admin User',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Organizer
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Organizer User',
  'organizer',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Participant
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Demo User',
  'participant',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. 作成されたプロファイルを確認
SELECT id, full_name, role FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);

-- 4. テストイベントを作成してみる
-- 以下のコメントを外して実行すると、デモユーザーでイベントが作成できるかテストできます
/*
INSERT INTO events (
  name,
  type,
  event_date,
  venue,
  organizer_id,
  prefecture,
  start_time,
  max_participants,
  entry_fee,
  beginner_friendly,
  status
) VALUES (
  'テスト練習会',
  'practice',
  NOW() + INTERVAL '7 days',
  'テスト会場',
  '00000000-0000-0000-0000-000000000001', -- Super Admin ID
  '東京都',
  '19:00',
  20,
  500,
  true,
  'recruiting'
);
*/