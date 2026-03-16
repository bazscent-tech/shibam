
-- Create news_sources table
CREATE TABLE public.news_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  fetch_method TEXT NOT NULL DEFAULT 'rss' CHECK (fetch_method IN ('rss', 'html', 'js', 'api')),
  fetch_url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  category TEXT DEFAULT 'عام',
  fetch_interval_minutes INTEGER NOT NULL DEFAULT 15 CHECK (fetch_interval_minutes >= 1 AND fetch_interval_minutes <= 30),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  articles_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.news_sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  author TEXT,
  category TEXT DEFAULT 'عام',
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_articles_language ON public.articles(language);
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_source_id ON public.articles(source_id);
CREATE INDEX idx_articles_url ON public.articles(url);
CREATE INDEX idx_news_sources_active ON public.news_sources(is_active);

-- Enable RLS
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read access for articles
CREATE POLICY "Articles are publicly readable"
ON public.articles FOR SELECT USING (is_published = true);

-- Public read access for sources (for admin display)
CREATE POLICY "Sources are publicly readable"
ON public.news_sources FOR SELECT USING (true);

-- Allow inserts from service role (edge functions)
CREATE POLICY "Service role can insert articles"
ON public.articles FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update articles"
ON public.articles FOR UPDATE USING (true);

CREATE POLICY "Service role can delete articles"
ON public.articles FOR DELETE USING (true);

CREATE POLICY "Service role can insert sources"
ON public.news_sources FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update sources"
ON public.news_sources FOR UPDATE USING (true);

CREATE POLICY "Service role can delete sources"
ON public.news_sources FOR DELETE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_news_sources_updated_at
BEFORE UPDATE ON public.news_sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
