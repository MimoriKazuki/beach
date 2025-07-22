-- Supabase Storageバケットの作成と設定

-- 1. event-imagesバケットを作成（既に存在する場合はスキップ）
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('event-images', 'event-images', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. バケットのRLSポリシーを設定
-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload event images without auth" ON storage.objects;

-- 新しいポリシーを作成
-- 誰でも画像を閲覧可能
CREATE POLICY "Public read access to event images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

-- 誰でも画像をアップロード可能（デモ用）
CREATE POLICY "Public upload access to event images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'event-images');

-- 誰でも画像を更新可能（デモ用）
CREATE POLICY "Public update access to event images" ON storage.objects
FOR UPDATE USING (bucket_id = 'event-images');

-- 誰でも画像を削除可能（デモ用）
CREATE POLICY "Public delete access to event images" ON storage.objects
FOR DELETE USING (bucket_id = 'event-images');

-- 3. バケットの確認
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'event-images';

-- 4. ポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;