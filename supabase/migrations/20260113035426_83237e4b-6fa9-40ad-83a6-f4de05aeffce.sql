-- Drop the existing restrictive SELECT policies and create a public one
DROP POLICY IF EXISTS "Users can view own requests" ON prayer_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON prayer_requests;

-- Create a public SELECT policy that allows everyone to see non-deleted requests
CREATE POLICY "Anyone can view public requests" 
ON prayer_requests 
FOR SELECT 
USING (
  (is_deleted = false OR is_deleted IS NULL)
);

-- Note: The get_public_prayer_requests function handles the anonymization of user data