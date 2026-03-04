-- Remove the tables and their dependencies
DROP TABLE IF EXISTS public.objetivo_estrategico_contenido CASCADE;
DROP TABLE IF EXISTS public.objetivo_estrategico CASCADE;

-- Remove the trigger function
DROP TRIGGER IF EXISTS trigger_update_objetivo_estrategico_updated_at ON public.objetivo_estrategico;