-- Migration to change content IDs to BIGINT
-- Target tables: contenidos_base, contenidos_usuario, semana_contenido

-- 1. Drop existing constraints that depend on the columns to be changed
ALTER TABLE public.contenidos_base 
    DROP CONSTRAINT IF EXISTS contenidos_base_padre_id_fkey;

ALTER TABLE public.contenidos_usuario
    DROP CONSTRAINT IF EXISTS contenidos_usuario_origen_base_id_fkey,
    DROP CONSTRAINT IF EXISTS contenidos_usuario_padre_id_fkey;

ALTER TABLE public.semana_contenido
    DROP CONSTRAINT IF EXISTS semana_contenido_contenido_usuario_id_fkey;

-- 2. Alter column types in contenidos_base
ALTER TABLE public.contenidos_base 
    ALTER COLUMN id TYPE BIGINT,
    ALTER COLUMN padre_id TYPE BIGINT;

-- 3. Alter column types in contenidos_usuario
ALTER TABLE public.contenidos_usuario
    ALTER COLUMN id TYPE BIGINT,
    ALTER COLUMN origen_base_id TYPE BIGINT,
    ALTER COLUMN padre_id TYPE BIGINT;

-- 4. Alter column types in semana_contenido
ALTER TABLE public.semana_contenido
    ALTER COLUMN contenido_usuario_id TYPE BIGINT;

-- 5. Restore constraints
ALTER TABLE public.contenidos_base
    ADD CONSTRAINT contenidos_base_padre_id_fkey 
    FOREIGN KEY (padre_id) REFERENCES public.contenidos_base(id) ON DELETE CASCADE;

ALTER TABLE public.contenidos_usuario
    ADD CONSTRAINT contenidos_usuario_origen_base_id_fkey
    FOREIGN KEY (origen_base_id) REFERENCES public.contenidos_base(id) ON DELETE SET NULL,
    ADD CONSTRAINT contenidos_usuario_padre_id_fkey
    FOREIGN KEY (padre_id) REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE;

ALTER TABLE public.semana_contenido
    ADD CONSTRAINT semana_contenido_contenido_usuario_id_fkey
    FOREIGN KEY (contenido_usuario_id) REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE;

-- Note: We don't need to touch area_trabajo_id as it is UUID.
-- Note: ids in these tables were previously DROP IDENTITY (manual), so no sequences to update.
