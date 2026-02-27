-- =========================================================================
-- SCRIPT MAESTRO: CONFIGURACIÓN INTEGRAL DE CATÁLOGOS (PDC V3)
-- Este script crea las tablas, configura RLS y carga los datos maestros.
-- =========================================================================

-- 1. LIMPIEZA PREVIA (Opcional, habilita si quieres un reset total)
-- DROP TABLE IF EXISTS public.catalogo_verbos CASCADE;
-- DROP TABLE IF EXISTS public.catalogo_complementos CASCADE;

-- 2. CREACIÓN DE TABLAS
-- Catalogo de Verbos (Con Metadatos)
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

-- Catalogo de Complementos
CREATE TABLE IF NOT EXISTS public.catalogo_complementos (
    id SERIAL PRIMARY KEY,
    complemento TEXT NOT NULL,
    categoria TEXT,
    subcategoria TEXT,
    niveles_sugeridos TEXT[] DEFAULT '{}',
    ejemplo_uso TEXT,
    tipo_complemento_id INTEGER, -- Legacy sorting/grouping
    detalle_tipo TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEGURIDAD (Row Level Security)
ALTER TABLE public.catalogo_verbos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_complementos ENABLE ROW LEVEL SECURITY;

-- Políticas para Verbos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalogo_verbos' AND policyname = 'Lectura pública de verbos') THEN
        CREATE POLICY "Lectura pública de verbos" ON public.catalogo_verbos FOR SELECT USING (true);
    END IF;
END $$;

-- Políticas para Complementos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catalogo_complementos' AND policyname = 'Lectura pública de complementos') THEN
        CREATE POLICY "Lectura pública de complementos" ON public.catalogo_complementos FOR SELECT USING (true);
    END IF;
END $$;

-- 4. CARGA DE DATOS MAESTROS
TRUNCATE TABLE public.catalogo_verbos RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.catalogo_complementos RESTART IDENTITY CASCADE;

-- Insertar Verbos Detallados (Metadatos completos)
INSERT INTO public.catalogo_verbos (verbo, tipo_verbo_id, detalle_tipo, descripcion, niveles_educativos, dominio, nivel_profundidad, ejemplo_indicativo) VALUES
-- NIVEL: BÁSICO (Recordar / Comprender)
('Definir', 3, 'Recordar', 'Establecer el significado exacto de un concepto.', ARRAY['Secundaria'], 'Cognitivo', 'Básico', 'El estudiante define conceptos clave de la asignatura.'),
('Enumerar', 3, 'Recordar', 'Listar elementos de forma secuencial.', ARRAY['Primaria'], 'Cognitivo', 'Básico', 'El estudiante enumera los pasos del proceso.'),
('Identificar', 3, 'Recordar / Comprender', 'Reconocer y señalar algo específico.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Cognitivo', 'Básico', 'El estudiante identifica los elementos del entorno.'),
('Reconocer', 3, 'Recordar', 'Distinguir información entre varias opciones.', ARRAY['Inicial', 'Primaria'], 'Cognitivo', 'Básico', 'El niño reconoce las letras y sonidos.'),
('Describir', 3, 'Comprender', 'Explicar con detalles características de algo.', ARRAY['Primaria', 'Secundaria'], 'Cognitivo', 'Básico', 'El estudiante describe el funcionamiento del sistema.'),
('Explicar', 3, 'Comprender', 'Hacer comprensible un concepto o proceso.', ARRAY['Secundaria'], 'Cognitivo', 'Básico', 'El estudiante explica las causas del fenómeno.'),
('Resumir', 3, 'Comprender', 'Sintetizar las ideas principales de un texto.', ARRAY['Secundaria'], 'Cognitivo', 'Básico', 'El estudiante resume la idea central del texto.'),
('Relatar', 3, 'Comprender', 'Contar o narrar un hecho o suceso.', ARRAY['Primaria', 'Secundaria'], 'Cognitivo', 'Básico', 'El estudiante relata los hechos acontecidos.'),

-- NIVEL: INTERMEDIO (Aplicar / Analizar)
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

-- NIVEL: AVANZADO (Evaluar / Crear)
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

-- TRANSVERSAL / ACTITUDINAL (Afectivo)
('Valorar', 5, 'Actitudinal', 'Apreciar el valor de algo o alguien.', ARRAY['Secundaria'], 'Afectivo', 'Transversal', 'El estudiante valora el esfuerzo colectivo.'),
('Respetar', 5, 'Actitudinal', 'Tener consideración por los demás.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Afectivo', 'Transversal', 'El estudiante respeta las normas de convivencia.'),
('Participar', 5, 'Actitudinal', 'Tomar parte activa en actividades.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Afectivo', 'Transversal', 'El estudiante participa activamente en clase.'),
('Cooperar', 5, 'Actitudinal', 'Obrar conjuntamente con otros.', ARRAY['Primaria', 'Secundaria'], 'Afectivo', 'Transversal', 'El estudiante coopera con sus compañeros.'),
('Reflexionar', 5, 'Actitudinal', 'Pensar detenidamente sobre algo.', ARRAY['Secundaria'], 'Afectivo', 'Transversal', 'El estudiante reflexiona sobre su aprendizaje.'),
('Tomar decisiones', 5, 'Actitudinal', 'Elegir una opción entre varias.', ARRAY['Secundaria'], 'Afectivo', 'Transversal', 'El estudiante toma decisiones responsables.'),

-- PRÁCTICO (Psicomotor)
('Manejar', 2, 'Habilidad motriz', 'Usar herramientas o recursos.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante maneja el equipo de laboratorio.'),
('Ejecutar', 2, 'Habilidad motriz', 'Realizar una acción o técnica.', ARRAY['Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante ejecuta los pasos del protocolo.'),
('Representar', 4, 'Habilidad motriz', 'Plasmar ideas a través del cuerpo o gráficos.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante representa el esquema visualmente.'),
('Elaborar', 4, 'Habilidad motriz', 'Producir un producto o prototipo.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante elabora una maqueta descriptiva.'),
('Utilizar', 2, 'Habilidad motriz', 'Emplear algo para un fin.', ARRAY['Inicial', 'Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante utiliza los materiales adecuados.'),
('Manipular', 2, 'Habilidad motriz', 'Operar o tocar algo con las manos.', ARRAY['Primaria', 'Secundaria'], 'Psicomotor', 'Práctico', 'El estudiante manipula los objetos con cuidado.');

-- Insertar Complementos Sugeridos (Dataset Expandido)
INSERT INTO public.catalogo_complementos (categoria, subcategoria, complemento, niveles_sugeridos, ejemplo_uso) VALUES
-- COGNITIVAS
('COGNITIVAS', 'Comprensión', '...para comprender conceptos fundamentales', ARRAY['Primaria', 'Secundaria'], '...para comprender conceptos fundamentales de la geografía.'),
('COGNITIVAS', 'Comprensión', '...para interpretar información', ARRAY['Secundaria'], '...para interpretar información de fuentes históricas.'),
('COGNITIVAS', 'Comprensión', '...para explicar fenómenos', ARRAY['Secundaria'], '...para explicar fenómenos naturales observados.'),
('COGNITIVAS', 'Comprensión', '...para relacionar ideas', ARRAY['Secundaria'], '...para relacionar ideas entre diferentes textos.'),
('COGNITIVAS', 'Análisis', '...para analizar críticamente', ARRAY['Secundaria'], '...para analizar críticamente mensajes mediáticos.'),
('COGNITIVAS', 'Análisis', '...para diferenciar conceptos', ARRAY['Primaria', 'Secundaria'], '...para diferenciar conceptos científicos básicos.'),
('COGNITIVAS', 'Análisis', '...para comparar perspectivas', ARRAY['Secundaria'], '...para comparar perspectivas sobre un mismo hecho.'),
('COGNITIVAS', 'Síntesis', '...para sintetizar información', ARRAY['Secundaria'], '...para sintetizar información de múltiples fuentes.'),
('COGNITIVAS', 'Síntesis', '...para organizar conocimientos', ARRAY['Primaria', 'Secundaria'], '...para organizar conocimientos adquiridos.'),
('COGNITIVAS', 'Síntesis', '...para integrar aprendizajes', ARRAY['Secundaria'], '...para integrar aprendizajes de diferentes áreas.'),
('COGNITIVAS', 'Evaluación', '...para evaluar resultados', ARRAY['Secundaria'], '...para evaluar resultados de un experimento.'),
('COGNITIVAS', 'Evaluación', '...para juzgar críticamente', ARRAY['Secundaria'], '...para juzgar críticamente argumentos presentados.'),
('COGNITIVAS', 'Evaluación', '...para valorar evidencias', ARRAY['Secundaria'], '...para valorar evidencias en investigaciones.'),
-- PRÁCTICAS
('PRÁCTICAS', 'Aplicación', '...para aplicar conocimientos', ARRAY['Primaria', 'Secundaria'], '...para aplicar conocimientos en situaciones reales.'),
('PRÁCTICAS', 'Aplicación', '...para resolver problemas', ARRAY['Primaria', 'Secundaria'], '...para resolver problemas de su entorno.'),
('PRÁCTICAS', 'Aplicación', '...para utilizar herramientas', ARRAY['Primaria', 'Secundaria'], '...para utilizar herramientas tecnológicas.'),
('PRÁCTICAS', 'Aplicación', '...para poner en práctica', ARRAY['Primaria', 'Secundaria'], '...para poner en práctica lo aprendido.'),
('PRÁCTICAS', 'Creación', '...para crear productos nuevos', ARRAY['Primaria', 'Secundaria'], '...para crear productos innovadores.'),
('PRÁCTICAS', 'Creación', '...para elaborar propuestas', ARRAY['Secundaria'], '...para elaborar propuestas de mejora.'),
('PRÁCTICAS', 'Creación', '...para diseñar proyectos', ARRAY['Secundaria'], '...para diseñar proyectos comunitarios.'),
('PRÁCTICAS', 'Creación', '...para construir modelos', ARRAY['Primaria', 'Secundaria'], '...para construir modelos explicativos.'),
('PRÁCTICAS', 'Experimentación', '...para experimentar procesos', ARRAY['Primaria', 'Secundaria'], '...para experimentar procesos científicos.'),
('PRÁCTICAS', 'Experimentación', '...para comprobar hipótesis', ARRAY['Secundaria'], '...para comprobar hipótesis planteadas.'),
('PRÁCTICAS', 'Experimentación', '...para demostrar teoremas', ARRAY['Secundaria'], '...para demostrar teoremas matemáticos.'),
-- VALÓRICAS
('VALÓRICAS', 'Ética', '...para valorar la diversidad', ARRAY['Primaria', 'Secundaria'], '...para valorar la diversidad cultural.'),
('VALÓRICAS', 'Ética', '...para respetar diferencias', ARRAY['Inicial', 'Primaria'], '...para respetar las diferencias individuales.'),
('VALÓRICAS', 'Ética', '...para apreciar el patrimonio', ARRAY['Primaria', 'Secundaria'], '...para apreciar el patrimonio cultural.'),
('VALÓRICAS', 'Ética', '...para tomar conciencia', ARRAY['Secundaria'], '...para tomar conciencia de problemas sociales.'),
('VALÓRICAS', 'Identidad', '...para fortalecer su identidad', ARRAY['Primaria', 'Secundaria'], '...para fortalecer su identidad cultural.'),
('VALÓRICAS', 'Identidad', '...para reconocer sus raíces', ARRAY['Primaria', 'Secundaria'], '...para reconocer sus raíces históricas.'),
('VALÓRICAS', 'Identidad', '...para sentirse parte de', ARRAY['Inicial', 'Primaria'], '...para sentirse parte de su comunidad.'),
('VALÓRICAS', 'Responsabilidad', '...para asumir compromisos', ARRAY['Primaria', 'Secundaria'], '...para asumir compromisos con el medio ambiente.'),
('VALÓRICAS', 'Responsabilidad', '...para cumplir normas', ARRAY['Inicial', 'Primaria'], '...para cumplir normas de convivencia.'),
('VALÓRICAS', 'Responsabilidad', '...para cuidar el entorno', ARRAY['Inicial', 'Primaria'], '...para cuidar el entorno natural.'),
-- SOCIALES
('SOCIALES', 'Convivencia', '...para convivir armónicamente', ARRAY['Inicial', 'Primaria'], '...para convivir armónicamente con los demás.'),
('SOCIALES', 'Convivencia', '...para participar activamente', ARRAY['Primaria', 'Secundaria'], '...para participar activamente en su comunidad.'),
('SOCIALES', 'Convivencia', '...para cooperar con otros', ARRAY['Inicial', 'Primaria'], '...para cooperar con otros en trabajos grupales.'),
('SOCIALES', 'Convivencia', '...para compartir experiencias', ARRAY['Inicial', 'Primaria'], '...para compartir experiencias de aprendizaje.'),
('SOCIALES', 'Ciudadanía', '...para ejercer ciudadanía', ARRAY['Secundaria'], '...para ejercer una ciudadanía responsable.'),
('SOCIALES', 'Ciudadanía', '...para involucrarse socialmente', ARRAY['Secundaria'], '...para involucrarse en causas sociales.'),
('SOCIALES', 'Ciudadanía', '...para contribuir al bien común', ARRAY['Secundaria'], '...para contribuir al bien común.'),
('SOCIALES', 'Diálogo', '...para dialogar respetuosamente', ARRAY['Primaria', 'Secundaria'], '...para dialogar respetuosamente sobre diferencias.'),
('SOCIALES', 'Diálogo', '...para escuchar activamente', ARRAY['Primaria', 'Secundaria'], '...para escuchar activamente a sus pares.'),
('SOCIALES', 'Diálogo', '...para resolver conflictos', ARRAY['Primaria', 'Secundaria'], '...para resolver conflictos pacíficamente.'),
-- COMUNICATIVAS
('COMUNICATIVAS', 'Expresión', '...para expresar ideas', ARRAY['Inicial', 'Primaria'], '...para expresar ideas con claridad.'),
('COMUNICATIVAS', 'Expresión', '...para comunicar sentimientos', ARRAY['Inicial', 'Primaria'], '...para comunicar sentimientos y emociones.'),
('COMUNICATIVAS', 'Expresión', '...para manifestar opiniones', ARRAY['Primaria', 'Secundaria'], '...para manifestar opiniones fundamentadas.'),
('COMUNICATIVAS', 'Argumentación', '...para argumentar posturas', ARRAY['Secundaria'], '...para argumentar posturas personales.'),
('COMUNICATIVAS', 'Argumentación', '...para defender puntos de vista', ARRAY['Secundaria'], '...para defender puntos de vista con razones.'),
('COMUNICATIVAS', 'Argumentación', '...para debatir constructivamente', ARRAY['Secundaria'], '...para debatir constructivamente sobre temas controversiales.'),
('COMUNICATIVAS', 'Creación literaria', '...para narrar historias', ARRAY['Primaria', 'Secundaria'], '...para narrar historias de su comunidad.'),
('COMUNICATIVAS', 'Creación literaria', '...para describir experiencias', ARRAY['Primaria'], '...para describir experiencias personales.'),
('COMUNICATIVAS', 'Creación literaria', '...para producir textos', ARRAY['Primaria', 'Secundaria'], '...para producir textos creativos.'),
-- METACOGNITIVAS
('METACOGNITIVAS', 'Autoconocimiento', '...para reflexionar sobre su aprendizaje', ARRAY['Secundaria'], '...para reflexionar sobre su propio proceso de aprendizaje.'),
('METACOGNITIVAS', 'Autoconocimiento', '...para autoevaluar su desempeño', ARRAY['Secundaria'], '...para autoevaluar su desempeño académico.'),
('METACOGNITIVAS', 'Autoconocimiento', '...para reconocer fortalezas', ARRAY['Primaria', 'Secundaria'], '...para reconocer sus fortalezas y debilidades.'),
('METACOGNITIVAS', 'Autorregulación', '...para regular sus emociones', ARRAY['Primaria', 'Secundaria'], '...para regular sus emociones en situaciones de conflicto.'),
('METACOGNITIVAS', 'Autorregulación', '...para planificar estrategias', ARRAY['Secundaria'], '...para planificar estrategias de estudio.'),
('METACOGNITIVAS', 'Autorregulación', '...para monitorear avances', ARRAY['Secundaria'], '...para monitorear sus propios avances.'),
-- CIENTÍFICAS
('CIENTÍFICAS', 'Indagación', '...para indagar fenómenos', ARRAY['Primaria', 'Secundaria'], '...para indagar fenómenos naturales de su entorno.'),
('CIENTÍFICAS', 'Indagación', '...para investigar causas', ARRAY['Secundaria'], '...para investigar causas de problemas ambientales.'),
('CIENTÍFICAS', 'Indagación', '...para explorar hipótesis', ARRAY['Secundaria'], '...para explorar hipótesis sobre experimentos.'),
('CIENTÍFICAS', 'Explicación científica', '...para explicar científicamente', ARRAY['Secundaria'], '...para explicar científicamente observaciones.'),
('CIENTÍFICAS', 'Explicación científica', '...para comprender leyes', ARRAY['Secundaria'], '...para comprender leyes y principios científicos.'),
('CIENTÍFICAS', 'Explicación científica', '...para modelar procesos', ARRAY['Secundaria'], '...para modelar procesos biológicos.'),
-- MATEMÁTICAS
('MATEMÁTICAS', 'Razonamiento lógico', '...para desarrollar pensamiento lógico', ARRAY['Primaria', 'Secundaria'], '...para desarrollar pensamiento lógico-matemático.'),
('MATEMÁTICAS', 'Razonamiento lógico', '...para razonar abstractamente', ARRAY['Secundaria'], '...para razonar abstractamente sobre problemas.'),
('MATEMÁTICAS', 'Resolución', '...para resolver situaciones problemáticas', ARRAY['Primaria', 'Secundaria'], '...para resolver situaciones problemáticas cotidianas.'),
('MATEMÁTICAS', 'Resolución', '...para encontrar soluciones', ARRAY['Primaria', 'Secundaria'], '...para encontrar soluciones a desafíos matemáticos.'),
('MATEMÁTICAS', 'Modelación', '...para modelar situaciones reales', ARRAY['Secundaria'], '...para modelar situaciones reales con expresiones matemáticas.'),
-- TECNOLÓGICAS
('TECNOLÓGICAS', 'Uso de TIC', '...para utilizar herramientas digitales', ARRAY['Primaria', 'Secundaria'], '...para utilizar herramientas digitales en su aprendizaje.'),
('TECNOLÓGICAS', 'Uso de TIC', '...para manejar recursos tecnológicos', ARRAY['Primaria', 'Secundaria'], '...para manejar recursos tecnológicos disponibles.'),
('TECNOLÓGICAS', 'Creación digital', '...para crear contenidos digitales', ARRAY['Secundaria'], '...para crear contenidos digitales educativos.'),
('TECNOLÓGICAS', 'Creación digital', '...para diseñar recursos multimedia', ARRAY['Secundaria'], '...para diseñar recursos multimedia interactivos.'),
('TECNOLÓGICAS', 'Ciudadanía digital', '...para usar responsablemente', ARRAY['Secundaria'], '...para usar responsablemente las tecnologías.'),
('TECNOLÓGICAS', 'Ciudadanía digital', '...para protegerse en línea', ARRAY['Secundaria'], '...para protegerse en entornos virtuales.'),
-- ARTÍSTICAS
('ARTÍSTICAS', 'Expresión artística', '...para expresarse artísticamente', ARRAY['Inicial', 'Primaria'], '...para expresarse artísticamente mediante diferentes lenguajes.'),
('ARTÍSTICAS', 'Expresión artística', '...para desarrollar creatividad', ARRAY['Inicial', 'Primaria'], '...para desarrollar su creatividad e imaginación.'),
('ARTÍSTICAS', 'Apreciación', '...para apreciar manifestaciones artísticas', ARRAY['Primaria', 'Secundaria'], '...para apreciar manifestaciones artísticas locales.'),
('ARTÍSTICAS', 'Apreciación', '...para valorar el arte', ARRAY['Primaria', 'Secundaria'], '...para valorar el arte de su cultura.'),
('ARTÍSTICAS', 'Creación artística', '...para crear obras artísticas', ARRAY['Primaria', 'Secundaria'], '...para crear obras artísticas con diversos materiales.'),
('ARTÍSTICAS', 'Creación artística', '...para interpretar musicalmente', ARRAY['Primaria', 'Secundaria'], '...para interpretar musicalmente canciones tradicionales.'),
-- AMBIENTALES
('AMBIENTALES', 'Conciencia ecológica', '...para tomar conciencia ambiental', ARRAY['Primaria', 'Secundaria'], '...para tomar conciencia sobre el cuidado del medio ambiente.'),
('AMBIENTALES', 'Conciencia ecológica', '...para valorar la naturaleza', ARRAY['Inicial', 'Primaria'], '...para valorar la naturaleza y sus recursos.'),
('AMBIENTALES', 'Acción', '...para cuidar el medio ambiente', ARRAY['Primaria', 'Secundaria'], '...para cuidar el medio ambiente en su comunidad.'),
('AMBIENTALES', 'Acción', '...para preservar recursos', ARRAY['Primaria', 'Secundaria'], '...para preservar los recursos naturales.'),
('AMBIENTALES', 'Sostenibilidad', '...para promover sostenibilidad', ARRAY['Secundaria'], '...para promover prácticas sostenibles en su entorno.'),
('AMBIENTALES', 'Sostenibilidad', '...para actuar responsablemente', ARRAY['Secundaria'], '...para actuar responsablemente con el planeta.'),
-- EMOCIONALES
('EMOCIONALES', 'Reconocimiento', '...para identificar emociones', ARRAY['Inicial', 'Primaria'], '...para identificar sus propias emociones.'),
('EMOCIONALES', 'Reconocimiento', '...para reconocer sentimientos', ARRAY['Inicial', 'Primaria'], '...para reconocer sentimientos en los demás.'),
('EMOCIONALES', 'Regulación', '...para manejar emociones', ARRAY['Primaria', 'Secundaria'], '...para manejar adecuadamente sus emociones.'),
('EMOCIONALES', 'Regulación', '...para controlar impulsos', ARRAY['Primaria', 'Secundaria'], '...para controlar impulsos en situaciones difíciles.'),
('EMOCIONALES', 'Empatía', '...para mostrar empatía', ARRAY['Primaria', 'Secundaria'], '...para mostrar empatía hacia sus compañeros.'),
('EMOCIONALES', 'Empatía', '...para comprender a otros', ARRAY['Primaria', 'Secundaria'], '...para comprender las emociones de los demás.'),
-- FÍSICAS
('FÍSICAS', 'Desarrollo motor', '...para desarrollar habilidades motoras', ARRAY['Inicial', 'Primaria'], '...para desarrollar habilidades motoras básicas.'),
('FÍSICAS', 'Desarrollo motor', '...para mejorar coordinación', ARRAY['Inicial', 'Primaria'], '...para mejorar su coordinación psicomotriz.'),
('FÍSICAS', 'Salud', '...para mantener vida saludable', ARRAY['Primaria', 'Secundaria'], '...para mantener un estilo de vida saludable.'),
('FÍSICAS', 'Salud', '...para cuidar su cuerpo', ARRAY['Primaria', 'Secundaria'], '...para cuidar su cuerpo mediante el ejercicio.'),
('FÍSICAS', 'Expresión corporal', '...para expresarse corporalmente', ARRAY['Inicial', 'Primaria'], '...para expresarse corporalmente con libertad.'),
('FÍSICAS', 'Expresión corporal', '...para comunicar con el cuerpo', ARRAY['Primaria', 'Secundaria'], '...para comunicar ideas a través del movimiento.');

-- =========================================================================
-- FIN DEL SCRIPT
-- =========================================================================
