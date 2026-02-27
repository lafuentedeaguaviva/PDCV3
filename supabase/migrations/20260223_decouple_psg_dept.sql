-- =========================================================================
-- MIGRACIÓN: DESVINCULAR CRONOGRAMA GENERAL DE DEPARTAMENTOS
-- Fecha: 2026-02-23
-- =========================================================================

-- 1. Eliminar la restricción de llave foránea y la columna
ALTER TABLE public.planificacion_semanal_general 
DROP CONSTRAINT IF EXISTS planificacion_semanal_general_id_departamento_fkey;

ALTER TABLE public.planificacion_semanal_general 
DROP COLUMN IF EXISTS id_departamento;

-- 2. Asegurar que el ID sea único pero no dependa de departamento
-- (Opcional: Si queremos que el ID sea autoincremental en el futuro, 
-- pero por ahora mantendremos el manejo manual desde el servicio para evitar conflictos de migración)

-- 3. Actualizar políticas de RLS para que no dependan de departamento (ya lo hacen)
-- Las políticas actuales usan public.usuario_tiene_rol('Administrador') que es correcto.
