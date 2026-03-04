-- 1. Create table `objetivo_estrategico`
CREATE TABLE IF NOT EXISTS public.objetivo_estrategico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdc_id UUID NOT NULL REFERENCES public.pdcs(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_objetivo_estrategico_updated_at ON public.objetivo_estrategico;
CREATE TRIGGER trigger_update_objetivo_estrategico_updated_at
    BEFORE UPDATE ON public.objetivo_estrategico
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Create junction table `objetivo_estrategico_contenido`
CREATE TABLE IF NOT EXISTS public.objetivo_estrategico_contenido (
    objetivo_estrategico_id UUID NOT NULL REFERENCES public.objetivo_estrategico(id) ON DELETE CASCADE,
    contenido_usuario_id INTEGER NOT NULL REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (objetivo_estrategico_id, contenido_usuario_id)
);

-- 3. Security (RLS)
ALTER TABLE public.objetivo_estrategico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivo_estrategico_contenido ENABLE ROW LEVEL SECURITY;

-- Policy for objetivo_estrategico: Docentes can manage their own objectives based on their pdcs
DROP POLICY IF EXISTS "Docentes gestionan sus objetivos estrategicos" ON public.objetivo_estrategico;
CREATE POLICY "Docentes gestionan sus objetivos estrategicos" ON public.objetivo_estrategico
    USING (EXISTS (
        SELECT 1 FROM public.pdcs p 
        WHERE p.id = pdc_id AND p.docente_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.pdcs p 
        WHERE p.id = pdc_id AND p.docente_id = auth.uid()
    ));

-- Policy for objetivo_estrategico_contenido: Docentes can manage associations
DROP POLICY IF EXISTS "Docentes gestionan contenidos de objetivos" ON public.objetivo_estrategico_contenido;
CREATE POLICY "Docentes gestionan contenidos de objetivos" ON public.objetivo_estrategico_contenido
    USING (EXISTS (
        SELECT 1 FROM public.objetivo_estrategico oe
        JOIN public.pdcs p ON oe.pdc_id = p.id
        WHERE oe.id = objetivo_estrategico_id AND p.docente_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.objetivo_estrategico oe
        JOIN public.pdcs p ON oe.pdc_id = p.id
        WHERE oe.id = objetivo_estrategico_id AND p.docente_id = auth.uid()
    ));

-- Grant permissions to authenticated users
GRANT ALL ON TABLE public.objetivo_estrategico TO authenticated;
GRANT ALL ON TABLE public.objetivo_estrategico_contenido TO authenticated;