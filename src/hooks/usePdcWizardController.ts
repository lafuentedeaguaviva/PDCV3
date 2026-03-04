import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AreasService } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { PdcService } from '@/services/pdc.service';
import { supabase } from '@/lib/supabase';
import { useFeedback } from './useFeedback';
import {
    AreaTrabajo,
    PDCMaster,
    CatalogoVerbo,
    CatalogoComplemento,
    LearningObjective,
    UserContent,
    WeekDesign,
    AreaDesignState,
    PlanificacionSemanal,
    AreaConocimiento
} from '@/types';

export const PDC_TYPES = [
    { id: 1, name: 'Inicial', icon: 'child_care', color: 'rose-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-100', shadowColor: 'shadow-rose-500/10' },
    { id: 2, name: 'Primaria', icon: 'school', color: 'amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-500', borderColor: 'border-amber-100', shadowColor: 'shadow-amber-500/10' },
    { id: 3, name: 'Secundaria', icon: 'menu_book', color: 'indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100', shadowColor: 'shadow-indigo-500/10' },
    { id: 4, name: 'Multigrado', icon: 'group_work', color: 'emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-100', shadowColor: 'shadow-emerald-500/10' },
];

export function usePdcWizardController() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlId = searchParams.get('id');
    const { feedback, showError, showSuccess, hideFeedback } = useFeedback();

    // --- Navigation & UI State ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentPdcId, setCurrentPdcId] = useState<string | null>(null);
    const [pdcName, setPdcName] = useState('');
    const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
    const [areasDesignState, setAreasDesignState] = useState<Record<string, AreaDesignState>>({});

    // --- Reference Data (Context) ---
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [recentPdcs, setRecentPdcs] = useState<PDCMaster[]>([]);
    const [userProfile, setUserProfile] = useState<{ nombre_completo: string } | null>(null);
    const [mainAreaDetails, setMainAreaDetails] = useState<AreaTrabajo | null>(null);

    // --- Form State: Phase 1 (Modality & Areas) ---
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    // --- Form State: Phase 2 (Schedule) ---
    const [selectedTrimestre, setSelectedTrimestre] = useState<number | null>(null);
    const [selectedMes, setSelectedMes] = useState<number | null>(null);
    const [pdcDates, setPdcDates] = useState({ inicio: '', fin: '' });
    const [pdcWeeks, setPdcWeeks] = useState<Partial<PlanificacionSemanal>[]>([]);

    // --- Form State: Phase 3 (PDC Design) ---
    const [catalogoVerbos, setCatalogoVerbos] = useState<CatalogoVerbo[]>([]);
    const [catalogoComplementos, setCatalogoComplementos] = useState<CatalogoComplemento[]>([]);
    const [availableContents, setAvailableContents] = useState<UserContent[]>([]);
    const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
    const [weekContentsMap, setWeekContentsMap] = useState<Record<number, UserContent[]>>({});
    const [objetivoNivel, setObjetivoNivel] = useState('');
    const [weekDesignState, setWeekDesignState] = useState<Record<number, WeekDesign>>({});
    const [finalProductState, setFinalProductState] = useState('');
    const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(0);
    const [weeklyHours, setWeeklyHours] = useState<number>(0);

    // Internal Step 3 State (Objectives Generator)
    const [currentObjective, setCurrentObjective] = useState({
        verboIds: [] as number[],
        contentIds: [] as number[],
        complementId: null as number | null,
        complement: '',
        draft: '',
        isManual: false
    });
    const [aiOptions, setAiOptions] = useState<{ id: number, title: string, description: string, style: string }[]>([]);
    const [manualObjective, setManualObjective] = useState({
        quiero: '',
        paraQue: '',
        medire: ''
    });
    const [generatorMode, setGeneratorMode] = useState<'auto' | 'manual'>('auto');
    const [verbFilters, setVerbFilters] = useState({
        niveles: [] as string[],
        dominio: '' as string,
        profundidad: '' as string
    });
    const [showFilters, setShowFilters] = useState(false);
    const [hoveredVerb, setHoveredVerb] = useState<CatalogoVerbo | null>(null);
    const [expandedTitles, setExpandedTitles] = useState<number[]>([]);
    const [selectedCompCategory, setSelectedCompCategory] = useState<string>('');
    const [complementSearch, setComplementSearch] = useState<string>('');
    const [hoveredComplement, setHoveredComplement] = useState<CatalogoComplemento | null>(null);

    // --- Ciclo de Vida ---
    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!loading && urlId && recentPdcs.length > 0) {
            const pdcToResume = recentPdcs.find(p => p.id === urlId);
            if (pdcToResume) {
                resumePdc(pdcToResume);
            }
        }
    }, [loading, urlId, recentPdcs]);

    useEffect(() => {
        if (selectedType) {
            setSelectedAreas([]);
        }
    }, [selectedType]);

    useEffect(() => {
        if (step === 2 && selectedTrimestre && selectedMes) {
            loadGlobalSchedule();
        }
    }, [step, selectedTrimestre, selectedMes]);

    useEffect(() => {
        if (step >= 4 && selectedAreas.length > 0) {
            loadStep3Data(); // Ahora Step 3 data es para pasos 4-10
        }
    }, [step, currentAreaIndex, selectedAreas]);

    useEffect(() => {
        if (!currentObjective.isManual) {
            synthesizeObjective();
        }
    }, [currentObjective.verboIds, currentObjective.contentIds, currentObjective.complementId, currentObjective.complement, catalogoVerbos, availableContents, catalogoComplementos]);

    // --- Acciones de Datos ---

    const loadInitialData = async () => {
        try {
            const { data: { session } } = await AuthService.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('perfiles')
                    .select('nombres, apellidos, email')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    const fullName = `${profile.nombres || ''} ${profile.apellidos || ''}`.trim();
                    setUserProfile({
                        nombre_completo: fullName || profile.email.split('@')[0] || 'Docente'
                    });
                }

                const results = await AreasService.getAreas(session.user.id);
                setAreas(results);

                const pdcs = await PdcService.getPDCs(session.user.id);
                setRecentPdcs(pdcs);
            }
        } catch (error) {
            console.error('Controller Error [loadInitialData]:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadGlobalSchedule = async () => {
        if (!selectedTrimestre || !selectedMes) return;
        try {
            const gestion = new Date().getFullYear();
            const { data } = await supabase
                .from('planificacion_semanal_general')
                .select('*')
                .eq('gestion', gestion)
                .eq('trimestre', selectedTrimestre)
                .eq('mes', selectedMes)
                .order('semana', { ascending: true });

            if (data && data.length > 0) {
                const mappedData = data.map((w: any) => ({
                    ...w,
                    fecha_inicio: w.fecha_inicio_trimestre || '',
                    fecha_fin: w.fecha_fin_trimestre || ''
                }));
                setPdcWeeks(mappedData);

                const startDates = mappedData.filter((w: any) => w.fecha_inicio).map((w: any) => w.fecha_inicio);
                const endDates = mappedData.filter((w: any) => w.fecha_fin).map((w: any) => w.fecha_fin);

                if (startDates.length > 0 && endDates.length > 0) {
                    setPdcDates({
                        inicio: [...startDates].sort()[0],
                        fin: [...endDates].sort().reverse()[0]
                    });
                }
            }
        } catch (error) {
            console.error('Controller Error [loadGlobalSchedule]:', error);
        }
    };

    const saveCurrentAreaState = () => {
        const areaId = selectedAreas[currentAreaIndex];
        if (!areaId) return;

        setAreasDesignState(prev => ({
            ...prev,
            [areaId]: {
                learningObjectives: [...learningObjectives],
                generatorMode,
                currentObjective: { ...currentObjective },
                manualObjective: { ...manualObjective },
                weekContentsMap: { ...weekContentsMap },
                availableContents: [...availableContents],
                weekDesignState: { ...weekDesignState },
                finalProduct: finalProductState
            }
        }));
    };

    const loadStep3Data = async () => {
        const areaId = selectedAreas[currentAreaIndex];
        if (!areaId) return;

        // Si ya tenemos el estado en memoria para esta área, lo restauramos primero para "Vibe" instantáneo
        if (areasDesignState[areaId]) {
            const state = areasDesignState[areaId];
            setLearningObjectives(state.learningObjectives || []);
            setGeneratorMode(state.generatorMode || 'auto');
            setCurrentObjective(state.currentObjective || { verboIds: [], contentIds: [], complementId: null, complement: '', draft: '', isManual: false });
            setManualObjective(state.manualObjective || { quiero: '', paraQue: '', medire: '' });
            setWeekContentsMap(state.weekContentsMap || {});
            setAvailableContents(state.availableContents || []);
            setWeekDesignState(state.weekDesignState || {});
            setFinalProductState(state.finalProduct || '');
        }

        try {
            // Actualizar detalles del área actual para DataReferential
            const details = await AreasService.getAreaById(areaId);
            setMainAreaDetails(details);

            const [verbsRes, compsRes] = await Promise.all([
                supabase.from('catalogo_verbos').select('*').order('tipo_verbo_id').order('verbo'),
                supabase.from('catalogo_complementos').select('*').order('tipo_complemento_id').order('complemento')
            ]);

            if (verbsRes.data) setCatalogoVerbos(verbsRes.data);
            if (compsRes.data) setCatalogoComplementos(compsRes.data);

            const currentYear = new Date().getFullYear();
            const { data: planningHeaders } = await supabase
                .from('planificacion_semanal')
                .select('id, semana')
                .eq('area_trabajo_id', areaId)
                .eq('trimestre', selectedTrimestre)
                .eq('mes', selectedMes)
                .eq('gestion', currentYear);

            if (planningHeaders && planningHeaders.length > 0) {
                const headerIds = planningHeaders.map(h => h.id);
                const { data: weekContents } = await supabase
                    .from('semana_contenido')
                    .select('contenido_usuario_id, planificacion_semanal_id')
                    .in('planificacion_semanal_id', headerIds);

                if (weekContents && weekContents.length > 0) {
                    const contentIds = Array.from(new Set(weekContents.map((wc: any) => wc.contenido_usuario_id)));
                    const { data: contents } = await supabase
                        .from('contenidos_usuario')
                        .select('*')
                        .in('id', contentIds)
                        .order('padre_id', { ascending: false, nullsFirst: true })
                        .order('orden', { ascending: true });

                    if (contents) {
                        setAvailableContents(contents);
                        const grouped: Record<number, UserContent[]> = {};
                        planningHeaders.forEach((header: any) => {
                            const semanalContents = weekContents
                                .filter((wc: any) => wc.planificacion_semanal_id === header.id)
                                .map((wc: any) => contents.find((c: UserContent) => Number(c.id) == Number(wc.contenido_usuario_id)))
                                .filter((c): c is UserContent => !!c);
                            grouped[header.semana] = semanalContents;
                        });
                        setWeekContentsMap(grouped);
                    } else if (!areasDesignState[areaId]) {
                        setAvailableContents([]);
                        setWeekContentsMap({});
                    }
                } else if (!areasDesignState[areaId]) {
                    setAvailableContents([]);
                    setWeekContentsMap({});
                }
            } else if (!areasDesignState[areaId]) {
                setAvailableContents([]);
                setWeekContentsMap({});
            }
        } catch (error) {
            console.error('Controller Error [loadStep3Data]:', error);
        }
    };

    const loadObjetivoNivel = async () => {
        try {
            const { data } = await supabase
                .from('niveles')
                .select('objetivo_holistico')
                .eq('id', 3) // Secundaria
                .single();
            if (data?.objetivo_holistico) setObjetivoNivel(data.objetivo_holistico);
        } catch (error) {
            console.error('Controller Error [loadObjetivoNivel]:', error);
        }
    };

    // --- Lógica de Negocio ---

    const synthesizeObjective = () => {
        const selectedVerbs = catalogoVerbos
            .filter((v: CatalogoVerbo) => currentObjective.verboIds.includes(v.id))
            .map((v: CatalogoVerbo) => v.verbo);

        const selectedContents = availableContents
            .filter((c: UserContent) => currentObjective.contentIds.includes(c.id))
            .map((c: UserContent) => c.titulo || '');

        const complementText = currentObjective.complement ||
            (currentObjective.complementId ? catalogoComplementos.find((c: CatalogoComplemento) => c.id === currentObjective.complementId)?.complemento : '');

        if (selectedVerbs.length === 0) {
            setCurrentObjective(prev => ({ ...prev, draft: '' }));
            return;
        }

        let verbsPart = selectedVerbs.join(' y ');
        let contentsPart = selectedContents.length > 0 ? ` ${selectedContents.join(', ')}` : '';
        let complementPart = complementText ? ` ${complementText}` : '';

        const fullDraft = (verbsPart + contentsPart + complementPart).trim();
        const formattedDraft = fullDraft.charAt(0).toUpperCase() + fullDraft.slice(1);

        setCurrentObjective(prev => ({ ...prev, draft: formattedDraft }));
    };

    const generateAIObjective = () => {
        const selectedVerbs = catalogoVerbos
            .filter((v: CatalogoVerbo) => currentObjective.verboIds.includes(v.id))
            .map((v: CatalogoVerbo) => v.verbo)
            .join(' y ');

        const selectedContentsArr = availableContents
            .filter((c: UserContent) => currentObjective.contentIds.includes(c.id))
            .map((c: UserContent) => c.titulo.toLowerCase());

        const selectedContents = selectedContentsArr.join(', ');
        const catalogComplement = catalogoComplementos.find((c: CatalogoComplemento) => c.id === currentObjective.complementId)?.complemento || '';
        const finalComplement = catalogComplement || currentObjective.complement;

        if (!selectedVerbs || selectedContentsArr.length === 0) return;

        const baseDraft = `${selectedVerbs} ${selectedContents} ${finalComplement}`.trim();
        const capitalized = baseDraft.charAt(0).toUpperCase() + baseDraft.slice(1);

        const options = [
            { id: 1, title: '🔥 OPCIÓN 1 (MÁS USADA)', description: `${capitalized} de manera integral para fortalecer el desarrollo de capacidades creativas...`, style: 'MÁS USADA' },
            { id: 2, title: '🚀 OPCIÓN 2 (RECOMENDADA)', description: `Desarrollar y ${baseDraft} mediante el uso de herramientas tecnológicas...`, style: 'RECOMENDADA' }
            // ... more options
        ];

        setAiOptions(options);
        setCurrentObjective(prev => ({ ...prev, draft: options[0].description + '.', isManual: false }));
    };

    const addStrategicObjective = () => {
        if (!currentObjective.draft) return;
        setLearningObjectives(prev => [...prev, {
            text: currentObjective.draft,
            contentIds: currentObjective.contentIds
        }]);
        setCurrentObjective({
            verboIds: [],
            contentIds: [],
            complementId: null,
            complement: '',
            draft: '',
            isManual: false
        });
    };

    // --- Navegación ---

    const handleNext = async () => {
        if (step === 1) {
            if (selectedType && selectedAreas.length > 0) setStep(2);
        } else if (step === 2) {
            if (selectedTrimestre && selectedMes) {
                // Generar nombre por defecto basado en los requerimientos del usuario:
                // Primera palabra del área + Mes + Trimestre + Gestión
                // Concatenar los nombres de TODAS las áreas seleccionadas
                const allAreaNames = selectedAreas
                    .map(areaId => areas.find(a => a.id === areaId)?.area_conocimiento?.nombre)
                    .filter(Boolean)
                    .join(' / ') || 'PDC';
                const currentYear = new Date().getFullYear();
                const generatedName = `PDC ${allAreaNames.toUpperCase()} - MES ${selectedMes} - TRIM ${selectedTrimestre} - ${currentYear}`;
                if (!pdcName) setPdcName(generatedName);

                setStep(3);
            }
        } else if (step === 3) {
            setSaving(true);
            try {
                const { data: user } = await supabase.auth.getUser();
                if (!user.user) throw new Error('No auth user');

                let pdcId = currentPdcId;
                const currentYear = new Date().getFullYear();
                const pdcData: Partial<PDCMaster> = {
                    docente_id: user.user.id,
                    tipo_pdc_id: selectedType || 2, // Default to Primaria if null
                    gestion: currentYear,
                    trimestre: selectedTrimestre || 1,
                    mes: selectedMes || 1,
                    fecha_inicio: pdcDates.inicio,
                    fecha_fin: pdcDates.fin,
                    estado: 'Pendiente',
                    nombre_pdc: pdcName || 'Nuevo PDC'
                };

                if (!pdcId) {
                    const result = await PdcService.createPdcMaster(pdcData);
                    if (result.error) throw result.error;
                    pdcId = result.data?.id || null;
                    if (!pdcId) throw new Error('No se recibió ID del PDC creado');
                    setCurrentPdcId(pdcId);
                } else {
                    const result = await PdcService.updatePdcMaster(pdcId, pdcData);
                    if (result.error) throw result.error;
                }

                if (pdcId) {
                    const result = await PdcService.associateAreasToPdc(pdcId, selectedAreas);
                    if (result.error) throw result.error;

                    const details = await AreasService.getAreaById(selectedAreas[0]);
                    setMainAreaDetails(details);
                    setStep(4);
                }
            } catch (error: any) {
                console.error('Persistence Error [Step 3]:', error);
                alert(`Error: ${error.message || 'No se pudo crear el PDC.'}`);
            } finally {
                setSaving(false);
            }
        } else if (step >= 4 && step < 10) {
            if (step === 4 && selectedType === 3) loadObjetivoNivel();

            // Validación especial para el paso 6: todos los contenidos deben estar cubiertos
            if (step === 6) {
                const usedContentIds = new Set(learningObjectives.flatMap(obj => obj.contentIds));
                const parentContents = availableContents.filter(c => !c.padre_id);
                const uncoveredContents = parentContents.filter(c => !usedContentIds.has(c.id));
                if (uncoveredContents.length > 0) {
                    const names = uncoveredContents.map(c => `• ${c.titulo}`).join('\n');
                    alert(`Todos los contenidos deben estar asociados a un objetivo guardado.\n\nContenidos pendientes:\n${names}`);
                    return;
                }
            }

            setStep(step + 1);

        } else if (step === 10) {
            const isLastArea = currentAreaIndex === selectedAreas.length - 1;
            if (!isLastArea) {
                saveCurrentAreaState();
                setCurrentAreaIndex(prev => prev + 1);
                setStep(4); // Volver al inicio del ciclo de diseño para la siguiente área
            } else {
                alert('PDC Completado con éxito');
                router.push('/dashboard/pdcs');
            }
        }
    };

    const handleBack = () => {
        if (step > 4) {
            setStep(step - 1);
        } else if (step === 4) {
            if (currentAreaIndex > 0) {
                saveCurrentAreaState();
                setCurrentAreaIndex(prev => prev - 1);
                setStep(10); // Ir al último paso del área anterior
            } else {
                setStep(3);
            }
        } else if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const toggleAreaSelection = (id: string) => {
        setSelectedAreas(prev => {
            // Regla: PDC Secundaria (id: 3) solo permite una área
            if (selectedType === 3) {
                return prev.includes(id) ? [] : [id];
            }
            // Otras modalidades permiten selección múltiple
            return prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id];
        });
    };

    // --- Helpers de UI ---
    const sortedVerbos = [...catalogoVerbos].filter((v: CatalogoVerbo) => {
        if (verbFilters.niveles.length > 0) {
            if (!v.niveles_educativos) return false;
            if (!verbFilters.niveles.some((n: string) => v.niveles_educativos?.includes(n))) return false;
        }
        if (verbFilters.dominio && v.dominio !== verbFilters.dominio) return false;
        if (verbFilters.profundidad && v.nivel_profundidad !== verbFilters.profundidad) return false;
        return true;
    }).sort((a, b) => a.verbo.localeCompare(b.verbo));

    const complementCategories = Array.from(new Set(catalogoComplementos.map((c: CatalogoComplemento) => c.categoria)));

    const filteredComplementos = catalogoComplementos.filter((c: CatalogoComplemento) => {
        if (selectedCompCategory && c.categoria !== selectedCompCategory) return false;
        if (complementSearch) {
            const search = complementSearch.toLowerCase();
            return c.complemento.toLowerCase().includes(search) ||
                c.subcategoria.toLowerCase().includes(search);
        }
        return true;
    });

    const resumePdc = async (pdc: PDCMaster) => {
        setSaving(true);
        try {
            setCurrentPdcId(pdc.id);
            setSelectedType(pdc.tipo_pdc_id);
            setSelectedTrimestre(pdc.trimestre || null);
            setSelectedMes(pdc.mes || null);
            setPdcDates({
                inicio: pdc.fecha_inicio || '',
                fin: pdc.fecha_fin || ''
            });

            // Mapear áreas vinculadas si existen
            if (pdc.areas_trabajo && pdc.areas_trabajo.length > 0) {
                const areaIds = pdc.areas_trabajo.map(a => a.id);
                setSelectedAreas(areaIds);

                const details = await AreasService.getAreaById(areaIds[0]);
                setMainAreaDetails(details);
            }

            loadStep3Data();
            setStep(4); // Iniciar en el primer paso de diseño
        } catch (error) {
            console.error('Controller Error [resumePdc]:', error);
            alert('No se pudo reanudar el PDC.');
        } finally {
            setSaving(false);
        }
    };

    const jumpToArea = (index: number) => {
        if (index === currentAreaIndex) return;
        saveCurrentAreaState();
        setCurrentAreaIndex(index);
        // Si ya estamos en la fase de diseño (step >= 4), mantenemos el paso relativo
        if (step >= 4) {
            // No resetear step, solo cambiar de área
        }
    };

    const addWeek = () => {
        const lastWeek = pdcWeeks.length > 0 ? pdcWeeks[pdcWeeks.length - 1] : null;
        const newWeekNumber = (lastWeek?.semana || 0) + 1;
        setPdcWeeks(prev => [...prev, {
            id: `temp-${Date.now()}`,
            semana: newWeekNumber,
            mes: selectedMes ?? undefined,
            trimestre: selectedTrimestre ?? undefined,
            gestion: new Date().getFullYear(),
            fecha_inicio: '',
            fecha_fin: ''
        }]);
    };

    const removeLastWeek = () => {
        if (pdcWeeks.length > 1) {
            setPdcWeeks((prev: Partial<PlanificacionSemanal>[]) => prev.slice(0, -1));
        }
    };

    const handlePdcDatesChange = (field: 'inicio' | 'fin', value: string) => {
        setPdcDates(prev => ({ ...prev, [field]: value }));
    };

    const toggleNivelFilter = (nivel: string) => {
        setVerbFilters((prev: any) => ({
            ...prev,
            niveles: prev.niveles.includes(nivel)
                ? prev.niveles.filter((n: string) => n !== nivel)
                : [...prev.niveles, nivel]
        }));
    };

    const improveManualWithAI = async () => {
        // Mocking AI improvement for now
        const text = `Mejorando con IA: Desarrollar ${manualObjective.quiero} con el fin de que ${manualObjective.paraQue} a través de ${manualObjective.medire}.`;
        const options = [
            { id: 1, title: 'IA MEJORADO', description: text, style: 'RECOMENDADA' }
        ];
        setAiOptions(options);
    };

    const handleStepNext = () => handleNext();
    const handleStepBack = () => handleBack();

    const filteredAreas = areas.filter((area: AreaTrabajo) => {
        if (!selectedType) return true;
        const nivelNombre = (area.area_conocimiento as AreaConocimiento).grado?.nivel?.nombre?.toLowerCase() || '';
        if (selectedType === 1) return nivelNombre.includes('inicial');
        if (selectedType === 2) return nivelNombre.includes('primaria');
        if (selectedType === 3) return nivelNombre.includes('secundaria');
        return true;
    });

    const getStepName = () => {
        const steps: Record<number, string> = {
            1: 'Modalidad y Áreas',
            2: 'Cronograma y Fechas',
            3: 'Confirmación y Nombre',
            4: 'Datos Referenciales',
            5: 'Objetivo Holístico de Nivel',
            6: 'Objetivos de Aprendizaje',
            7: 'Semanas y Contenidos',
            8: 'Momentos del proceso formativo',
            9: 'Periodos y Carga Horaria',
            10: 'Finalización para Revisión IA',
        };
        return steps[step] || 'Asistente';
    };

    return {
        // Estado
        step,
        loading,
        saving,
        currentPdcId,
        currentAreaIndex,
        areasDesignState,
        areas,
        filteredAreas,
        userProfile,
        mainAreaDetails,
        selectedType,
        selectedAreas,
        selectedTrimestre,
        selectedMes,
        pdcDates,
        pdcWeeks,
        catalogoVerbos,
        catalogoComplementos,
        availableContents,
        learningObjectives,
        weekContentsMap,
        objetivoNivel,
        currentObjective,
        aiOptions,
        manualObjective,
        generatorMode,
        verbFilters,
        showFilters,
        hoveredVerb,
        expandedTitles,
        selectedCompCategory,
        complementSearch,
        hoveredComplement,
        sortedVerbos,
        complementCategories,
        filteredComplementos,
        recentPdcs,
        weekDesignState,
        finalProductState,
        pdcName,
        periodsPerWeek,
        weeklyHours,

        // Setters
        setSelectedType,
        setSelectedTrimestre,
        setSelectedMes,
        setPdcDates,
        setPdcWeeks,
        setLearningObjectives,
        setObjetivoNivel,
        setCurrentObjective,
        setManualObjective,
        setGeneratorMode,
        setVerbFilters,
        setShowFilters,
        setHoveredVerb,
        setExpandedTitles,
        setSelectedCompCategory,
        setComplementSearch,
        setHoveredComplement,
        setWeekDesignState,
        setFinalProductState,
        setPdcName,
        setPeriodsPerWeek,
        setWeeklyHours,

        // Acciones
        handleNext: handleStepNext,
        handleBack: handleStepBack,
        toggleAreaSelection,
        generateAIObjective,
        addStrategicObjective,
        getStepName,
        getTotalSteps: () => 10,
        addWeek,
        removeLastWeek,
        handlePdcDatesChange,
        toggleNivelFilter,
        improveManualWithAI,
        resumePdc,
        jumpToArea
    };
}
