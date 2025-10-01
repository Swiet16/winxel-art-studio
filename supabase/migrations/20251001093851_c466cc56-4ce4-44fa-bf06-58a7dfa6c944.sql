-- Update default artist name to remove asterisk
UPDATE site_settings 
SET value = 'Winxel ( Yna )' 
WHERE key = 'artist_name';

-- Add default about text if not exists
INSERT INTO site_settings (key, value)
VALUES ('about_text', 'Artist, Creator, Dreamer')
ON CONFLICT (key) DO NOTHING;