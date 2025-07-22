-- デモユーザー用のプロファイルを作成
-- これにより、デモユーザーでもイベントを作成できるようになります

-- Super Admin用のプロファイル
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Super Admin',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'Super Admin';

-- 管理者用のプロファイル
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Admin User',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'Admin User';

-- 主催者用のプロファイル
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Organizer User',
  'organizer',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE
SET role = 'organizer', full_name = 'Organizer User';

-- 一般ユーザー用のプロファイル
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Demo User',
  'participant',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE
SET role = 'participant', full_name = 'Demo User';

-- デモユーザーがイベントを作成できるようにRLSポリシーを追加
-- 既存のポリシーがある場合は削除
DROP POLICY IF EXISTS "Demo users can create events" ON events;
DROP POLICY IF EXISTS "Demo users can view their events" ON events;

CREATE POLICY "Demo users can create events" ON events
  FOR INSERT WITH CHECK (
    organizer_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004'
    ) OR auth.uid() IS NOT NULL
  );

CREATE POLICY "Demo users can view all events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Demo users can update their events" ON events
  FOR UPDATE USING (
    organizer_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004'
    ) OR organizer_id = auth.uid()
  );

-- イベント画像のアップロードポリシーも追加
CREATE POLICY "Anyone can upload event images without auth" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images'
);

-- 確認用クエリ
SELECT * FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);