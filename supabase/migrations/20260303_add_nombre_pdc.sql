    -- Migration: Add nombre_pdc to pdcs table
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS nombre_pdc TEXT;

    -- Update existing records if needed (optional, could be empty)
    -- UPDATE public.pdc SET nombre_pdc = nombre WHERE nombre_pdc IS NULL;
