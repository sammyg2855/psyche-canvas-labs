-- First, create profiles for any existing users that don't have one
INSERT INTO public.profiles (user_id, display_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email)
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
);

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.monitoring_relationships
  DROP CONSTRAINT IF EXISTS monitoring_relationships_monitor_id_fkey;

ALTER TABLE public.monitoring_relationships
  DROP CONSTRAINT IF EXISTS monitoring_relationships_monitored_user_id_fkey;

-- Add foreign key constraints to profiles table
ALTER TABLE public.monitoring_relationships
  ADD CONSTRAINT monitoring_relationships_monitor_id_fkey 
  FOREIGN KEY (monitor_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE public.monitoring_relationships
  ADD CONSTRAINT monitoring_relationships_monitored_user_id_fkey 
  FOREIGN KEY (monitored_user_id) 
  REFERENCES public.profiles(user_id) 
  ON DELETE CASCADE;

-- Create function to automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();