-- eventsテーブルのカラム情報を確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'events'
ORDER BY ordinal_position;

-- 特にtime型のカラムを確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'events'
    AND data_type IN ('time', 'time without time zone', 'time with time zone');