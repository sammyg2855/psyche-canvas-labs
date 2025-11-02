-- Enable realtime for moods table
ALTER PUBLICATION supabase_realtime ADD TABLE public.moods;

-- Create storage bucket for inspiration images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspiration-images', 'inspiration-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for inspiration images
CREATE POLICY "Users can upload their own inspiration images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspiration-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own inspiration images"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspiration-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own inspiration images"
ON storage.objects FOR DELETE
USING (bucket_id = 'inspiration-images' AND auth.uid()::text = (storage.foldername(name))[1]);