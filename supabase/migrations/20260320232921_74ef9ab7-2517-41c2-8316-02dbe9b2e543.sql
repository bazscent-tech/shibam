
-- Add slug column
ALTER TABLE public.articles ADD COLUMN slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_articles_slug ON public.articles (slug) WHERE slug IS NOT NULL;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_article_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug: lowercase, replace spaces/special chars with hyphens, trim
  base_slug := regexp_replace(
    regexp_replace(
      regexp_replace(NEW.title, '[^\w\s\u0600-\u06FF-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  );
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length
  IF length(base_slug) > 80 THEN
    base_slug := left(base_slug, 80);
    base_slug := trim(both '-' from base_slug);
  END IF;
  
  -- If empty, use id
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := NEW.id::text;
  END IF;
  
  final_slug := base_slug;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.articles WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate slug on insert/update
CREATE TRIGGER generate_slug_before_insert
BEFORE INSERT ON public.articles
FOR EACH ROW
WHEN (NEW.slug IS NULL OR NEW.slug = '')
EXECUTE FUNCTION public.generate_article_slug();

CREATE TRIGGER generate_slug_before_update
BEFORE UPDATE OF title ON public.articles
FOR EACH ROW
WHEN (NEW.title IS DISTINCT FROM OLD.title)
EXECUTE FUNCTION public.generate_article_slug();

-- Backfill existing articles with slugs
DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR rec IN SELECT id, title FROM public.articles WHERE slug IS NULL ORDER BY created_at LOOP
    base_slug := regexp_replace(
      regexp_replace(
        regexp_replace(rec.title, '[^\w\s\u0600-\u06FF-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    );
    base_slug := trim(both '-' from base_slug);
    IF length(base_slug) > 80 THEN
      base_slug := left(base_slug, 80);
      base_slug := trim(both '-' from base_slug);
    END IF;
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := rec.id::text;
    END IF;
    
    final_slug := base_slug;
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.articles WHERE slug = final_slug AND id != rec.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    UPDATE public.articles SET slug = final_slug WHERE id = rec.id;
  END LOOP;
END $$;
