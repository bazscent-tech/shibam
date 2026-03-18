-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);

-- Allow public read access
CREATE POLICY "Public read article images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'article-images');

-- Allow anyone to upload (admin will be the one uploading)
CREATE POLICY "Allow upload article images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'article-images');

-- Allow delete
CREATE POLICY "Allow delete article images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'article-images');
