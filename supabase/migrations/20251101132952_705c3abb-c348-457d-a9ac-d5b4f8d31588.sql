-- Create alerts table for monitoring suspicious content
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  flagged_words TEXT[] NOT NULL,
  content_snippet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Monitors can view alerts for users they monitor
CREATE POLICY "Monitors can view alerts for monitored users"
ON public.alerts
FOR SELECT
USING (can_monitor(auth.uid(), user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Monitors can update alerts (mark as resolved)
CREATE POLICY "Monitors can update alerts"
ON public.alerts
FOR UPDATE
USING (can_monitor(auth.uid(), user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_resolved ON public.alerts(resolved);

-- Function to check for suspicious words
CREATE OR REPLACE FUNCTION check_suspicious_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  suspicious_words TEXT[] := ARRAY['suicide', 'kill', 'die', 'death', 'harm', 'hurt', 'end it', 'give up', 'no point'];
  found_words TEXT[] := ARRAY[]::TEXT[];
  word TEXT;
  content_text TEXT;
BEGIN
  -- Get content based on table
  IF TG_TABLE_NAME = 'journals' THEN
    content_text := NEW.title || ' ' || NEW.content;
  ELSIF TG_TABLE_NAME = 'chat_messages' THEN
    content_text := NEW.content;
  ELSIF TG_TABLE_NAME = 'moods' THEN
    content_text := COALESCE(NEW.note, '');
  END IF;

  -- Check for suspicious words
  FOREACH word IN ARRAY suspicious_words
  LOOP
    IF LOWER(content_text) LIKE '%' || word || '%' THEN
      found_words := array_append(found_words, word);
    END IF;
  END LOOP;

  -- Create alert if suspicious words found
  IF array_length(found_words, 1) > 0 THEN
    INSERT INTO public.alerts (user_id, content_type, content_id, flagged_words, content_snippet)
    VALUES (
      NEW.user_id,
      TG_TABLE_NAME,
      NEW.id,
      found_words,
      LEFT(content_text, 200)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create triggers for journals, chat_messages, and moods
CREATE TRIGGER check_journals_content
AFTER INSERT OR UPDATE ON public.journals
FOR EACH ROW
EXECUTE FUNCTION check_suspicious_content();

CREATE TRIGGER check_chat_content
AFTER INSERT OR UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION check_suspicious_content();

CREATE TRIGGER check_mood_content
AFTER INSERT OR UPDATE ON public.moods
FOR EACH ROW
EXECUTE FUNCTION check_suspicious_content();