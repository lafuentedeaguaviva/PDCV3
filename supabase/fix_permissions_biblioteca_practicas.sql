-- Fix permissions for biblioteca_practicas
-- Run this in Supabase SQL Editor if the library shows empty

-- 1. Enable RLS (in case it's not enabled)
ALTER TABLE biblioteca_practicas ENABLE ROW LEVEL SECURITY;

-- 2. Drop any conflicting policies
DROP POLICY IF EXISTS "Public read access for biblioteca_practicas" ON biblioteca_practicas;
DROP POLICY IF EXISTS "Authenticated read access" ON biblioteca_practicas;

-- 3. Allow ALL authenticated users to read (SELECT only)
CREATE POLICY "Authenticated read access" ON biblioteca_practicas
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. Grant table access to authenticated and anon roles
GRANT SELECT ON biblioteca_practicas TO authenticated;
GRANT SELECT ON biblioteca_practicas TO anon;

-- Verify: should return rows
SELECT id, proposito, tecnica FROM biblioteca_practicas LIMIT 5;
