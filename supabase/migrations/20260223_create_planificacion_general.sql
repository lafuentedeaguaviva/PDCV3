-- =========================================================================
-- MIGRACIÓN: CREACIÓN DE TABLA DE PLANIFICACIÓN SEMANAL GENERAL
-- Fecha: 2026-02-23
-- =========================================================================

-- 1. Crear la tabla
CREATE TABLE IF NOT EXISTS public.planificacion_semanal_general (
    id INTEGER PRIMARY KEY, -- ID Manual
    id_departamento INTEGER NOT NULL REFERENCES public.departamentos(id) ON DELETE CASCADE,
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (fecha_inicio <= fecha_fin)
);

-- 2. Habilitar RLS
ALTER TABLE public.planificacion_semanal_general ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad (Lectura para usuarios autenticados)
DROP POLICY IF EXISTS "Lectura publica planificacion_general" ON public.planificacion_semanal_general;
CREATE POLICY "Lectura publica planificacion_general" 
ON public.planificacion_semanal_general 
FOR SELECT USING (true);

-- 4. Trigger para updated_at (opcional pero recomendado por consistencia)
DROP TRIGGER IF EXISTS trigger_update_psg_updated_at ON public.planificacion_semanal_general;
CREATE TRIGGER trigger_update_psg_updated_at
    BEFORE UPDATE ON public.planificacion_semanal_general
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
