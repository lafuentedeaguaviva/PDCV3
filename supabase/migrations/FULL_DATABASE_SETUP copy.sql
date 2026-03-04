-- =========================================================================
-- SCRIPT MAESTRO DE BASE DE DATOS - EDUPLAN PRO (PUBLIC SCHEMA EDITION)
-- Fecha: 2026-02-20
-- =========================================================================
-- CONTENIDO:
-- 1. Estructura de tablas (Schema Public)
-- 2. Triggers de automatización
-- 3. Políticas de seguridad (RLS)
-- 4. Datos semilla iniciales
-- =========================================================================
-- DOCUMENTACIÓN DE ESTRUCTURA (ERD Mermaid)
-- =========================================================================
/*
    erDiagram
        perfiles ||--o{ perfil_roles : tiene
        roles ||--o{ perfil_roles : asigna
        departamentos ||--o{ distritos : contiene
        distritos ||--o{ unidades_educativas : contiene
        perfiles ||--o{ unidades_educativas : dirige
        niveles ||--o{ grados : contiene
        grados ||--o{ areas_conocimiento : contiene
        areas_conocimiento ||--o{ contenidos_base : define
        perfiles ||--o{ contenidos_usuario : crea
        areas_trabajo ||--o{ contenidos_usuario : organiza
        areas_trabajo ||--o{ planificacion_semanal : contiene
        planificacion_semanal ||--o{ semana_contenido : detalle
        semana_contenido ||--o{ momentos : metodologico
*/
-- =========================================================================
-- RESUMEN DE MÓDULOS:
-- 1. Usuarios: perfiles, roles, perfil_roles (Idempotente)
-- 2. Organización: departamentos, distritos, unidades_educativas (RN-02: 1 Dir/UE)
-- 3. Académico: niveles, grados, areas_conocimiento (Jerarquía 1:N)
-- 4. Contenidos: contenidos_base (Global) y contenidos_usuario (Privados/Area)
-- 5. Planificación: planificacion_semanal (Header) y semana_contenido (Detail)
-- 6. Apoyo: momentos, recursos, criterios_evaluacion, adaptaciones
-- =========================================================================

-- ============================================
-- 0. CONFIGURACIÓN INICIAL
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Funciones Utilitarias (Públicas)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. ESTRUCTURA DE TABLAS (Todo en PUBLIC)
-- ============================================

-- 1.1. Perfiles y Roles
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT,
    nombres TEXT NOT NULL DEFAULT '',
    apellidos TEXT NOT NULL DEFAULT '',
    email CITEXT NOT NULL,
    celular TEXT,
    foto_url TEXT,
    creditos INTEGER NOT NULL DEFAULT 0,
    estado_completitud BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_perfiles_updated_at ON public.perfiles;
CREATE TRIGGER trigger_update_perfiles_updated_at
    BEFORE UPDATE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.roles (
    nombre TEXT PRIMARY KEY,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.perfil_roles (
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    rol_nombre TEXT REFERENCES public.roles(nombre) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (perfil_id, rol_nombre)
);

-- Helper para verificar roles
CREATE OR REPLACE FUNCTION public.usuario_tiene_rol(p_rol TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfil_roles 
        WHERE perfil_id = auth.uid() AND rol_nombre = p_rol
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.2. Geografía y Administrativo
CREATE TABLE IF NOT EXISTS public.departamentos (
    id INTEGER PRIMARY KEY, -- ID manual (Codigo departamento)
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.distritos (
    id INTEGER PRIMARY KEY, -- ID manual (Codigo distrito)
    nombre TEXT NOT NULL,
    departamento_id INTEGER NOT NULL REFERENCES public.departamentos(id) ON DELETE CASCADE,
    provincia TEXT,
    municipio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre, departamento_id)
);

CREATE TABLE IF NOT EXISTS public.unidades_educativas (
    id INTEGER PRIMARY KEY, -- ID SIE
    nombre TEXT NOT NULL,
    area TEXT,
    nivel TEXT,
    latitud NUMERIC,
    longitud NUMERIC,
    direccion TEXT,
    telefono BIGINT,
    distrito_id INTEGER NOT NULL REFERENCES public.distritos(id) ON DELETE RESTRICT,
    director_id UUID UNIQUE REFERENCES public.perfiles(id) ON DELETE SET NULL, -- RN-02: Un usuario solo un director
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_ue_updated_at ON public.unidades_educativas;
CREATE TRIGGER trigger_update_ue_updated_at
    BEFORE UPDATE ON public.unidades_educativas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.3. Estructura Académica
CREATE TABLE IF NOT EXISTS public.niveles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    nombre TEXT NOT NULL UNIQUE,
    objetivo_holistico TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_niveles_updated_at ON public.niveles;
CREATE TRIGGER trigger_update_niveles_updated_at
    BEFORE UPDATE ON public.niveles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.grados (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    nombre TEXT NOT NULL,
    nivel_id INTEGER NOT NULL REFERENCES public.niveles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre, nivel_id)
);

DROP TRIGGER IF EXISTS trigger_update_grados_updated_at ON public.grados;
CREATE TRIGGER trigger_update_grados_updated_at
    BEFORE UPDATE ON public.grados
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.areas_conocimiento (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    nombre TEXT NOT NULL,
    grado_id INTEGER NOT NULL REFERENCES public.grados(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre, grado_id)
);

DROP TRIGGER IF EXISTS trigger_update_areas_conocimiento_updated_at ON public.areas_conocimiento;
CREATE TRIGGER trigger_update_areas_conocimiento_updated_at
    BEFORE UPDATE ON public.areas_conocimiento
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.paralelos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre)
);

-- 1.4. Áreas de Trabajo
CREATE TABLE IF NOT EXISTS public.areas_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profesor_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    unidad_educativa_id INTEGER NOT NULL REFERENCES public.unidades_educativas(id) ON DELETE CASCADE,
    area_conocimiento_id INTEGER NOT NULL REFERENCES public.areas_conocimiento(id) ON DELETE RESTRICT,
    turno_id UUID NOT NULL REFERENCES public.turnos(id) ON DELETE RESTRICT,
    -- contenido_usuario_id INTEGER REFERENCES public.contenidos_usuario(id) ON DELETE SET NULL, -- Removido para permitir múltiples
    nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (profesor_id, unidad_educativa_id, area_conocimiento_id, turno_id)
);

DROP TRIGGER IF EXISTS trigger_update_areas_trabajo_updated_at ON public.areas_trabajo;
CREATE TRIGGER trigger_update_areas_trabajo_updated_at
    BEFORE UPDATE ON public.areas_trabajo
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_area_trabajo_nombre()
RETURNS TRIGGER AS $$
DECLARE
    v_ue_nombre TEXT;
    v_nivel_nombre TEXT;
    v_grado_nombre TEXT;
    v_area_nombre TEXT;
BEGIN
    -- Obtener nombre de la UE
    SELECT nombre INTO v_ue_nombre 
    FROM public.unidades_educativas 
    WHERE id = NEW.unidad_educativa_id;
    
    -- Obtener nombres de Area, Grado y Nivel
    SELECT ac.nombre, g.nombre, n.nombre 
    INTO v_area_nombre, v_grado_nombre, v_nivel_nombre
    FROM public.areas_conocimiento ac
    JOIN public.grados g ON ac.grado_id = g.id
    JOIN public.niveles n ON g.nivel_id = n.id
    WHERE ac.id = NEW.area_conocimiento_id;

    -- Concaternar: UE - Nivel - Grado - Area
    NEW.nombre := v_ue_nombre || ' - ' || v_nivel_nombre || ' - ' || v_grado_nombre || ' - ' || v_area_nombre;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_area_trabajo_nombre ON public.areas_trabajo;
CREATE TRIGGER trigger_generate_area_trabajo_nombre
    BEFORE INSERT OR UPDATE OF unidad_educativa_id, area_conocimiento_id 
    ON public.areas_trabajo
    FOR EACH ROW EXECUTE FUNCTION public.generate_area_trabajo_nombre();

CREATE TABLE IF NOT EXISTS public.area_trabajo_paralelo (
    area_trabajo_id UUID REFERENCES public.areas_trabajo(id) ON DELETE CASCADE,
    paralelo_id UUID REFERENCES public.paralelos(id) ON DELETE CASCADE,
    horario JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (area_trabajo_id, paralelo_id)
);

DROP TRIGGER IF EXISTS trigger_update_area_trabajo_paralelo_updated_at ON public.area_trabajo_paralelo;
CREATE TRIGGER trigger_update_area_trabajo_paralelo_updated_at
    BEFORE UPDATE ON public.area_trabajo_paralelo
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.5. Contenidos
CREATE TABLE IF NOT EXISTS public.contenidos_base (
    id INTEGER PRIMARY KEY, -- Manual ID
    area_conocimiento_id INTEGER NOT NULL REFERENCES public.areas_conocimiento(id) ON DELETE CASCADE,
    padre_id INTEGER REFERENCES public.contenidos_base(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_contenidos_base_updated_at ON public.contenidos_base;
CREATE TRIGGER trigger_update_contenidos_base_updated_at
    BEFORE UPDATE ON public.contenidos_base
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.contenidos_usuario (
    id INTEGER PRIMARY KEY, -- Manual ID
    propietario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    area_trabajo_id UUID REFERENCES public.areas_trabajo(id) ON DELETE SET NULL, -- 1 Area -> N Contenidos
    origen_base_id INTEGER REFERENCES public.contenidos_base(id) ON DELETE SET NULL,
    padre_id INTEGER REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    orden INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_contenidos_usuario_updated_at ON public.contenidos_usuario;
CREATE TRIGGER trigger_update_contenidos_usuario_updated_at
    BEFORE UPDATE ON public.contenidos_usuario
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.6. Planificación (PDC)
-- Planificación General (Maestro Único Global)
CREATE TABLE IF NOT EXISTS public.planificacion_semanal_general (
    id BIGINT PRIMARY KEY, -- ID compuesto/calculado gestion + trimestre + mes + semana
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 3), -- Mes relativo del trimestre (1, 2 o 3)
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5),
    fecha_inicio_trimestre DATE NOT NULL,
    fecha_fin_trimestre DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (fecha_inicio_trimestre <= fecha_fin_trimestre)
);

DROP TRIGGER IF EXISTS trigger_update_psg_updated_at ON public.planificacion_semanal_general;
CREATE TRIGGER trigger_update_psg_updated_at
    BEFORE UPDATE ON public.planificacion_semanal_general
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cabecera: Define los metadatos de la semana por Area de Trabajo
CREATE TABLE IF NOT EXISTS public.planificacion_semanal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_trabajo_id UUID NOT NULL REFERENCES public.areas_trabajo(id) ON DELETE CASCADE,
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 3), -- Mes relativo del trimestre (1, 2 o 3)
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5),
    fecha_inicio_trimestre DATE NOT NULL,
    fecha_fin_trimestre DATE NOT NULL,
    observaciones_generales TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (area_trabajo_id, gestion, trimestre, mes, semana),
    CHECK (fecha_inicio_trimestre <= fecha_fin_trimestre)
);

DROP TRIGGER IF EXISTS trigger_update_planificacion_semanal_updated_at ON public.planificacion_semanal;
CREATE TRIGGER trigger_update_planificacion_semanal_updated_at
    BEFORE UPDATE ON public.planificacion_semanal
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Detalle: Contenidos específicos planificados para esa semana
CREATE TABLE IF NOT EXISTS public.semana_contenido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planificacion_semanal_id UUID NOT NULL REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    contenido_usuario_id INTEGER NOT NULL REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL DEFAULT 1,
    observaciones TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'planificado', 'completado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (planificacion_semanal_id, contenido_usuario_id)
);

DROP TRIGGER IF EXISTS trigger_update_semana_contenido_updated_at ON public.semana_contenido;
CREATE TRIGGER trigger_update_semana_contenido_updated_at
    BEFORE UPDATE ON public.semana_contenido
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.momentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semana_contenido_id UUID NOT NULL REFERENCES public.semana_contenido(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('practica', 'teoria', 'produccion', 'valoracion')),
    descripcion TEXT,
    orden INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_momentos_updated_at ON public.momentos;
CREATE TRIGGER trigger_update_momentos_updated_at
    BEFORE UPDATE ON public.momentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.7. Recursos
CREATE TABLE IF NOT EXISTS public.tipos_recurso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_id UUID NOT NULL REFERENCES public.tipos_recurso(id),
    titulo TEXT NOT NULL,
    autor TEXT,
    editorial TEXT,
    anio INTEGER,
    isbn TEXT,
    url TEXT,
    otros_datos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_recursos_updated_at ON public.recursos;
CREATE TRIGGER trigger_update_recursos_updated_at
    BEFORE UPDATE ON public.recursos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.semana_recurso (
    semana_contenido_id UUID REFERENCES public.semana_contenido(id) ON DELETE CASCADE,
    recurso_id UUID REFERENCES public.recursos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (semana_contenido_id, recurso_id)
);

-- 1.8. Evaluación y Adaptaciones
CREATE TABLE IF NOT EXISTS public.criterios_evaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_trabajo_id UUID NOT NULL REFERENCES public.areas_trabajo(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    dimension TEXT CHECK (dimension IN ('ser', 'saber', 'hacer')),
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_criterios_evaluacion_updated_at ON public.criterios_evaluacion;
CREATE TRIGGER trigger_update_criterios_evaluacion_updated_at
    BEFORE UPDATE ON public.criterios_evaluacion
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_criterios_area ON public.criterios_evaluacion(area_trabajo_id);

CREATE TABLE IF NOT EXISTS public.adaptaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semana_contenido_id UUID NOT NULL REFERENCES public.semana_contenido(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descripcion TEXT,
    recursos TEXT,
    criterios_adaptados TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_update_adaptaciones_updated_at ON public.adaptaciones;
CREATE TRIGGER trigger_update_adaptaciones_updated_at
    BEFORE UPDATE ON public.adaptaciones
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_adaptaciones_semana ON public.adaptaciones(semana_contenido_id);

-- 1.9. Créditos
CREATE TABLE IF NOT EXISTS public.transacciones_credito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    referencia_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON public.transacciones_credito(usuario_id);

-- 1.10. Catálogos de Objetivos (NUEVO)
CREATE TABLE IF NOT EXISTS public.catalogo_verbos (
    id SERIAL PRIMARY KEY,
    verbo TEXT NOT NULL,
    tipo_verbo_id INTEGER, -- 1: Estratégico, 2: Práctica, 3: Teoría, 4: Producción, 5: Valoración
    detalle_tipo TEXT,
    descripcion TEXT,
    niveles_educativos TEXT[] DEFAULT '{}',
    dominio TEXT CHECK (dominio IN ('Cognitivo', 'Afectivo', 'Psicomotor')),
    nivel_profundidad TEXT CHECK (nivel_profundidad IN ('Básico', 'Intermedio', 'Avanzado', 'Transversal', 'Práctico')),
    ejemplo_indicativo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.catalogo_complementos (
    id SERIAL PRIMARY KEY,
    complemento TEXT NOT NULL,
    tipo_complemento_id INTEGER,
    detalle_tipo TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Índices de Rendimiento (Foreign Keys y Filtros frecuentes)
CREATE INDEX IF NOT EXISTS idx_distritos_departamento ON public.distritos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_ue_distrito ON public.unidades_educativas(distrito_id);
CREATE INDEX IF NOT EXISTS idx_grados_nivel ON public.grados(nivel_id);
CREATE INDEX IF NOT EXISTS idx_areas_grado ON public.areas_conocimiento(grado_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_base_area ON public.contenidos_base(area_conocimiento_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_usuario_propietario ON public.contenidos_usuario(propietario_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_usuario_area ON public.contenidos_usuario(area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_propietario ON public.areas_trabajo(profesor_id);
CREATE INDEX IF NOT EXISTS idx_planificacion_semanal_area ON public.planificacion_semanal(area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_semana_contenido_plan ON public.semana_contenido(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_semana_contenido_content ON public.semana_contenido(contenido_usuario_id);
CREATE INDEX IF NOT EXISTS idx_momentos_semana ON public.momentos(semana_contenido_id);

-- ============================================
-- 3. SEGURIDAD (Row Level Security)
-- ============================================

-- Habilitar RLS en TODAS las tablas
ALTER TABLE public.transacciones_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_verbos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_complementos ENABLE ROW LEVEL SECURITY;


-- 3.1. Políticas de Seguridad (RLS) - COMPLETAS

-- ============================================
-- PERFILES Y ROLES
-- ============================================

DROP POLICY IF EXISTS "Ver propio perfil" ON public.perfiles;
CREATE POLICY "Ver propio perfil" ON public.perfiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Actualizar propio perfil" ON public.perfiles;
CREATE POLICY "Actualizar propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Insertar propio perfil" ON public.perfiles;
CREATE POLICY "Insertar propio perfil" ON public.perfiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins ver todo perfiles" ON public.perfiles;
CREATE POLICY "Admins ver todo perfiles" ON public.perfiles FOR SELECT USING (public.usuario_tiene_rol('Administrador'));

DROP POLICY IF EXISTS "Lectura publica roles" ON public.roles;
CREATE POLICY "Lectura publica roles" ON public.roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Ver mis roles" ON public.perfil_roles;
CREATE POLICY "Ver mis roles" ON public.perfil_roles 
    FOR SELECT USING (perfil_id = auth.uid());

DROP POLICY IF EXISTS "Admins gestionar roles" ON public.perfil_roles;
CREATE POLICY "Admins gestionar roles" ON public.perfil_roles 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- ============================================
-- CATÁLOGOS (Lectura Pública)
-- ============================================

-- Departamentos, Distritos, Unidades Educativas (Lectura pública básica)
DROP POLICY IF EXISTS "Lectura publica geo" ON public.departamentos;
CREATE POLICY "Lectura publica geo" ON public.departamentos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica distritos" ON public.distritos;
CREATE POLICY "Lectura publica distritos" ON public.distritos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica ue" ON public.unidades_educativas;
CREATE POLICY "Lectura publica ue" ON public.unidades_educativas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins gestionar ue" ON public.unidades_educativas;
CREATE POLICY "Admins gestionar ue" ON public.unidades_educativas 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- Estructura Curricular (Niveles, Grados, Areas, Turnos, Paralelos)
DROP POLICY IF EXISTS "Lectura publica niveles" ON public.niveles;
CREATE POLICY "Lectura publica niveles" ON public.niveles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica grados" ON public.grados;
CREATE POLICY "Lectura publica grados" ON public.grados FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica areas" ON public.areas_conocimiento;
CREATE POLICY "Lectura publica areas" ON public.areas_conocimiento FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica turnos" ON public.turnos;
CREATE POLICY "Lectura publica turnos" ON public.turnos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica paralelos" ON public.paralelos;
CREATE POLICY "Lectura publica paralelos" ON public.paralelos FOR SELECT USING (true);

-- Contenidos Base y Recursos (Catálogo global)
DROP POLICY IF EXISTS "Lectura publica contenidos_base" ON public.contenidos_base;
CREATE POLICY "Lectura publica contenidos_base" ON public.contenidos_base FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica tipos_recurso" ON public.tipos_recurso;
CREATE POLICY "Lectura publica tipos_recurso" ON public.tipos_recurso FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura publica recursos" ON public.recursos;
CREATE POLICY "Lectura publica recursos" ON public.recursos FOR SELECT USING (true);

-- Verbos y Complementos (Lectura Pública)
DROP POLICY IF EXISTS "Lectura pública de verbos" ON public.catalogo_verbos;
CREATE POLICY "Lectura pública de verbos" ON public.catalogo_verbos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura pública de complementos" ON public.catalogo_complementos;
CREATE POLICY "Lectura pública de complementos" ON public.catalogo_complementos FOR SELECT USING (true);

-- ============================================
-- GESTIÓN DOCENTE (Privado)
-- ============================================

-- Gestión de Contenidos Usuario (Privado)
-- Contenidos Usuario (PDC Propio)
DROP POLICY IF EXISTS "Gestionar contenidos propios" ON public.contenidos_usuario;
CREATE POLICY "Gestionar contenidos propios" ON public.contenidos_usuario 
    USING (propietario_id = auth.uid())
    WITH CHECK (propietario_id = auth.uid());

DROP POLICY IF EXISTS "Admins ver todo contenidos" ON public.contenidos_usuario;
CREATE POLICY "Admins ver todo contenidos" ON public.contenidos_usuario FOR SELECT USING (public.usuario_tiene_rol('Administrador'));

-- Áreas de Trabajo (Mis clases)
DROP POLICY IF EXISTS "Ver areas trabajo propias" ON public.areas_trabajo;
CREATE POLICY "Ver areas trabajo propias" ON public.areas_trabajo 
    USING (profesor_id = auth.uid())
    WITH CHECK (profesor_id = auth.uid());

-- Detalle Paralelos en Areas (Relación directa)
DROP POLICY IF EXISTS "Gestionar paralelos de areas propias" ON public.area_trabajo_paralelo;
CREATE POLICY "Gestionar paralelos de areas propias" ON public.area_trabajo_paralelo 
    USING (EXISTS (
        SELECT 1 FROM public.areas_trabajo at 
        WHERE at.id = area_trabajo_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.areas_trabajo at 
        WHERE at.id = area_trabajo_id AND at.profesor_id = auth.uid()
    ));

-- Planificación Semanal (Cabecera y Detalle)
DROP POLICY IF EXISTS "Gestionar cabecera planificacion propia" ON public.planificacion_semanal;
CREATE POLICY "Gestionar cabecera planificacion propia" ON public.planificacion_semanal 
    USING (EXISTS (
        SELECT 1 FROM public.areas_trabajo at 
        WHERE at.id = area_trabajo_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.areas_trabajo at 
        WHERE at.id = area_trabajo_id AND at.profesor_id = auth.uid()
    ));

-- Planificación General (Lectura Pública)
DROP POLICY IF EXISTS "Lectura publica planificacion_general" ON public.planificacion_semanal_general;
CREATE POLICY "Lectura publica planificacion_general" 
ON public.planificacion_semanal_general 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Insertar PSG" ON public.planificacion_semanal_general;
CREATE POLICY "Insertar PSG" 
ON public.planificacion_semanal_general 
FOR INSERT TO authenticated 
WITH CHECK (public.usuario_tiene_rol('Administrador'));

DROP POLICY IF EXISTS "Actualizar PSG" ON public.planificacion_semanal_general;
CREATE POLICY "Actualizar PSG" 
ON public.planificacion_semanal_general 
FOR UPDATE TO authenticated 
USING (public.usuario_tiene_rol('Administrador'));

DROP POLICY IF EXISTS "Eliminar PSG" ON public.planificacion_semanal_general;
CREATE POLICY "Eliminar PSG" 
ON public.planificacion_semanal_general 
FOR DELETE TO authenticated 
USING (public.usuario_tiene_rol('Administrador'));

-- Garantizar permisos básicos de la tabla a los roles de Supabase
GRANT ALL ON TABLE public.planificacion_semanal_general TO authenticated;
GRANT ALL ON TABLE public.planificacion_semanal_general TO service_role;
GRANT ALL ON TABLE public.planificacion_semanal_general TO postgres;

DROP POLICY IF EXISTS "Gestionar detalle planificacion propia" ON public.semana_contenido;
CREATE POLICY "Gestionar detalle planificacion propia" ON public.semana_contenido 
    USING (EXISTS (
        SELECT 1 FROM public.planificacion_semanal ps
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE ps.id = planificacion_semanal_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.planificacion_semanal ps
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE ps.id = planificacion_semanal_id AND at.profesor_id = auth.uid()
    ));

-- Momentos Metodológicos (Relación indirecta: SemanaContenido -> Planificacion -> Area)
DROP POLICY IF EXISTS "Gestionar momentos propios" ON public.momentos;
CREATE POLICY "Gestionar momentos propios" ON public.momentos 
    USING (EXISTS (
        SELECT 1 FROM public.semana_contenido sc
        JOIN public.planificacion_semanal ps ON sc.planificacion_semanal_id = ps.id
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE sc.id = semana_contenido_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.semana_contenido sc
        JOIN public.planificacion_semanal ps ON sc.planificacion_semanal_id = ps.id
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE sc.id = semana_contenido_id AND at.profesor_id = auth.uid()
    ));

-- Criterios de Evaluación (Relación directa con Areas)
DROP POLICY IF EXISTS "Gestionar criterios propios" ON public.criterios_evaluacion;
CREATE POLICY "Gestionar criterios propios" ON public.criterios_evaluacion 
    USING (EXISTS (
        SELECT 1 FROM public.areas_trabajo at 
        WHERE at.id = area_trabajo_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.areas_trabajo at 
        WHERE at.id = area_trabajo_id AND at.profesor_id = auth.uid()
    ));

-- Adaptaciones Curriculares (Relación indirecta: Semana -> Area)
DROP POLICY IF EXISTS "Gestionar adaptaciones propias" ON public.adaptaciones;
CREATE POLICY "Gestionar adaptaciones propias" ON public.adaptaciones 
    USING (EXISTS (
        SELECT 1 FROM public.semana_contenido sc
        JOIN public.planificacion_semanal ps ON sc.planificacion_semanal_id = ps.id
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE sc.id = semana_contenido_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.semana_contenido sc
        JOIN public.planificacion_semanal ps ON sc.planificacion_semanal_id = ps.id
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE sc.id = semana_contenido_id AND at.profesor_id = auth.uid()
    ));

-- Recursos en Semana (Relación indirecta: Semana -> Area)
DROP POLICY IF EXISTS "Gestionar recursos semana propios" ON public.semana_recurso;
CREATE POLICY "Gestionar recursos semana propios" ON public.semana_recurso 
    USING (EXISTS (
        SELECT 1 FROM public.semana_contenido sc
        JOIN public.planificacion_semanal ps ON sc.planificacion_semanal_id = ps.id
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE sc.id = semana_contenido_id AND at.profesor_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.semana_contenido sc
        JOIN public.planificacion_semanal ps ON sc.planificacion_semanal_id = ps.id
        JOIN public.areas_trabajo at ON ps.area_trabajo_id = at.id
        WHERE sc.id = semana_contenido_id AND at.profesor_id = auth.uid()
    ));

-- Transacciones de Crédito (Ver propias)
DROP POLICY IF EXISTS "Ver creditos propios" ON public.transacciones_credito;
CREATE POLICY "Ver creditos propios" ON public.transacciones_credito 
    USING (usuario_id = auth.uid());


-- ============================================
-- 3.2. Permisos (Grants) - COMPLETOS
-- ============================================

-- Permisos para el Service Role (Superusuario de Supabase)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Permisos para Anon y Authenticated (RLS manda)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Catálogos (Solo Lectura)
GRANT SELECT ON TABLE 
    public.departamentos,
    public.distritos,
    public.unidades_educativas,
    public.niveles,
    public.grados,
    public.areas_conocimiento,
    public.turnos,
    public.paralelos,
    public.contenidos_base,
    public.contenidos_usuario, -- Necesario para leer compartidos
    public.tipos_recurso,
    public.recursos,
    public.roles,
    public.perfil_roles,
    public.perfiles,
    public.catalogo_verbos,
    public.catalogo_complementos
TO anon, authenticated;

-- Tablas de Usuario (Lectura y Escritura - RLS filtra filas)
GRANT ALL ON TABLE
    public.perfiles,
    public.contenidos_usuario,
    public.areas_trabajo,
    public.area_trabajo_paralelo,
    public.planificacion_semanal,
    public.planificacion_semanal_general,
    public.semana_contenido,
    public.momentos,
    public.semana_recurso,
    public.criterios_evaluacion,
    public.adaptaciones,
    public.transacciones_credito,
    public.catalogo_verbos,
    public.catalogo_complementos
TO authenticated;

-- Secuencias (Necesario para insertar en tablas con serial/identity si las hubiera, aunque usamos UUID)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 5. TRIGGER AUTOMÁTICO PARA REGISTRO (ROBUSTO)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Crear Perfil (Idempotente)
    INSERT INTO public.perfiles (id, email, nombres, apellidos, titulo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombres', ''),
        COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
        'Profesor' -- Default title
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        updated_at = NOW();
    
    -- 2. Asegurar que el rol 'Profesor' existe
    INSERT INTO public.roles (nombre, descripcion)
    VALUES ('Profesor', 'Rol por defecto para nuevos registros')
    ON CONFLICT DO NOTHING;

    -- 3. Asignar Rol por defecto
    INSERT INTO public.perfil_roles (perfil_id, rol_nombre)
    VALUES (NEW.id, 'Profesor')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. DATOS SEMILLA (Iniciales)
-- ============================================

-- Roles: Upsert para asegurar que existan
INSERT INTO public.roles (nombre, descripcion) VALUES
    ('Administrador', 'Acceso total al sistema'),
    ('Director', 'Gestión de unidad educativa y personal'),
    ('Profesor', 'Gestión de aula y PDCs')
ON CONFLICT (nombre) DO UPDATE 
SET descripcion = EXCLUDED.descripcion;

-- Catálogos básicos
INSERT INTO public.turnos (nombre) VALUES ('Mañana'), ('Tarde'), ('Noche') ON CONFLICT DO NOTHING;
INSERT INTO public.paralelos (nombre) VALUES ('A'), ('B'), ('C'), ('D'), ('E') ON CONFLICT DO NOTHING;

-- Departamentos (Bolivia)
INSERT INTO public.departamentos (id, nombre) VALUES
(1, 'CHUQUISACA'),
(2, 'LA PAZ'),
(3, 'COCHABAMBA'),
(4, 'ORURO'),
(5, 'POTOSI'),
(6, 'TARIJA'),
(7, 'SANTA CRUZ'),
(8, 'BENI'),
(9, 'PANDO')
ON CONFLICT (id) DO NOTHING;

-- SEED DATA: ESTRUCTURA ACADÉMICA
-- 1. Niveles
INSERT INTO public.niveles (nombre, objetivo_holistico) VALUES
('Inicial', 'Brindar una educación integral, inclusiva y pertinente a niñas y niños de cero a seis años...'),
('Primaria', 'Formar integralmente a las y los estudiantes mediante el desarrollo de capacidades, habilidades...'),
('Secundaria', 'Lograr la formación humanística, técnica tecnológica, de acuerdo a las vocaciones y potencialidades...')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Grados
-- Inicial
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '1er Año', id FROM public.niveles WHERE nombre = 'Inicial' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '2do Año', id FROM public.niveles WHERE nombre = 'Inicial' ON CONFLICT DO NOTHING;

-- Primaria
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '1ro Primaria', id FROM public.niveles WHERE nombre = 'Primaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '2do Primaria', id FROM public.niveles WHERE nombre = 'Primaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '3ro Primaria', id FROM public.niveles WHERE nombre = 'Primaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '4to Primaria', id FROM public.niveles WHERE nombre = 'Primaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '5to Primaria', id FROM public.niveles WHERE nombre = 'Primaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '6to Primaria', id FROM public.niveles WHERE nombre = 'Primaria' ON CONFLICT DO NOTHING;

-- Secundaria
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '1ro Secundaria', id FROM public.niveles WHERE nombre = 'Secundaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '2do Secundaria', id FROM public.niveles WHERE nombre = 'Secundaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '3ro Secundaria', id FROM public.niveles WHERE nombre = 'Secundaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '4to Secundaria', id FROM public.niveles WHERE nombre = 'Secundaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '5to Secundaria', id FROM public.niveles WHERE nombre = 'Secundaria' ON CONFLICT DO NOTHING;
INSERT INTO public.grados (nombre, nivel_id) 
SELECT '6to Secundaria', id FROM public.niveles WHERE nombre = 'Secundaria' ON CONFLICT DO NOTHING;

-- 3. Áreas de Conocimiento
-- Primaria y Secundaria
INSERT INTO public.areas_conocimiento (nombre, grado_id)
SELECT 'Matemáticas', id FROM public.grados WHERE nombre LIKE '%Primaria' OR nombre LIKE '%Secundaria' ON CONFLICT DO NOTHING;

INSERT INTO public.areas_conocimiento (nombre, grado_id)
SELECT 'Lenguaje', id FROM public.grados WHERE nombre LIKE '%Primaria' OR nombre LIKE '%Secundaria' ON CONFLICT DO NOTHING;

-- Inicial
INSERT INTO public.areas_conocimiento (nombre, grado_id)
SELECT 'Desarrollo Bio-Psicomotriz', id FROM public.grados WHERE nombre LIKE '%Año' ON CONFLICT DO NOTHING;
INSERT INTO public.areas_conocimiento (nombre, grado_id)
SELECT 'Cosmos y Pensamiento', id FROM public.grados WHERE nombre LIKE '%Año' ON CONFLICT DO NOTHING;

-- 4. Catálogos de Objetivos (Semilla)
TRUNCATE TABLE public.catalogo_verbos RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.catalogo_complementos RESTART IDENTITY CASCADE;

INSERT INTO public.catalogo_verbos (verbo, tipo_verbo_id, detalle_tipo, descripcion, niveles_educativos, dominio, nivel_profundidad, ejemplo_indicativo) VALUES
('Definir', 3, 'Recordar', 'Establecer el significado exacto de un concepto.', ARRAY['Secundaria'], 'Cognitivo', 'Básico', 'El estudiante define conceptos clave de la asignatura.'),
('Enumerar', 3, 'Recordar', 'Listar elementos de forma secuencial.', ARRAY['Primaria'], 'Cognitivo', 'Básico', 'El estudiante enumera los pasos del proceso.'),
('Identificar', 3, 'Recordar / Comprender', 'Reconocer y señalar algo específico.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Cognitivo', 'Básico', 'El estudiante identifica los elementos del entorno.'),
('Reconocer', 3, 'Recordar', 'Distinguir información entre varias opciones.', ARRAY['Inicial', 'Primaria'], 'Cognitivo', 'Básico', 'El niño reconoce las letras y sonidos.'),
('Describir', 3, 'Comprender', 'Explicar con detalles características de algo.', ARRAY['Primaria', 'Secundaria'], 'Cognitivo', 'Básico', 'El estudiante describe el funcionamiento del sistema.'),
('Explicar', 3, 'Comprender', 'Hacer comprensible un concepto o proceso.', ARRAY['Secundaria'], 'Cognitivo', 'Básico', 'El estudiante explica las causas del fenómeno.'),
('Resumir', 3, 'Comprender', 'Sintetizar las ideas principales de un texto.', ARRAY['Secundaria'], 'Cognitivo', 'Básico', 'El estudiante resume la idea central del texto.'),
('Relatar', 3, 'Comprender', 'Contar o narrar un hecho o suceso.', ARRAY['Primaria', 'Secundaria'], 'Cognitivo', 'Básico', 'El estudiante relata los hechos acontecidos.'),
('Comparar', 3, 'Comprender / Analizar', 'Señalar semejanzas y diferencias.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante compara diferentes posturas teóricas.'),
('Aplicar', 2, 'Aplicar', 'Poner en práctica un conocimiento.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante aplica los conocimientos técnicos.'),
('Resolver', 2, 'Aplicar', 'Hallar la solución a un problema.', ARRAY['Primaria', 'Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante resuelve problemas complejos.'),
('Demostrar', 2, 'Aplicar', 'Mostrar con hechos la verdad de algo.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante demuestra el teorema propuesto.'),
('Calcular', 2, 'Aplicar', 'Realizar operaciones matemáticas.', ARRAY['Primaria', 'Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante calcula los resultados con precisión.'),
('Construir', 4, 'Aplicar / Crear', 'Fabricar o desarrollar algo siguiendo un plan.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante construye un modelo funcional.'),
('Diferenciar', 3, 'Analizar', 'Distinguir lo que hace algo distinto.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante diferencia los tipos de compuestos.'),
('Analizar', 3, 'Analizar', 'Descomponer un todo en sus partes.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante analiza la estructura del discurso.'),
('Relacionar', 3, 'Analizar', 'Establecer conexiones entre conceptos.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante relaciona la teoría con la práctica.'),
('Categorizar', 3, 'Analizar', 'Clasificar elementos en grupos.', ARRAY['Secundaria'], 'Cognitivo', 'Intermedio', 'El estudiante categoriza la información obtenida.'),
('Argumentar', 1, 'Evaluar', 'Defender una idea con razones.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante argumenta su postura con fundamentos.'),
('Evaluar', 5, 'Evaluar', 'Estimar el valor de algo según criterios.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante evalúa el impacto de la propuesta.'),
('Juzgar', 5, 'Evaluar', 'Formar una opinión basada en análisis.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante juzga la validez de los argumentos.'),
('Criticar', 5, 'Evaluar', 'Analizar razonadamente puntos fuertes y débiles.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante critica constructivamente el proyecto.'),
('Proponer', 1, 'Crear', 'Presentar una idea o solución.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante propone soluciones innovadoras.'),
('Planificar', 1, 'Crear', 'Diseñar un plan detallado para un fin.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante planifica las etapas del proyecto.'),
('Diseñar', 4, 'Crear', 'Concebir las características de algo.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante diseña un prototipo experimental.'),
('Formular', 1, 'Crear', 'Expresar con precisión una idea o hipótesis.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante formula una hipótesis de trabajo.'),
('Crear', 4, 'Crear', 'Producir o generar algo nuevo.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante crea una obra original.'),
('Sintetizar', 3, 'Crear', 'Integrar información de diversas fuentes.', ARRAY['Secundaria'], 'Cognitivo', 'Avanzado', 'El estudiante sintetiza las conclusiones finales.'),
('Valorar', 5, 'Actitudinal', 'Apreciar el valor de algo o alguien.', ARRAY['Secundaria'], 'Afectivo', 'Transversal', 'El estudiante valora el esfuerzo colectivo.'),
('Respetar', 5, 'Actitudinal', 'Tener consideración por los demás.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Afectivo', 'Transversal', 'El estudiante respeta las normas de convivencia.'),
('Participar', 5, 'Actitudinal', 'Tomar parte activa en actividades.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Afectivo', 'Transversal', 'El estudiante participa activamente en clase.'),
('Cooperar', 5, 'Actitudinal', 'Obrar conjuntamente con otros.', ARRAY['Primaria', 'Secundaria'], 'Afectivo', 'Transversal', 'El estudiante coopera con sus compañeros.'),
('Reflexionar', 5, 'Actitudinal', 'Pensar detenidamente sobre algo.', ARRAY['Secundaria'], 'Afectivo', 'Transversal', 'El estudiante reflexiona sobre su aprendizaje.'),
('Tomar decisiones', 5, 'Actitudinal', 'Elegir una option entre varias.', ARRAY['Secundaria'], 'Afectivo', 'Transversal', 'El estudiante toma decisiones responsables.'),
('Manejar', 2, 'Habilidad motriz', 'Usar herramientas o recursos.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante maneja el equipo de laboratorio.'),
('Ejecutar', 2, 'Habilidad motriz', 'Realizar una acción o técnica.', ARRAY['Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante ejecuta los pasos del protocolo.'),
('Representar', 4, 'Habilidad motriz', 'Plasmar ideas a través del cuerpo o gráficos.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante representa el esquema visualmente.'),
('Elaborar', 4, 'Habilidad motriz', 'Producir un producto o prototipo.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante elabora una maqueta descriptiva.'),
('Utilizar', 2, 'Habilidad motriz', 'Emplear algo para un fin.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante utiliza los materiales adecuados.'),
('Manipular', 2, 'Habilidad motriz', 'Operar o tocar algo con las manos.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante manipula los objetos con cuidado.');

INSERT INTO public.catalogo_complementos (complemento, tipo_complemento_id, detalle_tipo, descripcion) VALUES
('para la soberanía alimentaria', 1, 'Finalidad', 'Impacto en la comunidad y seguridad alimentaria'),
('mediante el uso de herramientas TIC', 2, 'Metodología', 'Integración tecnológica en el proceso'),
('en armonía con la Madre Tierra', 5, 'Valores', 'Respeto al medio ambiente y cosmovisiones'),
('a través de la investigación comunitaria', 3, 'Proceso', 'Método de aprendizaje basado en el entorno'),
('fortaleciendo la identidad cultural', 5, 'Valores', 'Enfoque en raíces y tradiciones'),
('para resolver problemas del entorno', 1, 'Finalidad', 'Aplicación práctica de saberes');

-- ============================================

-- 5. ASIGNACIÓN DE ADMINISTRADOR (OPCIONAL)
-- ============================================

-- Ejecuta esto manualmente reemplazando el email
-- INSERT INTO public.perfil_roles (perfil_id, rol_nombre)
-- SELECT id, 'Administrador'
-- FROM public.perfiles
-- WHERE email = 'TU_EMAIL_AQUI' -- <--- Pon tu email aquí
-- ON CONFLICT DO NOTHING;
