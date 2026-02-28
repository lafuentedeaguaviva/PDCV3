-- ==========================================
-- FIX: PERMISOS PARA LA TABLA PDCS
-- Ejecutar esto en el SQL Editor de Supabase
-- ==========================================

-- 1. Asegurar que el esquema public sea accesible
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 2. Otorgar permisos básicos de tabla a los roles de Supabase
GRANT ALL ON TABLE public.pdcs TO authenticated;
GRANT ALL ON TABLE public.pdcs TO service_role;
GRANT ALL ON TABLE public.pdc_cronograma TO authenticated;
GRANT ALL ON TABLE public.pdc_cronograma TO service_role;

-- 3. Asegurar que el RLS esté habilitado y tenga políticas correctas
ALTER TABLE public.pdcs ENABLE ROW LEVEL SECURITY;

-- Política de Lectura (Select)
DROP POLICY IF EXISTS "Docentes pueden ver sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden ver sus propios PDCs" 
ON public.pdcs FOR SELECT 
TO authenticated
USING (auth.uid() = docente_id);

-- Política de Inserción (Insert)
DROP POLICY IF EXISTS "Docentes pueden crear sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden crear sus propios PDCs" 
ON public.pdcs FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = docente_id);

-- Política de Actualización (Update)
DROP POLICY IF EXISTS "Docentes pueden editar sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden editar sus propios PDCs" 
ON public.pdcs FOR UPDATE 
TO authenticated
USING (auth.uid() = docente_id);

-- 4. Repetir para la tabla relacionada de áreas (opcional pero recomendado)
GRANT ALL ON TABLE public.areas_trabajo TO authenticated;
