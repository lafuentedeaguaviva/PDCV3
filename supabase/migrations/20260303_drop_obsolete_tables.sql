-- Migration: Drop Obsolete Tables
-- Description: Remove tables that are no longer used in the PDC V3 architecture.
-- Tables: adaptaciones, momentos, semana_recurso, recursos, tipos_recurso

-- Drop tables with CASCADE to clean up related policies, triggers, and constraints
DROP TABLE IF EXISTS public.adaptaciones CASCADE;
DROP TABLE IF EXISTS public.momentos CASCADE;
DROP TABLE IF EXISTS public.semana_recurso CASCADE;
DROP TABLE IF EXISTS public.recursos CASCADE;
DROP TABLE IF EXISTS public.tipos_recurso CASCADE;

-- Note: The data in these tables will be permanently deleted.
-- These concepts are now managed as part of the JSONB state in the frontend 
-- or have been superseded by the new PDC V3 structure.
