-- RLSポリシーの無限再帰を修正

-- 1. 既存の問題のあるポリシーを削除
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything on events" ON events;

-- 2. profilesテーブルの新しいポリシー（無限再帰を避ける）
-- 全員がプロフィールを閲覧可能
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile only" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. eventsテーブルのポリシーを整理
-- 既存のポリシーを一旦削除
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Organizers can create events" ON events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON events;
DROP POLICY IF EXISTS "Demo users can create events" ON events;
DROP POLICY IF EXISTS "Demo users can view all events" ON events;
DROP POLICY IF EXISTS "Demo users can update their events" ON events;

-- eventsテーブルの新しいポリシー
-- 誰でもイベントを閲覧可能
CREATE POLICY "Public read access to events" ON events
  FOR SELECT USING (true);

-- 認証されたユーザーまたはデモユーザーはイベントを作成可能
CREATE POLICY "Authenticated or demo users can create events" ON events
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR 
    organizer_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004'
    )
  );

-- 主催者は自分のイベントを更新可能
CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING (
    auth.uid() = organizer_id OR
    organizer_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004'
    )
  );

-- 主催者は自分のイベントを削除可能
CREATE POLICY "Organizers can delete own events" ON events
  FOR DELETE USING (
    auth.uid() = organizer_id OR
    organizer_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003'
    )
  );

-- 4. event_participantsテーブルのポリシーも確認
-- 既存のポリシーを整理
DROP POLICY IF EXISTS "Anyone can view participants" ON event_participants;
DROP POLICY IF EXISTS "Authenticated users can join events" ON event_participants;
DROP POLICY IF EXISTS "Users can remove themselves from events" ON event_participants;

-- 新しいポリシー
CREATE POLICY "Public read access to participants" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    user_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004'
    )
  );

CREATE POLICY "Users can leave events" ON event_participants
  FOR DELETE USING (
    auth.uid() = user_id OR
    user_id IN (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004'
    )
  );

-- 5. ポリシーの確認
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'events', 'event_participants')
ORDER BY tablename, policyname;