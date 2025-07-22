-- eventsテーブルに追加フィールドを追加
ALTER TABLE events
ADD COLUMN image_url TEXT,
ADD COLUMN description TEXT,
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME,
ADD COLUMN prefecture TEXT,
ADD COLUMN max_participants INTEGER DEFAULT 0,
ADD COLUMN entry_fee INTEGER DEFAULT 0,
ADD COLUMN beginner_friendly BOOLEAN DEFAULT false,
ADD COLUMN skill_level TEXT,
ADD COLUMN status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'finished')),
ADD COLUMN rules TEXT,
ADD COLUMN prizes JSONB,
ADD COLUMN recurring BOOLEAN DEFAULT false,
ADD COLUMN recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'biweekly', 'monthly', NULL)),
ADD COLUMN recurring_days TEXT[],
ADD COLUMN recurring_end_date DATE;

-- インデックスを追加
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_prefecture ON events(prefecture);

-- Storage bucketを作成（画像保存用）
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage ポリシーを設定
CREATE POLICY "Anyone can view event images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own event images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own event images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);