
-- Drop the existing function first
DROP FUNCTION IF EXISTS verify_password(text, text);

-- Recreate the verify_password function with proper column qualification
CREATE OR REPLACE FUNCTION verify_password(p_username TEXT, p_password TEXT)
RETURNS TABLE(user_id UUID, user_religion TEXT, user_username TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    app_users.id,
    app_users.religion,
    app_users.username
  FROM public.app_users
  WHERE app_users.username = p_username
    AND app_users.password_hash = crypt(p_password, app_users.password_hash);
END;
$$;
