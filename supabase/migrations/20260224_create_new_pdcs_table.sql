-- =========================================================================
-- MIGRACIÓN: NUEVA ESTRUCTURA PARA PLAN DE DESARROLLO CURRICULAR (PDC)
-- Fecha: 2026-02-24
-- =========================================================================

-- 1. Crear tabla maestra de PDCs
CREATE TABLE IF NOT EXISTS public.pdcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    tipo_pdc_id INTEGER NOT NULL CHECK (tipo_pdc_id BETWEEN 1 AND 4), -- 1: Inicial, 2: Primaria, 3: Secundaria, 4: Multigrado
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Verificado', 'Rechazado')),
    director_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    observaciones_director TEXT,
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (fecha_inicio <= fecha_fin)
);

-- 2. Crear tabla espejo de cronograma (PDC Cronograma)
CREATE TABLE IF NOT EXISTS public.pdc_cronograma (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdc_id UUID NOT NULL REFERENCES public.pdcs(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (fecha_inicio <= fecha_fin)
);

-- 3. Actualizar areas_trabajo para relación 1:N con PDC
-- Un PDC tiene muchas áreas, pero cada área pertenece a un solo PDC activo
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='areas_trabajo' AND column_name='pdc_id') THEN
        ALTER TABLE public.areas_trabajo ADD COLUMN pdc_id UUID REFERENCES public.pdcs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Habilitar RLS
ALTER TABLE public.pdcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdc_cronograma ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Seguridad para PDCS
DROP POLICY IF EXISTS "Docentes pueden ver sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden ver sus propios PDCs" 
    ON public.pdcs FOR SELECT 
    USING (auth.uid() = docente_id);

DROP POLICY IF EXISTS "Docentes pueden crear sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden crear sus propios PDCs" 
    ON public.pdcs FOR INSERT 
    WITH CHECK (auth.uid() = docente_id);

DROP POLICY IF EXISTS "Docentes pueden editar sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden editar sus propios PDCs" 
    ON public.pdcs FOR UPDATE 
    USING (auth.uid() = docente_id);

DROP POLICY IF EXISTS "Docentes pueden eliminar sus propios PDCs" ON public.pdcs;
CREATE POLICY "Docentes pueden eliminar sus propios PDCs" 
    ON public.pdcs FOR DELETE 
    USING (auth.uid() = docente_id);

-- 6. Políticas de Seguridad para PDC_CRONOGRAMA
DROP POLICY IF EXISTS "Docentes pueden ver sus cronogramas de PDC" ON public.pdc_cronograma;
CREATE POLICY "Docentes pueden ver sus cronogramas de PDC" 
    ON public.pdc_cronograma FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.pdcs WHERE id = pdc_cronograma.pdc_id AND docente_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Docentes pueden gestionar sus cronogramas de PDC" ON public.pdc_cronograma;
CREATE POLICY "Docentes pueden gestionar sus cronogramas de PDC" 
    ON public.pdc_cronograma FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.pdcs WHERE id = pdc_cronograma.pdc_id AND docente_id = auth.uid()
    ));

-- 7. Triggers para updated_at
DROP TRIGGER IF EXISTS trigger_update_pdcs_updated_at ON public.pdcs;
CREATE TRIGGER trigger_update_pdcs_updated_at
    BEFORE UPDATE ON public.pdcs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_pdc_cronograma_updated_at ON public.pdc_cronograma;
CREATE TRIGGER trigger_update_pdc_cronograma_updated_at
    BEFORE UPDATE ON public.pdc_cronograma
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
