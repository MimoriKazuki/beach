-- Supabaseのセットアップ用SQL
-- このSQLをSupabaseのSQL Editorで実行してください

-- profilesテーブルの作成（存在しない場合）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'participant' CHECK (role IN ('admin', 'organizer', 'supporter', 'participant')),
  avatar_url TEXT,
  bio TEXT,
  prefecture TEXT,
  skill_level TEXT,
  experience_years INTEGER,
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSの有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
-- 誰でも閲覧可能
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- ユーザーは自分のプロフィールを更新可能
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 新規ユーザー作成時にプロフィールを自動作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- eventsテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tournament', 'practice')),
  event_date DATE NOT NULL,
  venue TEXT NOT NULL,
  rule_set TEXT,
  organizer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT,
  description TEXT,
  start_time TIME,
  end_time TIME,
  prefecture TEXT,
  max_participants INTEGER,
  entry_fee INTEGER,
  beginner_friendly BOOLEAN DEFAULT false,
  skill_level TEXT,
  status TEXT DEFAULT 'upcoming',
  rules TEXT,
  prizes TEXT,
  recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  recurring_days TEXT[],
  recurring_end_date DATE
);

-- RLSの有効化
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- eventsのRLSポリシー
CREATE POLICY "Events are viewable by everyone" 
  ON public.events FOR SELECT 
  USING (true);

CREATE POLICY "Organizers can create events" 
  ON public.events FOR INSERT 
  WITH CHECK (
    auth.uid() = organizer_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'organizer')
    )
  );

CREATE POLICY "Organizers can update own events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = organizer_id);

-- event_participantsテーブル
CREATE TABLE IF NOT EXISTS public.event_participants (
  event_id UUID REFERENCES public.events(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- RLSの有効化
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- event_participantsのRLSポリシー
CREATE POLICY "Event participants are viewable by everyone" 
  ON public.event_participants FOR SELECT 
  USING (true);

CREATE POLICY "Users can join events" 
  ON public.event_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" 
  ON public.event_participants FOR DELETE 
  USING (auth.uid() = user_id);