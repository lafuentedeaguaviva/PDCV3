-- =========================================================================
-- MIGRACIÓN: ACTUALIZAR ESTRUCTURA DE LÍMITES DE TRIMESTRE
-- Fecha: 2026-02-23
-- =========================================================================

-- 1. Limpiar datos existentes (ya que el formato de mes y fechas cambia radicalmente)
DELETE FROM public.planificacion_semanal;
DELETE FROM public.planificacion_semanal_general;

-- 2. Actualizar tabla public.planificacion_semanal_general
ALTER TABLE public.planificacion_semanal_general 
ADD COLUMN IF NOT EXISTS fecha_inicio_trimestre DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_trimestre DATE;

-- Opcional: Migrar datos si existen (aunque el usuario dijo que prefiere generarlos de nuevo)
-- UPDATE public.planificacion_semanal_general SET fecha_inicio_trimestre = fecha_inicio, fecha_fin_trimestre = fecha_fin;

-- Eliminar columnas antiguas y actualizar restricciones
ALTER TABLE public.planificacion_semanal_general 
DROP COLUMN IF EXISTS fecha_inicio,
DROP COLUMN IF EXISTS fecha_fin;

ALTER TABLE public.planificacion_semanal_general 
DROP CONSTRAINT IF EXISTS planificacion_semanal_general_mes_check,
ADD CONSTRAINT planificacion_semanal_general_mes_check CHECK (mes BETWEEN 1 AND 3);

-- 2. Actualizar tabla public.planificacion_semanal (Maestro de Docente)
ALTER TABLE public.planificacion_semanal 
ADD COLUMN IF NOT EXISTS fecha_inicio_trimestre DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_trimestre DATE;

ALTER TABLE public.planificacion_semanal 
DROP COLUMN IF EXISTS fecha_inicio,
DROP COLUMN IF EXISTS fecha_fin;

ALTER TABLE public.planificacion_semanal 
DROP CONSTRAINT IF EXISTS planificacion_semanal_mes_check,
ADD CONSTRAINT planificacion_semanal_mes_check CHECK (mes BETWEEN 1 AND 3);
