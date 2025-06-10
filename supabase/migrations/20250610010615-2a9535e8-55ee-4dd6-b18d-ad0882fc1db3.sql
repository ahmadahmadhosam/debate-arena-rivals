
-- Create a custom users table for username/password authentication
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  religion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to read their own data
CREATE POLICY "Users can view their own data" 
  ON public.app_users 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Create policy that allows anyone to insert (for signup)
CREATE POLICY "Anyone can signup" 
  ON public.app_users 
  FOR INSERT 
  WITH CHECK (true);

-- Create a function to handle password hashing
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;

-- Create a function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(username TEXT, password TEXT)
RETURNS TABLE(user_id UUID, user_religion TEXT, user_username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT id, religion, username
  FROM public.app_users
  WHERE app_users.username = verify_password.username
    AND password_hash = crypt(verify_password.password, password_hash);
END;
$$;

-- Create a function to create new user
CREATE OR REPLACE FUNCTION create_app_user(p_username TEXT, p_password TEXT, p_religion TEXT)
RETURNS TABLE(user_id UUID, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM public.app_users WHERE username = p_username) THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'اسم المستخدم موجود مسبقاً';
    RETURN;
  END IF;
  
  -- Create new user
  INSERT INTO public.app_users (username, password_hash, religion)
  VALUES (p_username, hash_password(p_password), p_religion)
  RETURNING id INTO new_user_id;
  
  RETURN QUERY SELECT new_user_id, TRUE, NULL::TEXT;
END;
$$;
