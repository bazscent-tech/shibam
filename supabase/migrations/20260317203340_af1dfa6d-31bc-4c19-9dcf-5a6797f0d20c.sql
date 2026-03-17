
-- Add cascade delete: when a source is deleted, its articles are also deleted
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_source_id_fkey;
ALTER TABLE public.articles ADD CONSTRAINT articles_source_id_fkey 
  FOREIGN KEY (source_id) REFERENCES public.news_sources(id) ON DELETE CASCADE;
