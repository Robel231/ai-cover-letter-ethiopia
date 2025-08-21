

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "Allow individual user access to their own record" ON public.users;
DROP POLICY IF EXISTS "Allow individual user to update their own record" ON public.users;
DROP POLICY IF EXISTS "Allow individual user to insert their own content" ON public.generated_content;
DROP POLICY IF EXISTS "Allow individual user to select their own content" ON public.generated_content;
DROP POLICY IF EXISTS "Allow individual user to update their own content" ON public.generated_content;
DROP POLICY IF EXISTS "Allow individual user to delete their own content" ON public.generated_content;
DROP POLICY IF EXISTS "Allow authenticated users to select jobs" ON public.jobs;


-- =================================================================
-- Policies for the 'users' table
-- =================================================================

-- 1. Policy: Allow users to see only their own user record.
CREATE POLICY "Allow individual user access to their own record"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Policy: Allow users to update only their own user record.
CREATE POLICY "Allow individual user to update their own record"
ON public.users
FOR UPDATE
TO authenticated
WITH CHECK (auth.uid() = id);


-- =================================================================
-- Policies for the 'generated_content' table
-- =================================================================

-- 1. Policy: Allow users to insert new content linked to their user_id.
CREATE POLICY "Allow individual user to insert their own content"
ON public.generated_content
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Policy: Allow users to select only their own content.
CREATE POLICY "Allow individual user to select their own content"
ON public.generated_content
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Policy: Allow users to update only their own content.
CREATE POLICY "Allow individual user to update their own content"
ON public.generated_content
FOR UPDATE
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Policy: Allow users to delete only their own content.
CREATE POLICY "Allow individual user to delete their own content"
ON public.generated_content
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =================================================================
-- Policies for the 'jobs' table
-- =================================================================

-- 1. Policy: Allow any authenticated (logged-in) user to read all jobs.
--    This table is for public consumption by users of the app.
CREATE POLICY "Allow authenticated users to select jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (true);

-- Note: There are no INSERT, UPDATE, or DELETE policies for the 'jobs' table
-- for the 'authenticated' role. This is intentional. Data manipulation for this
-- table should only be handled by a backend process with elevated privileges
-- (e.g., using the 'service_role' key), not by frontend users.
