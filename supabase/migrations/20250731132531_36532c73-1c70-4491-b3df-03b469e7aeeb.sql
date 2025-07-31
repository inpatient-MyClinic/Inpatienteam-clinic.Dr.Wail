-- Clear existing messages table data
TRUNCATE TABLE public.messages RESTART IDENTITY CASCADE;

-- Add missing columns to messages table if they don't exist
DO $$ 
BEGIN
    -- Add attachments column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachments') THEN
        ALTER TABLE public.messages ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'metadata') THEN
        ALTER TABLE public.messages ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'updated_at') THEN
        ALTER TABLE public.messages ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error adding columns: %', SQLERRM;
END $$;

-- Create trigger for updated_at
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get users by role for messaging
CREATE OR REPLACE FUNCTION public.get_users_by_role(target_role user_role DEFAULT NULL)
RETURNS TABLE (
    id uuid,
    full_name text,
    email text,
    role user_role
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.id, p.full_name, p.email, p.role
    FROM public.profiles p
    WHERE p.status = 'active'
    AND (target_role IS NULL OR p.role = target_role)
    ORDER BY p.full_name;
$$;

-- Create function to search users
CREATE OR REPLACE FUNCTION public.search_users(search_term text)
RETURNS TABLE (
    id uuid,
    full_name text,
    email text,
    role user_role
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.id, p.full_name, p.email, p.role
    FROM public.profiles p
    WHERE p.status = 'active'
    AND (
        LOWER(p.full_name) LIKE LOWER('%' || search_term || '%') OR
        LOWER(p.email) LIKE LOWER('%' || search_term || '%')
    )
    ORDER BY p.full_name;
$$;