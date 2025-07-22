-- Supabaseで削除されたイベントを確認するSQL

-- 0. eventsテーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;

-- 1. 全イベントを確認
SELECT id, name, event_date, type, created_at, status
FROM events
ORDER BY created_at DESC;

-- 2. 特定のイベントIDで検索（削除確認用）
-- 例: UUID形式の場合
-- SELECT * FROM events WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 文字列IDの場合（カスタムIDを使用している場合）
-- SELECT * FROM events WHERE id::text = 'event_1753152560552';

-- 最近作成されたイベントを確認
SELECT id, name, event_date, type, created_at
FROM events
ORDER BY created_at DESC
LIMIT 10;

-- 3. 最近削除されたイベントの確認（ソフトデリート実装の場合）
-- もしstatusカラムで管理している場合
SELECT id, name, event_date, type, created_at, status
FROM events
WHERE status = 'deleted'
ORDER BY created_at DESC;

-- 4. イベント参加者の確認
-- イベントが削除されても参加者データが残っている可能性があるため
SELECT ep.*, e.name as event_name
FROM event_participants ep
LEFT JOIN events e ON ep.event_id = e.id
WHERE e.id IS NULL; -- イベントが存在しない参加者データ

-- 5. イベント数の統計
SELECT 
  COUNT(*) as total_events,
  COUNT(CASE WHEN type = 'tournament' THEN 1 END) as tournaments,
  COUNT(CASE WHEN type = 'practice' THEN 1 END) as practices,
  COUNT(CASE WHEN event_date >= CURRENT_DATE THEN 1 END) as upcoming_events
FROM events
WHERE status != 'deleted' OR status IS NULL;