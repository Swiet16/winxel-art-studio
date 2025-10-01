-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('hero-images', 'hero-images', true),
  ('portfolio-media', 'portfolio-media', true),
  ('profile-images', 'profile-images', true);

-- Create hero_images table
CREATE TABLE public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio_items table
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'music')),
  thumbnail_url TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create news_posts table
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('artist_name', 'Winxel ( Yna )*'),
  ('about_text', 'Artist, Creator, Dreamer'),
  ('social_instagram', ''),
  ('social_twitter', ''),
  ('social_youtube', ''),
  ('social_spotify', '');

-- Enable Row Level Security
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view active hero images"
  ON public.hero_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view published portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view published news posts"
  ON public.news_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can insert contact submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- Admin full access (authenticated users only)
CREATE POLICY "Authenticated users can manage hero images"
  ON public.hero_images FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage portfolio items"
  ON public.portfolio_items FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage news posts"
  ON public.news_posts FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contact submissions"
  ON public.contact_submissions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete contact submissions"
  ON public.contact_submissions FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage site settings"
  ON public.site_settings FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Storage policies for hero-images bucket
CREATE POLICY "Public can view hero images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-images');

CREATE POLICY "Authenticated users can upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hero-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update hero images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hero-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete hero images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hero-images' AND auth.uid() IS NOT NULL);

-- Storage policies for portfolio-media bucket
CREATE POLICY "Public can view portfolio media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated users can upload portfolio media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update portfolio media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete portfolio media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-media' AND auth.uid() IS NOT NULL);

-- Storage policies for profile-images bucket
CREATE POLICY "Public can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update profile images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete profile images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profile-images' AND auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hero_images_updated_at
  BEFORE UPDATE ON public.hero_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();