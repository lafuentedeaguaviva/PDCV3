-- 1. Garantizar permisos básicos de la tabla a los roles de Supabase
GRANT ALL ON TABLE public.planificacion_semanal_general TO authenticated;
GRANT ALL ON TABLE public.planificacion_semanal_general TO service_role;
GRANT ALL ON TABLE public.planificacion_semanal_general TO postgres;

-- 2. Asegurar que RLS esté activo
ALTER TABLE public.planificacion_semanal_general ENABLE ROW LEVEL SECURITY;

-- 3. Permitir lectura para todos los autenticados (necesario para profesores)
DROP POLICY IF EXISTS "Lectura publica planificacion_general" ON public.planificacion_semanal_general;
CREATE POLICY "Lectura publica planificacion_general" 
ON public.planificacion_semanal_general FOR SELECT TO authenticated USING (true);

-- 4. Permitir inserción a administradores
DROP POLICY IF EXISTS "Insertar planificacion_general administradores" ON public.planificacion_semanal_general;
CREATE POLICY "Insertar planificacion_general administradores" 
ON public.planificacion_semanal_general 
FOR INSERT TO authenticated
WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 5. Permitir actualización a administradores
DROP POLICY IF EXISTS "Actualizar planificacion_general administradores" ON public.planificacion_semanal_general;
CREATE POLICY "Actualizar planificacion_general administradores" 
ON public.planificacion_semanal_general 
FOR UPDATE TO authenticated
USING (public.usuario_tiene_rol('Administrador'))
WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 6. Permitir eliminación a administradores
DROP POLICY IF EXISTS "Eliminar planificacion_general administradores" ON public.planificacion_semanal_general;
CREATE POLICY "Eliminar planificacion_general administradores" 
ON public.planificacion_semanal_general 
FOR DELETE TO authenticated
USING (public.usuario_tiene_rol('Administrador'));
