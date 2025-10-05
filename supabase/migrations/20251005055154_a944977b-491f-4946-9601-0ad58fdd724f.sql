-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'parent', 'guardian', 'police', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create monitoring relationships table (links guardians to monitored users)
CREATE TABLE public.monitoring_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  monitored_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL, -- 'parent', 'guardian', 'police', etc.
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (monitor_id, monitored_user_id)
);

ALTER TABLE public.monitoring_relationships ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if user can monitor another user
CREATE OR REPLACE FUNCTION public.can_monitor(_monitor_id UUID, _monitored_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.monitoring_relationships
    WHERE monitor_id = _monitor_id
      AND monitored_user_id = _monitored_user_id
      AND approved = true
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for monitoring_relationships
CREATE POLICY "Users can view their monitoring relationships"
ON public.monitoring_relationships
FOR SELECT
USING (auth.uid() = monitor_id OR auth.uid() = monitored_user_id);

CREATE POLICY "Monitors can create monitoring relationships"
ON public.monitoring_relationships
FOR INSERT
WITH CHECK (
  auth.uid() = monitor_id AND 
  (public.has_role(auth.uid(), 'parent') OR 
   public.has_role(auth.uid(), 'guardian') OR 
   public.has_role(auth.uid(), 'police') OR 
   public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can approve monitoring relationships"
ON public.monitoring_relationships
FOR UPDATE
USING (auth.uid() = monitored_user_id)
WITH CHECK (auth.uid() = monitored_user_id);

CREATE POLICY "Admins can manage all monitoring relationships"
ON public.monitoring_relationships
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for moods table
DROP POLICY IF EXISTS "Users can view their own moods" ON public.moods;
CREATE POLICY "Users can view their own moods"
ON public.moods
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.can_monitor(auth.uid(), user_id) OR
  public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for journals table
DROP POLICY IF EXISTS "Users can view their own journals" ON public.journals;
CREATE POLICY "Users can view their own journals"
ON public.journals
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.can_monitor(auth.uid(), user_id) OR
  public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for chat_messages table
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.can_monitor(auth.uid(), user_id) OR
  public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for goals table
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals"
ON public.goals
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.can_monitor(auth.uid(), user_id) OR
  public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.can_monitor(auth.uid(), user_id) OR
  public.has_role(auth.uid(), 'admin')
);