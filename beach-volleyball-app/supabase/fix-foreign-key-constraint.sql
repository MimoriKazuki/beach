-- 外部キー制約の問題を解決する

-- 方法1: 外部キー制約を一時的に無効化してデモデータを挿入（推奨）
BEGIN;

-- 外部キー制約を一時的に無効化
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- デモプロファイルを挿入
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'admin', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Admin User', 'admin', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Organizer User', 'organizer', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Demo User', 'participant', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- eventsテーブルの外部キー制約を再作成（profilesテーブルを参照するように修正）
ALTER TABLE events 
ADD CONSTRAINT events_organizer_id_fkey 
FOREIGN KEY (organizer_id) 
REFERENCES profiles(id) ON DELETE CASCADE;

-- profilesテーブルの外部キー制約は再作成しない（auth.usersへの依存を削除）

COMMIT;

-- 確認
SELECT id, full_name, role FROM profiles WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004'
);