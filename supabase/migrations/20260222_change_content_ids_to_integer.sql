-- Migration to change content IDs to manual INTEGER
-- 1. Drop identity from contenidos_base
ALTER TABLE public.contenidos_base ALTER COLUMN id DROP IDENTITY;

-- 2. Drop identity from contenidos_usuario
ALTER TABLE public.contenidos_usuario ALTER COLUMN id DROP IDENTITY;

-- 3. Ensure foreign keys in other tables are correctly typed as INTEGER (already should be based on FULL_DATABASE_SETUP.sql)
-- But for safety, we re-assert them if this were a lived migration.
-- Since the user specified "manual", no further identity logic is needed.
