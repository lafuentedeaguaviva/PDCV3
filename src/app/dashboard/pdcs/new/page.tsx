'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AreasService, AreaTrabajo } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';

const PDC_TYPES = [
    { id: 1, name: 'Inicial', icon: 'child_care', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { id: 2, name: 'Primaria', icon: 'school', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 3, name: 'Secundaria', icon: 'menu_book', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { id: 4, name: 'Multigrado', icon: 'group_work', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
];

export default function NewPdcPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [selectedTrimestre, setSelectedTrimestre] = useState<number | null>(null);
    const [selectedMes, setSelectedMes] = useState<number | null>(null);
    const [pdcDates, setPdcDates] = useState({ inicio: '', fin: '' });
    const [pdcWeeks, setPdcWeeks] = useState<any[]>([]);

    // Phase 3 Internal Steps State
    const [pdcStep, setPdcStep] = useState(1);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [mainAreaDetails, setMainAreaDetails] = useState<AreaTrabajo | null>(null);

    // Step 3 (Objetivos de Aprendizaje) Advanced State
    const [catalogoVerbos, setCatalogoVerbos] = useState<any[]>([]);
    const [catalogoComplementos, setCatalogoComplementos] = useState<any[]>([]);
    const [availableContents, setAvailableContents] = useState<any[]>([]);
    const [learningObjectives, setLearningObjectives] = useState<any[]>([]);
    const [currentObjective, setCurrentObjective] = useState({
        verboIds: [] as number[],
        contentIds: [] as number[],
        complementId: null as number | null,
        complement: '',
        draft: '',
        isManual: false // Flag to stop auto-synthesis if user edited manually
    });
    const [aiOptions, setAiOptions] = useState<any[]>([]);
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
    const [hoveredVerb, setHoveredVerb] = useState<any | null>(null);
    const [expandedTitles, setExpandedTitles] = useState<number[]>([]);
    const [selectedCompCategory, setSelectedCompCategory] = useState<string>('');
    const [complementSearch, setComplementSearch] = useState<string>('');
    const [hoveredComplement, setHoveredComplement] = useState<any | null>(null);

    // Step 4 (Semanas y Contenidos) State
    const [weekContentsMap, setWeekContentsMap] = useState<Record<number, any[]>>({});

    // Step 2 & 7 State
    const [objetivoNivel, setObjetivoNivel] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const { data: { session } } = await AuthService.getSession();
            if (session?.user) {
                // Load profile for Step 1 Table
                const { data: profile, error: profileError } = await supabase
                    .from('perfiles')
                    .select('nombres, apellidos, email')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    const fullName = `${profile.nombres || ''} ${profile.apellidos || ''}`.trim();
                    setUserProfile({
                        nombre_completo: fullName || profile.email.split('@')[0] || 'Docente'
                    });
                } else if (profileError) {
                    console.error('Error loading profile:', profileError);
                }

                const results = await AreasService.getAreas(session.user.id);
                setAreas(results);
            }
        } catch (error) {
            console.error('Error loading areas:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAreaSelection = (id: string) => {
        setSelectedAreas(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    // Filter areas based on selected type
    const filteredAreas = areas.filter(area => {
        if (!selectedType) return true;
        const nivelNombre = (area.area_conocimiento as any).grado?.nivel?.nombre?.toLowerCase() || '';
        if (selectedType === 1) return nivelNombre.includes('inicial');
        if (selectedType === 2) return nivelNombre.includes('primaria');
        if (selectedType === 3) return nivelNombre.includes('secundaria');
        if (selectedType === 4) return true; // Multigrado combines levels
        return true;
    });

    // Reset area selection if filter changes
    useEffect(() => {
        if (selectedType) {
            setSelectedAreas([]);
        }
    }, [selectedType]);

    // Load Global Schedule when Trimestre/Mes changes
    useEffect(() => {
        if (step === 2 && selectedTrimestre && selectedMes) {
            loadGlobalSchedule();
        }
    }, [step, selectedTrimestre, selectedMes]);

    // Real-time Objective Synthesis Formula
    useEffect(() => {
        if (currentObjective.isManual) return; // Don't overwrite manual edits

        const selectedVerbs = catalogoVerbos
            .filter(v => currentObjective.verboIds.includes(v.id))
            .map(v => v.verbo);

        const selectedContents = availableContents
            .filter(c => currentObjective.contentIds.includes(c.id))
            .map(c => c.titulo || '');

        const complementText = currentObjective.complement ||
            (currentObjective.complementId ? catalogoComplementos.find(c => c.id === currentObjective.complementId)?.complemento : '');

        if (selectedVerbs.length === 0) {
            setCurrentObjective(prev => ({ ...prev, draft: '' }));
            return;
        }

        // Formula: [Verbs] + [Contents] + [Complement]
        let verbsPart = selectedVerbs.join(' y ');
        let contentsPart = selectedContents.length > 0 ? ` ${selectedContents.join(', ')}` : '';
        let complementPart = complementText ? ` ${complementText}` : '';

        // Capitalize first letter
        const fullDraft = (verbsPart + contentsPart + complementPart).trim();
        const formattedDraft = fullDraft.charAt(0).toUpperCase() + fullDraft.slice(1);

        setCurrentObjective(prev => ({ ...prev, draft: formattedDraft }));
    }, [currentObjective.verboIds, currentObjective.contentIds, currentObjective.complementId, currentObjective.complement, catalogoVerbos, availableContents, catalogoComplementos]);

    const loadGlobalSchedule = async () => {
        if (!selectedTrimestre || !selectedMes) return;
        try {
            const gestion = new Date().getFullYear();
            const { data, error } = await supabase
                .from('planificacion_semanal_general')
                .select('*')
                .eq('gestion', gestion)
                .eq('trimestre', selectedTrimestre)
                .eq('mes', selectedMes)
                .order('semana', { ascending: true });

            if (data && data.length > 0) {
                // Map database columns to local state
                const mappedData = data.map(w => ({
                    ...w,
                    fecha_inicio: w.fecha_inicio_trimestre || '',
                    fecha_fin: w.fecha_fin_trimestre || ''
                }));
                setPdcWeeks(mappedData);

                // Auto-fill PDC dates based on local PDC schedule range
                const startDates = mappedData.filter(w => w.fecha_inicio).map(w => w.fecha_inicio);
                const endDates = mappedData.filter(w => w.fecha_fin).map(w => w.fecha_fin);

                if (startDates.length > 0 && endDates.length > 0) {
                    setPdcDates({
                        inicio: [...startDates].sort()[0],
                        fin: [...endDates].sort().reverse()[0]
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateWeekDate = (id: string, field: 'fecha_inicio' | 'fecha_fin', value: string) => {
        setPdcWeeks(prev => prev.map(week =>
            week.id === id ? { ...week, [field]: value } : week
        ));
    };

    const handlePdcDatesChange = (field: 'inicio' | 'fin', value: string) => {
        setPdcDates(prev => ({ ...prev, [field]: value }));
    };

    const addWeek = () => {
        const nextSemana = pdcWeeks.length > 0
            ? Math.max(...pdcWeeks.map(w => w.semana)) + 1
            : 1;

        const newWeek = {
            id: `temp-${Date.now()}`,
            semana: nextSemana,
            fecha_inicio: '',
            fecha_fin: '',
            mes: selectedMes,
            trimestre: selectedTrimestre,
            gestion: new Date().getFullYear()
        };
        setPdcWeeks(prev => [...prev, newWeek]);
    };

    const removeLastWeek = () => {
        if (pdcWeeks.length > 0) {
            setPdcWeeks(prev => prev.slice(0, -1));
        }
    };

    const handleNext = async () => {
        if (step === 1 && selectedType && selectedAreas.length > 0) {
            setStep(2);
        } else if (step === 2 && selectedTrimestre && selectedMes) {
            // Ensure profile is loaded if it failed initially
            if (!userProfile) {
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
                }
            }

            // Load full details for the first selected area to populate the document header
            const details = await AreasService.getAreaById(selectedAreas[0]);
            setMainAreaDetails(details);

            // PRE-LOAD contents and verbs for Step 3
            loadStep3Data();

            setStep(3);
            setPdcStep(1);
        } else if (step === 3) {
            if (pdcStep === 1) {
                if (selectedType === 3) loadObjetivoNivel();
                setPdcStep(2);
            } else if (pdcStep === 3) {
                setPdcStep(4);
            } else if (pdcStep < 7) {
                setPdcStep(pdcStep + 1);
            }
        }
    };

    const loadStep3Data = async () => {
        // Load Verbs
        const { data: verbs } = await supabase.from('catalogo_verbos').select('*').order('tipo_verbo_id').order('verbo');
        if (verbs) setCatalogoVerbos(verbs);

        // Load Complements
        const { data: complements } = await supabase.from('catalogo_complementos').select('*').order('tipo_complemento_id').order('complemento');
        if (complements) setCatalogoComplementos(complements);

        // Load Planning Headers for selected areas and trimester
        const currentYear = new Date().getFullYear();
        const { data: planningHeaders } = await supabase
            .from('planificacion_semanal')
            .select('id, semana')
            .in('area_trabajo_id', selectedAreas)
            .eq('trimestre', selectedTrimestre)
            .eq('mes', selectedMes)
            .eq('gestion', currentYear);

        if (planningHeaders && planningHeaders.length > 0) {
            const headerIds = planningHeaders.map(h => h.id);

            // Load Contents associated with those planning headers
            const { data: weekContents } = await supabase
                .from('semana_contenido')
                .select('contenido_usuario_id, planificacion_semanal_id')
                .in('planificacion_semanal_id', headerIds);

            if (weekContents && weekContents.length > 0) {
                const contentIds = Array.from(new Set(weekContents.map(wc => wc.contenido_usuario_id)));

                const { data: contents } = await supabase
                    .from('contenidos_usuario')
                    .select('*')
                    .in('id', contentIds)
                    .order('padre_id', { ascending: false, nullsFirst: true })
                    .order('orden', { ascending: true });

                if (contents) {
                    setAvailableContents(contents);

                    // Group by week
                    const grouped: Record<number, any[]> = {};
                    planningHeaders.forEach(header => {
                        const semanalContents = weekContents
                            .filter(wc => wc.planificacion_semanal_id === header.id)
                            .map(wc => contents.find(c => Number(c.id) == Number(wc.contenido_usuario_id)))
                            .filter(Boolean);

                        grouped[header.semana] = semanalContents;
                    });
                    setWeekContentsMap(grouped);
                }
            } else {
                setAvailableContents([]);
                setWeekContentsMap({});
            }
        } else {
            setAvailableContents([]);
            setWeekContentsMap({});
        }
    };

    const filteredVerbos = catalogoVerbos.filter(v => {
        const matchesNivel = verbFilters.niveles.length === 0 ||
            (v.niveles_educativos && verbFilters.niveles.some(n => v.niveles_educativos.includes(n)));
        const matchesDominio = !verbFilters.dominio || v.dominio === verbFilters.dominio;
        const matchesProfundidad = !verbFilters.profundidad || v.nivel_profundidad === verbFilters.profundidad;
        return matchesNivel && matchesDominio && matchesProfundidad;
    });

    const filteredComplementos = catalogoComplementos.filter(c => {
        const matchesCategory = !selectedCompCategory || c.categoria === selectedCompCategory;
        const matchesSearch = !complementSearch ||
            c.complemento?.toLowerCase().includes(complementSearch.toLowerCase()) ||
            c.subcategoria?.toLowerCase().includes(complementSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedVerbos = [...filteredVerbos].sort((a, b) => a.verbo.localeCompare(b.verbo));

    const complementCategories = Array.from(new Set(catalogoComplementos.map(c => c.categoria))).filter(Boolean);

    const toggleNivelFilter = (nivel: string) => {
        setVerbFilters(prev => ({
            ...prev,
            niveles: prev.niveles.includes(nivel)
                ? prev.niveles.filter(n => n !== nivel)
                : [...prev.niveles, nivel]
        }));
    };

    const generateAIObjective = () => {
        const selectedVerbs = catalogoVerbos
            .filter(v => currentObjective.verboIds.includes(v.id))
            .map(v => v.verbo)
            .join(' y ');

        const selectedContentsArr = availableContents
            .filter(c => currentObjective.contentIds.includes(c.id))
            .map(c => c.titulo.toLowerCase());

        const selectedContents = selectedContentsArr.join(', ');

        const catalogComplement = catalogoComplementos.find(c => c.id === currentObjective.complementId)?.complemento || '';
        const finalComplement = catalogComplement || currentObjective.complement;

        if (!selectedVerbs || selectedContentsArr.length === 0) return;

        // Formula: Verbos + Contenidos + Complemento
        const baseDraft = `${selectedVerbs} ${selectedContents} ${finalComplement}`.trim();
        const capitalized = baseDraft.charAt(0).toUpperCase() + baseDraft.slice(1);

        const options = [
            {
                id: 1,
                title: '🔥 OPCIÓN 1 (MÁS USADA)',
                description: `${capitalized} de manera integral para fortalecer el desarrollo de capacidades creativas en la comunidad educativa.`,
                style: 'MÁS USADA'
            },
            {
                id: 2,
                title: '🚀 OPCIÓN 2 (RECOMENDADA PARA TI)',
                description: `Desarrollar y ${baseDraft} mediante el uso de herramientas tecnológicas y trabajo colaborativo.`,
                style: 'RECOMENDADA'
            },
            {
                id: 3,
                title: '💎 OPCIÓN 3 (MÁS CREATIVA)',
                description: `Impulsar la innovación al ${baseDraft} promoviendo el pensamiento crítico y la resolución de problemas reales.`,
                style: 'CREATIVA'
            },
            {
                id: 4,
                title: '⭐ OPCIÓN 4 (MÁS EQUILIBRADA)',
                description: `${capitalized} equilibrando la teoría y la práctica para un aprendizaje significativo y duradero.`,
                style: 'EQUILIBRADA'
            }
        ];

        setAiOptions(options);
        setCurrentObjective(prev => ({ ...prev, draft: options[0].description + '.', isManual: false }));
    };

    const improveManualWithAI = () => {
        if (!manualObjective.quiero || !manualObjective.paraQue) return;

        const improved = `Optimizar el proceso de ${manualObjective.quiero} para que ${manualObjective.paraQue} y medir el éxito a través de ${manualObjective.medire || 'indicadores de desempeño'}.`;
        setCurrentObjective(prev => ({ ...prev, draft: improved }));
        // Switch to AI view or just show it in the manual preview
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

    const handleBack = () => {
        if (step === 3 && pdcStep > 1) {
            setPdcStep(pdcStep - 1);
            return;
        }
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const loadObjetivoNivel = async () => {
        const { data, error } = await supabase
            .from('niveles')
            .select('objetivo_holistico')
            .eq('id', 3) // Secundaria
            .single();

        if (data?.objetivo_holistico) {
            setObjetivoNivel(data.objetivo_holistico);
        }
    };

    const getStepName = () => {
        if (step === 1) return 'Modalidad y Áreas';
        if (step === 2) return 'Cronograma y Fechas';
        if (step === 3) {
            const pdcSteps: Record<number, string> = {
                1: 'Datos Referenciales',
                2: 'Objetivo Holístico de Nivel',
                3: 'Objetivos de Aprendizaje',
                4: 'Semanas y Contenidos',
                5: 'Paso 5',
                6: 'Paso 6',
                7: 'Paso 7',
            };
            return pdcSteps[pdcStep] || 'Diseño del PDC';
        }
        return 'Asistente';
    };

    const getTotalSteps = () => 3; // F1: Modalidad, F2: Chrono, F3: Design (The user wants F3 to be the "7 steps" place)

    if (loading) return (
        <div className="p-20 flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="size-16 bg-slate-100 rounded-full"></div>
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nuevo PDC</h1>
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                            Fase {step} de {getTotalSteps()} {step === 3 && `• Paso ${pdcStep} de 7`}
                        </div>
                    </div>
                    <p className="text-slate-500 font-bold flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-500">arrow_right_alt</span>
                        {getStepName()}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack} className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider">
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={
                            (step === 1 && (!selectedType || selectedAreas.length === 0)) ||
                            (step === 2 && (!selectedTrimestre || !selectedMes)) ||
                            (step === 3 && pdcStep === 3 && learningObjectives.length === 0)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-12 rounded-2xl shadow-xl shadow-blue-100 font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Siguiente
                        <span className="material-symbols-rounded ml-2">east</span>
                    </Button>
                </div>
            </div>

            {step === 1 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Left: Modalidad */}
                    <div className="xl:col-span-4 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Paso 1</h2>
                            <h3 className="text-xl font-bold text-slate-900">Modalidad del Plan</h3>
                        </div>

                        <div className="grid gap-4">
                            {PDC_TYPES.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`group p-6 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer flex items-center gap-5 relative overflow-hidden ${selectedType === type.id
                                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-50'
                                        : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-md'
                                        }`}
                                >
                                    <div className={`size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${type.color}`}>
                                        <span className="material-symbols-rounded text-3xl">{type.icon}</span>
                                    </div>
                                    <div>
                                        <span className={`text-lg font-black block leading-none ${selectedType === type.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                            PDC {type.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                                            Modalidad {type.id}
                                        </span>
                                    </div>
                                    {selectedType === type.id && (
                                        <div className="ml-auto size-8 bg-blue-600 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                                            <span className="material-symbols-rounded text-lg">check</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Areas */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Paso 2</h2>
                            <h3 className="text-xl font-bold text-slate-900">Áreas de Trabajo Vinculadas</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredAreas.map(area => (
                                <div
                                    key={area.id}
                                    onClick={() => toggleAreaSelection(area.id)}
                                    className={`p-6 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group ${selectedAreas.includes(area.id)
                                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-50'
                                        : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-md'
                                        }`}
                                >
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                                                {area.unidad_educativa?.nombre}
                                            </span>
                                            {selectedAreas.includes(area.id) && (
                                                <span className="material-symbols-rounded text-blue-600 text-xl animate-in zoom-in">task_alt</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-black leading-tight ${selectedAreas.includes(area.id) ? 'text-blue-900' : 'text-slate-900'}`}>
                                                {area.area_conocimiento?.nombre}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                                                {(area.area_conocimiento as any).grado?.nombre} • {area.turno?.nombre}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute -right-8 -bottom-8 size-32 bg-blue-100 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-700 blur-3xl"></div>
                                </div>
                            ))}
                        </div>

                        {filteredAreas.length === 0 && (
                            <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 animate-in fade-in duration-500">
                                <span className="material-symbols-rounded text-5xl text-slate-200 mb-4 block">search_off</span>
                                <h3 className="text-lg font-bold text-slate-400">No hay clases {selectedType ? 'para este nivel' : ''}</h3>
                                <p className="text-slate-400 text-sm mt-1 max-w-[300px] mx-auto">
                                    Primero selecciona una modalidad o revisa tus áreas de trabajo configuradas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Selectors */}
                    <div className="xl:col-span-4 space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">1. Selecciona Trimestre</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTrimestre(t)}
                                        className={`py-4 rounded-2xl font-black text-xl transition-all ${selectedTrimestre === t
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                            : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        {t}°
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">2. Selecciona el Mes</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[1, 2, 3].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setSelectedMes(m)}
                                        className={`p-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all ${selectedMes === m
                                            ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                                            : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <span>Mes {m} del Trimestre</span>
                                        {selectedMes === m && <span className="material-symbols-rounded">check</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="xl:col-span-8 space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-slate-900">Cronograma del Plan</h3>
                                        {selectedMes && selectedTrimestre && (
                                            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                                                <button
                                                    onClick={removeLastWeek}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all text-slate-400"
                                                >
                                                    <span className="material-symbols-rounded text-xl">remove</span>
                                                </button>
                                                <span className="px-3 font-black text-slate-600 text-sm">
                                                    {pdcWeeks.length} Semanas
                                                </span>
                                                <button
                                                    onClick={addWeek}
                                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all text-slate-400"
                                                >
                                                    <span className="material-symbols-rounded text-xl">add</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-500 font-medium">Gestiona y ajusta las fechas de cada semana de tu cronograma de PDC.</p>
                                </div>
                                <div className="size-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                                    <span className="material-symbols-rounded text-3xl text-blue-600">calendar_month</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block px-1">Fecha de Inicio</span>
                                    <input
                                        type="date"
                                        value={pdcDates.inicio}
                                        onChange={(e) => handlePdcDatesChange('inicio', e.target.value)}
                                        className="w-full bg-white border-2 border-white rounded-xl px-5 py-3 font-bold text-slate-700 focus:border-blue-100 focus:ring-0 transition-all cursor-pointer shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block px-1">Fecha de Finalización</span>
                                    <input
                                        type="date"
                                        value={pdcDates.fin}
                                        onChange={(e) => handlePdcDatesChange('fin', e.target.value)}
                                        className="w-full bg-white border-2 border-white rounded-xl px-5 py-3 font-bold text-slate-700 focus:border-blue-100 focus:ring-0 transition-all cursor-pointer shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {pdcWeeks.length > 0 ? pdcWeeks.map((week, idx) => (
                                <div
                                    key={week.id}
                                    className="p-6 bg-white rounded-[2rem] border-2 border-slate-50 flex items-center gap-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 group hover:border-blue-100 transition-all font-outfit"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="px-5 py-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[120px]">
                                        <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1.5 text-slate-400">Semana {week.semana}</span>
                                        <span className="text-[11px] font-bold leading-none text-blue-400 whitespace-nowrap">Mes {week.mes} del PDC</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm mb-1 uppercase tracking-tight">Cronograma PDC</h4>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-full opacity-20"></div>
                                        </div>
                                    </div>
                                    <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all shrink-0">
                                        <span className="material-symbols-rounded text-xl">link</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <span className="material-symbols-rounded text-6xl text-slate-200 mb-4 block">event_busy</span>
                                    <h4 className="text-xl font-bold text-slate-500 font-outfit">Selecciona Mes y Trimestre</h4>
                                    <p className="text-slate-400 text-sm mt-1 font-outfit">Se cargará el cronograma de tu PDC automáticamente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                    {/* Step Indicate for Fase 3 */}
                    <div className="flex justify-between items-center bg-white px-8 py-6 rounded-3xl border border-slate-50 shadow-sm relative overflow-hidden">
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5, 6, 7].map(s => (
                                <div
                                    key={s}
                                    className={`size-10 rounded-xl flex items-center justify-center font-black transition-all ${pdcStep === s
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110'
                                        : s < pdcStep ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300'}`}
                                >
                                    {s < pdcStep ? <span className="material-symbols-rounded text-lg">check</span> : s}
                                </div>
                            ))}
                        </div>
                        <div className="text-right">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">DISEÑO DEL PDC</h4>
                            <p className="text-lg font-black text-slate-900">{getStepName()}</p>
                        </div>

                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 h-1 bg-slate-50 w-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${(pdcStep / 7) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Step 1: Datos Referenciales (Table) */}
                    {pdcStep === 1 && (
                        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center space-y-4">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    PLAN DE DESARROLLO CURRICULAR PARA EDUCACIÓN {selectedType === 3 ? 'SECUNDARIA COMUNITARIA PRODUCTIVA' : 'PRIMARIA COMUNITARIA VOCACIONAL'}
                                </h1>
                                <h2 className="text-xl font-bold text-slate-700">PLAN DE DESARROLLO CURRICULAR Nº 1</h2>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                    <span className="size-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                                    Datos Referenciales
                                </h3>

                                <div className="overflow-hidden rounded-[2rem] border-2 border-slate-900 shadow-xl font-outfit">
                                    <table className="w-full border-collapse text-left">
                                        <tbody>
                                            <tr className="border-b-2 border-slate-900">
                                                <td className="p-5 w-1/4 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900">Distrito educativo</td>
                                                <td className="p-5 w-1/4 font-medium text-slate-700 border-r-2 border-slate-900 leading-tight">
                                                    {mainAreaDetails?.unidad_educativa?.distrito?.nombre || 'Omereque'}
                                                </td>
                                                <td className="p-5 w-1/4 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900">Unidad educativa</td>
                                                <td className="p-5 w-1/4 font-medium text-slate-700 leading-tight">
                                                    {mainAreaDetails?.unidad_educativa?.nombre || 'Anselmo Andreotti'}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-slate-900">
                                                <td className="p-5 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900">Nivel</td>
                                                <td className="p-5 font-medium text-slate-700 border-r-2 border-slate-900 leading-tight">
                                                    {selectedType === 3 ? 'Secundaria' : 'Primaria'}
                                                </td>
                                                <td className="p-5 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900">Año de escolaridad/Paralelos</td>
                                                <td className="p-5 font-medium text-slate-700 leading-tight">
                                                    {(mainAreaDetails?.area_conocimiento as any)?.grado?.nombre}
                                                    {mainAreaDetails?.paralelos && mainAreaDetails.paralelos.length > 0 &&
                                                        ` "${mainAreaDetails.paralelos.map(p => p.nombre).join('", "')}"`}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-slate-900">
                                                <td className="p-5 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900">Maestra/o</td>
                                                <td colSpan={3} className="p-5 font-medium text-slate-700 leading-tight">
                                                    {userProfile?.nombre_completo || 'Cargando...'}
                                                </td>
                                            </tr>
                                            <tr className="border-b-2 border-slate-900">
                                                <td className="p-5 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900">Área</td>
                                                <td colSpan={3} className="p-5 font-medium text-slate-700 leading-tight">
                                                    {mainAreaDetails?.area_conocimiento?.nombre || 'Biología - Geografía'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td rowSpan={2} className="p-5 bg-slate-50 font-black text-slate-900 border-r-2 border-slate-900 align-top">Trimestre</td>
                                                <td colSpan={3} className="p-5 font-medium text-slate-700 border-b border-slate-200 leading-tight">
                                                    {selectedTrimestre === 1 ? 'Primero' : selectedTrimestre === 2 ? 'Segundo' : 'Tercero'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="p-5 font-medium text-slate-700 italic leading-tight">
                                                    Del {new Date(pdcDates.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} al {new Date(pdcDates.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Objetivo Holístico de Nivel */}
                    {pdcStep === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900">Objetivo Holístico de Nivel</h3>
                                        <p className="text-slate-500 font-medium italic">"Secundaria Comunitaria Productiva"</p>
                                    </div>
                                    <div className="size-16 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-rounded text-3xl text-amber-600">psychology</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-blue-600 uppercase tracking-widest block px-1">Redacción del Objetivo</label>
                                    <textarea
                                        value={objetivoNivel}
                                        onChange={(e) => setObjetivoNivel(e.target.value)}
                                        className="w-full min-h-[250px] bg-slate-50 border-0 rounded-[2rem] p-8 font-medium text-lg text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all leading-relaxed custom-scrollbar"
                                        placeholder="Cargando objetivo del nivel..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Objetivos de Aprendizaje */}
                    {pdcStep === 3 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="flex flex-col gap-12">
                                {/* Top: Generator Selector & Input Form */}
                                <div className="w-full space-y-10">
                                    <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-10">
                                        {/* Tabs Selector */}
                                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                            <button
                                                onClick={() => setGeneratorMode('auto')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all ${generatorMode === 'auto'
                                                    ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                <span className="material-symbols-rounded text-lg">magic_button</span>
                                                GENERADOR INTELIGENTE
                                            </button>
                                            <button
                                                onClick={() => setGeneratorMode('manual')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm transition-all ${generatorMode === 'manual'
                                                    ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                <span className="material-symbols-rounded text-lg">edit_note</span>
                                                MODO MANUAL
                                            </button>
                                        </div>

                                        {generatorMode === 'auto' ? (
                                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-black text-slate-900">Configuración Inteligente</h3>
                                                        <p className="text-slate-500 font-medium italic">Fórmula: Verbo + Contenidos + Complemento</p>
                                                    </div>
                                                </div>

                                                {/* Toolbox: Verbs with Horizontal Filters and Tooltips */}
                                                <div className="space-y-8 relative">
                                                    <div className="flex items-center justify-between px-1">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-black text-blue-600 uppercase tracking-widest">1. Selección de Verbos Estratégicos</label>
                                                            <p className="text-[10px] font-bold text-slate-400">Selecciona el verbo principal para tu objetivo</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowFilters(!showFilters)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider ${showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                                        >
                                                            <span className="material-symbols-rounded text-sm">{showFilters ? 'filter_list_off' : 'filter_list'}</span>
                                                            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                                                        </button>
                                                    </div>

                                                    {/* Horizontal Filters Bar (Collapsible) */}
                                                    {showFilters && (
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                                                            {/* Level Filter */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nivel Educativo</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button
                                                                        onClick={() => setVerbFilters(prev => ({ ...prev, niveles: [] }))}
                                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border-2 ${verbFilters.niveles.length === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                                    >
                                                                        Todos
                                                                    </button>
                                                                    {['Inicial', 'Primaria', 'Secundaria'].map(nivel => (
                                                                        <button
                                                                            key={nivel}
                                                                            onClick={() => toggleNivelFilter(nivel)}
                                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border-2 ${verbFilters.niveles.includes(nivel) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                                        >
                                                                            {nivel}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Domain Filter */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Dominio</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {['', 'Cognitivo', 'Afectivo', 'Psicomotor'].map(dom => (
                                                                        <button
                                                                            key={dom}
                                                                            onClick={() => setVerbFilters(prev => ({ ...prev, dominio: dom }))}
                                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border-2 ${verbFilters.dominio === dom ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                                        >
                                                                            {dom || 'Todos'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Depth Filter */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Profundidad</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {['', 'Básico', 'Intermedio', 'Avanzado', 'Transversal', 'Práctico'].map(prof => (
                                                                        <button
                                                                            key={prof}
                                                                            onClick={() => setVerbFilters(prev => ({ ...prev, profundidad: prof }))}
                                                                            className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border-2 ${verbFilters.profundidad === prof ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                                        >
                                                                            {prof || 'Todos'}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Split Layout: Verbs List and stable Detail Panel */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                                        {/* Side A: Verbs Grid (2/3) */}
                                                        <div className="lg:col-span-2 space-y-4">
                                                            <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar content-start">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {sortedVerbos.length > 0 ? (
                                                                        sortedVerbos.map(v => (
                                                                            <button
                                                                                key={v.id}
                                                                                onMouseEnter={() => setHoveredVerb(v)}
                                                                                onMouseLeave={() => setHoveredVerb(null)}
                                                                                onClick={() => {
                                                                                    setCurrentObjective(prev => {
                                                                                        const isSelected = prev.verboIds.includes(v.id);
                                                                                        let newVerbos = [...prev.verboIds];
                                                                                        if (isSelected) {
                                                                                            newVerbos = newVerbos.filter(id => id !== v.id);
                                                                                        } else {
                                                                                            // Limit to 2 verbs
                                                                                            if (newVerbos.length >= 2) {
                                                                                                newVerbos = [newVerbos[1], v.id]; // Queue style
                                                                                            } else {
                                                                                                newVerbos.push(v.id);
                                                                                            }
                                                                                        }
                                                                                        return { ...prev, verboIds: newVerbos, isManual: false };
                                                                                    });
                                                                                }}
                                                                                className={`px-5 py-3 rounded-2xl font-black text-sm transition-all border-2 flex items-center gap-2 group ${currentObjective.verboIds.includes(v.id)
                                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100'
                                                                                    : 'bg-white text-slate-700 border-slate-100 hover:border-blue-200 hover:bg-blue-50/10'
                                                                                    }`}
                                                                            >
                                                                                {v.verbo}
                                                                                <span className={`material-symbols-rounded text-lg transition-transform ${currentObjective.verboIds.includes(v.id) ? 'translate-x-1' : 'opacity-0 scale-0'}`}>
                                                                                    check_circle
                                                                                </span>
                                                                            </button>
                                                                        ))
                                                                    ) : (
                                                                        <div className="w-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                                                            <span className="material-symbols-rounded text-slate-200 text-4xl mb-2">filter_list_off</span>
                                                                            <p className="text-xs font-bold text-slate-400">No hay verbos que coincidan con estos filtros.</p>
                                                                            <button
                                                                                onClick={() => setVerbFilters({ niveles: [], dominio: '', profundidad: '' })}
                                                                                className="mt-4 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest underline underline-offset-4"
                                                                            >
                                                                                Limpiar Filtros
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Side B: Stable Detail Panel (1/3) */}
                                                        <div className="hidden lg:block sticky top-4">
                                                            <div className={`transition-all duration-300 ${hoveredVerb || currentObjective.verboIds.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`}>
                                                                {(() => {
                                                                    const lastVerboId = currentObjective.verboIds[currentObjective.verboIds.length - 1];
                                                                    const activeVerb = hoveredVerb || catalogoVerbos.find(v => v.id === lastVerboId);

                                                                    return activeVerb ? (
                                                                        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden flex flex-col gap-6">
                                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                                                            <div className="relative space-y-1">
                                                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block whitespace-nowrap overflow-hidden text-ellipsis">Definición y Nivel</span>
                                                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{activeVerb.verbo}</h4>
                                                                            </div>

                                                                            <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-3">
                                                                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block">Significado Pedagógico</span>
                                                                                <p className="text-[11px] font-medium leading-relaxed text-slate-300 italic">
                                                                                    "{activeVerb.descripcion || 'Sin descripción disponible.'}"
                                                                                </p>
                                                                            </div>

                                                                            <div className="space-y-4">
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    <div className="space-y-1">
                                                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Dominio</span>
                                                                                        <span className="text-[10px] font-bold text-slate-300">{activeVerb.dominio || 'Cognitivo'}</span>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Profundidad</span>
                                                                                        <span className="text-[10px] font-bold text-slate-300">{activeVerb.nivel_profundidad || 'Básico'}</span>
                                                                                    </div>
                                                                                </div>

                                                                                {activeVerb.ejemplo_indicativo && (
                                                                                    <div className="pt-4 border-t border-white/5 space-y-2">
                                                                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">Ejemplo de Redacción</span>
                                                                                        <p className="text-[10px] font-bold text-slate-400 leading-snug">
                                                                                            "{activeVerb.ejemplo_indicativo}"
                                                                                        </p>
                                                                                    </div>
                                                                                )}

                                                                                <div className="pt-2">
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {activeVerb.niveles_educativos?.map((n: string) => (
                                                                                            <span key={n} className="text-[8px] font-black bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20">
                                                                                                {n}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-4 py-20 grayscale opacity-60">
                                                                            <div className="size-16 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                                                                                <span className="material-symbols-rounded text-slate-300 text-3xl">psychology</span>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalle del Verbo</p>
                                                                                <p className="text-[11px] font-medium text-slate-400 px-4">Pasa el mouse sobre un verbo para ver su fundamentación.</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Relation: Contents */}
                                                <div className="space-y-4">
                                                    <label className="text-xs font-black text-blue-600 uppercase tracking-widest block px-1">2. Contenidos asociados del periodo</label>
                                                    <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                                        {availableContents.length > 0 ? (
                                                            // Group contents by padre_id
                                                            availableContents.filter(c => !c.padre_id).map(parent => {
                                                                const children = availableContents.filter(c => c.padre_id === parent.id);
                                                                const isExpanded = expandedTitles.includes(parent.id);
                                                                const isParentSelected = currentObjective.contentIds.includes(parent.id);
                                                                const isParentCovered = learningObjectives.some(obj => obj.contentIds.includes(parent.id));

                                                                return (
                                                                    <div key={parent.id} className="space-y-2">
                                                                        {/* Parent Content (Title) */}
                                                                        <div
                                                                            className={`p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 group/item ${isParentCovered
                                                                                ? 'bg-emerald-50 border-emerald-100 opacity-60 cursor-default'
                                                                                : isParentSelected
                                                                                    ? 'bg-indigo-50 border-indigo-200 cursor-pointer shadow-sm'
                                                                                    : 'bg-slate-50 border-transparent hover:border-slate-200 cursor-pointer'
                                                                                }`}
                                                                            onClick={() => {
                                                                                if (isParentCovered) return;
                                                                                const ids = currentObjective.contentIds.includes(parent.id)
                                                                                    ? currentObjective.contentIds.filter(id => id !== parent.id)
                                                                                    : [...currentObjective.contentIds, parent.id];
                                                                                setCurrentObjective(prev => ({ ...prev, contentIds: ids }));
                                                                            }}
                                                                        >
                                                                            <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${isParentCovered
                                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                                : isParentSelected
                                                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                                    : 'bg-white border-slate-200'}`}
                                                                            >
                                                                                {(isParentCovered || isParentSelected) && <span className="material-symbols-rounded text-[14px]">check</span>}
                                                                            </div>

                                                                            <div className="flex-1">
                                                                                <span className={`text-sm font-black block tracking-tight ${isParentCovered ? 'text-emerald-700' : isParentSelected ? 'text-indigo-800' : 'text-slate-800'}`}>
                                                                                    {parent.titulo}
                                                                                </span>
                                                                                {isParentCovered && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ya cubierto</span>}
                                                                            </div>

                                                                            {children.length > 0 && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setExpandedTitles(prev =>
                                                                                            prev.includes(parent.id)
                                                                                                ? prev.filter(id => id !== parent.id)
                                                                                                : [...prev, parent.id]
                                                                                        );
                                                                                    }}
                                                                                    className={`size-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-900 text-white rotate-180' : 'bg-white text-slate-400 border border-slate-100'}`}
                                                                                >
                                                                                    <span className="material-symbols-rounded">expand_more</span>
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Hidden/Collapsible Subtitles (Children) */}
                                                                        {isExpanded && children.length > 0 && (
                                                                            <div className="pl-14 space-y-2 animate-in slide-in-from-top-4 duration-300">
                                                                                {children.map(child => {
                                                                                    const isChildSelected = currentObjective.contentIds.includes(child.id);
                                                                                    const isChildCovered = learningObjectives.some(obj => obj.contentIds.includes(child.id));

                                                                                    return (
                                                                                        <div
                                                                                            key={child.id}
                                                                                            onClick={() => {
                                                                                                if (isChildCovered) return;
                                                                                                const ids = currentObjective.contentIds.includes(child.id)
                                                                                                    ? currentObjective.contentIds.filter(id => id !== child.id)
                                                                                                    : [...currentObjective.contentIds, child.id];
                                                                                                setCurrentObjective(prev => ({ ...prev, contentIds: ids }));
                                                                                            }}
                                                                                            className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isChildCovered
                                                                                                ? 'bg-emerald-50 border-emerald-100 opacity-60 cursor-default'
                                                                                                : isChildSelected
                                                                                                    ? 'bg-indigo-50 border-indigo-200 cursor-pointer'
                                                                                                    : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer lg:hover:translate-x-1'
                                                                                                }`}
                                                                                        >
                                                                                            <div className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${isChildCovered
                                                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                                                : isChildSelected
                                                                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                                                    : 'bg-white border-slate-200'}`}
                                                                                            >
                                                                                                {(isChildCovered || isChildSelected) && <span className="material-symbols-rounded text-xs">check</span>}
                                                                                            </div>
                                                                                            <span className={`text-xs font-bold ${isChildCovered ? 'text-emerald-700' : isChildSelected ? 'text-indigo-800' : 'text-slate-500'}`}>
                                                                                                {child.titulo}
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-medium p-4 text-center bg-slate-50 rounded-2xl italic">Selecciona áreas en la Fase 1 para cargar contenidos.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Complement: Purpose */}
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-black text-blue-600 uppercase tracking-widest block px-1">3. ¿Para qué? (Intencionalidad sugerida)</label>

                                                        {/* Category Filters for Complements */}
                                                        <div className="space-y-6">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => setSelectedCompCategory('')}
                                                                    className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 ${!selectedCompCategory ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                                                >
                                                                    TODOS
                                                                </button>
                                                                {complementCategories.map(cat => (
                                                                    <button
                                                                        key={cat}
                                                                        onClick={() => setSelectedCompCategory(cat)}
                                                                        className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 ${selectedCompCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                                                    >
                                                                        {cat}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            {/* Search Bar for Complements */}
                                                            <div className="relative group max-w-md">
                                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                    <span className="material-symbols-rounded text-slate-400 text-xl group-focus-within:text-blue-500 transition-colors">search</span>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={complementSearch}
                                                                    onChange={(e) => setComplementSearch(e.target.value)}
                                                                    placeholder="Buscar intencionalidad..."
                                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                                                />
                                                                {complementSearch && (
                                                                    <button
                                                                        onClick={() => setComplementSearch('')}
                                                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                                                    >
                                                                        <span className="material-symbols-rounded text-lg">close</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Split Layout: List and stable Detail Panel */}
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                                            {/* Side A: List (2/3) */}
                                                            <div className="lg:col-span-2 space-y-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar content-start">
                                                                    {filteredComplementos.map(comp => (
                                                                        <button
                                                                            key={comp.id}
                                                                            onMouseEnter={() => setHoveredComplement(comp)}
                                                                            onMouseLeave={() => setHoveredComplement(null)}
                                                                            onClick={() => setCurrentObjective(prev => ({
                                                                                ...prev,
                                                                                complementId: prev.complementId === comp.id ? null : comp.id,
                                                                                complement: prev.complementId === comp.id ? '' : comp.complemento
                                                                            }))}
                                                                            className={`w-full p-4 rounded-xl text-left transition-all border-2 font-medium text-xs flex flex-col gap-1 group shadow-sm ${currentObjective.complementId === comp.id
                                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                                : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center justify-between w-full">
                                                                                <span className={`text-[8px] font-black uppercase tracking-widest ${currentObjective.complementId === comp.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                                    {comp.subcategoria}
                                                                                </span>
                                                                                {currentObjective.complementId === comp.id && <span className="material-symbols-rounded text-sm">check_circle</span>}
                                                                            </div>
                                                                            <span className="leading-tight">{comp.complemento}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Side B: Stable Detail Panel (1/3) */}
                                                            <div className="hidden lg:block sticky top-4">
                                                                <div className={`transition-all duration-300 ${hoveredComplement || currentObjective.complementId ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`}>
                                                                    {(() => {
                                                                        const activeComp = hoveredComplement || catalogoComplementos.find(c => c.id === currentObjective.complementId);

                                                                        return activeComp ? (
                                                                            <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden flex flex-col gap-6">
                                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                                                                <div className="relative space-y-1">
                                                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Información</span>
                                                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{activeComp.subcategoria}</h4>
                                                                                </div>

                                                                                <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-3">
                                                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block">Ejemplo Sugerido</span>
                                                                                    <p className="text-[11px] font-medium leading-relaxed text-slate-300 italic">
                                                                                        "{activeComp.ejemplo_uso || activeComp.complemento}"
                                                                                    </p>
                                                                                </div>

                                                                                <div className="space-y-4">
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Niveles de aplicación</span>
                                                                                        <div className="flex flex-wrap gap-1">
                                                                                            {activeComp.niveles_sugeridos?.map((n: string) => (
                                                                                                <span key={n} className="text-[8px] font-black bg-white/5 text-slate-300 px-3 py-1.5 rounded-xl border border-white/10">
                                                                                                    {n}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="pt-2 border-t border-white/5">
                                                                                        <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-400/20 inline-block">
                                                                                            {activeComp.categoria}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-4 py-20 grayscale opacity-60">
                                                                                <div className="size-16 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                                                                                    <span className="material-symbols-rounded text-slate-300 text-3xl">info</span>
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa</p>
                                                                                    <p className="text-[11px] font-medium text-slate-400 px-4">Pasa el mouse sobre un complemento para ver detalles.</p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Redacción Final del Objetivo (Editable)</label>
                                                            {currentObjective.isManual && (
                                                                <button
                                                                    onClick={() => setCurrentObjective(prev => ({ ...prev, isManual: false }))}
                                                                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                                                >
                                                                    Resetear a fórmula
                                                                </button>
                                                            )}
                                                        </div>
                                                        <textarea
                                                            id="objective-draft-textarea"
                                                            value={currentObjective.draft}
                                                            onChange={(e) => setCurrentObjective(prev => ({ ...prev, draft: e.target.value, isManual: true }))}
                                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-700 min-h-[120px] focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all placeholder:text-slate-300 leading-relaxed custom-scrollbar"
                                                            placeholder="El objetivo se construye automáticamente aquí mientras seleccionas verbos y contenidos..."
                                                        />
                                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                                                            <p className="text-[10px] font-medium text-slate-400 italic">
                                                                Tip: Puedes editar directamente el texto de arriba para dar los toques finales.
                                                            </p>
                                                            {currentObjective.draft && (
                                                                <button
                                                                    onClick={addStrategicObjective}
                                                                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95"
                                                                >
                                                                    <span className="material-symbols-rounded text-sm">save</span>
                                                                    Guardar Objetivo
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={generateAIObjective}
                                                    disabled={currentObjective.verboIds.length === 0 || currentObjective.contentIds.length === 0}
                                                    className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black gap-3 shadow-xl transition-all active:scale-95"
                                                >
                                                    <span className="material-symbols-rounded">psychology</span>
                                                    REDACTAR CON AI
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Creación Personalizada</h3>
                                                        <p className="text-slate-500 font-medium italic">Define tu objetivo paso a paso</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-8 border border-slate-100">
                                                    <div className="space-y-6">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                                                <span className="text-sm font-black text-blue-600 shrink-0 uppercase tracking-wider">Quiero</span>
                                                                <input
                                                                    type="text"
                                                                    value={manualObjective.quiero}
                                                                    onChange={(e) => setManualObjective(prev => ({ ...prev, quiero: e.target.value }))}
                                                                    className="flex-1 bg-transparent border-0 p-0 text-sm font-bold focus:ring-0 placeholder:text-slate-200"
                                                                    placeholder="Ej: Desarrollar una guía visual..."
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                                                <span className="text-sm font-black text-blue-600 shrink-0 uppercase tracking-wider">para que</span>
                                                                <input
                                                                    type="text"
                                                                    value={manualObjective.paraQue}
                                                                    onChange={(e) => setManualObjective(prev => ({ ...prev, paraQue: e.target.value }))}
                                                                    className="flex-1 bg-transparent border-0 p-0 text-sm font-bold focus:ring-0 placeholder:text-slate-200"
                                                                    placeholder="Ej: los docentes tengan recursos..."
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                                                <span className="text-sm font-black text-blue-600 shrink-0 uppercase tracking-wider">y medirlo con</span>
                                                                <input
                                                                    type="text"
                                                                    value={manualObjective.medire}
                                                                    onChange={(e) => setManualObjective(prev => ({ ...prev, medire: e.target.value }))}
                                                                    className="flex-1 bg-transparent border-0 p-0 text-sm font-bold focus:ring-0 placeholder:text-slate-200"
                                                                    placeholder="Ej: encuestas de satisfacción o métricas..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-3">
                                                        <Button
                                                            onClick={improveManualWithAI}
                                                            disabled={!manualObjective.quiero || !manualObjective.paraQue}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black h-14 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                                                        >
                                                            <span className="material-symbols-rounded">auto_fix_high</span>
                                                            MEJORAR CON INTELIGENCIA ARTIFICIAL
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                const text = `Quiero ${manualObjective.quiero} para que ${manualObjective.paraQue} y lo mediré con ${manualObjective.medire}.`;
                                                                setCurrentObjective(prev => ({ ...prev, draft: text }));
                                                                addStrategicObjective();
                                                                setManualObjective({ quiero: '', paraQue: '', medire: '' });
                                                            }}
                                                            disabled={!manualObjective.quiero || !manualObjective.paraQue}
                                                            className="bg-slate-900 hover:bg-black text-white font-black h-14 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                                                        >
                                                            <span className="material-symbols-rounded">save</span>
                                                            GUARDAR COMO OBJETIVO PRINCIPAL
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 border-dashed">
                                                    <p className="text-xs font-bold text-amber-700 leading-relaxed italic">
                                                        Tip: Puedes usar el mejorador IA para convertir tus ideas básicas en objetivos redactados bajo el formato por competencias.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Result & List */}
                                <div className="space-y-8">
                                    {/* AI RESULTS GENERATED (UPDATED IN REAL TIME) */}
                                    {aiOptions.length > 0 && (
                                        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group space-y-8">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center">
                                                        <span className="material-symbols-rounded text-blue-300">auto_awesome</span>
                                                    </div>
                                                    <h4 className="font-black text-sm uppercase tracking-widest text-blue-200">
                                                        {generatorMode === 'manual' ? 'Sugerencias de IA (Mejoradas)' : 'Resultados Generados (En tiempo real)'}
                                                    </h4>
                                                </div>

                                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {aiOptions.map((opt) => (
                                                        <div key={opt.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition-colors group/opt">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">{opt.title}</span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setCurrentObjective(prev => ({ ...prev, draft: opt.description }));
                                                                            addStrategicObjective();
                                                                        }}
                                                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                                                                    >
                                                                        <span className="material-symbols-rounded text-sm">done_all</span>
                                                                        Seleccionar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setCurrentObjective(prev => ({
                                                                                ...prev,
                                                                                draft: opt.description,
                                                                                isManual: true
                                                                            }));
                                                                            const textarea = document.getElementById('objective-draft-textarea');
                                                                            textarea?.focus();
                                                                            textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                        }}
                                                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                                                    >
                                                                        <span className="material-symbols-rounded text-sm">edit</span>
                                                                    </button>
                                                                    <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
                                                                        <span className="material-symbols-rounded text-sm">psychology</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText(opt.description)}
                                                                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                                                    >
                                                                        <span className="material-symbols-rounded text-sm">content_copy</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-medium leading-relaxed text-slate-200">
                                                                "{opt.description}"
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Deco Circles */}
                                            <div className="absolute -right-20 -top-20 size-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                                            <div className="absolute -left-10 -bottom-10 size-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
                                        </div>
                                    )}

                                    {/* Saved List of Strategic Objectives */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-lg font-black text-slate-900">Objetivos Estratégicos Guardados</h3>
                                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">{learningObjectives.length} DEFINIDOS</span>
                                        </div>

                                        <div className="space-y-4">
                                            {learningObjectives.map((obj, i) => (
                                                <div key={i} className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm flex items-start gap-4 group animate-in slide-in-from-right-2 duration-300">
                                                    <span className="size-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-sm">
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1 space-y-2 pt-1">
                                                        <p className="font-medium text-slate-700 leading-relaxed text-sm">{obj.text}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {availableContents.filter(c => obj.contentIds.includes(c.id)).map(c => (
                                                                <span key={c.id} className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">
                                                                    {c.titulo}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setLearningObjectives(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-rose-500"
                                                    >
                                                        <span className="material-symbols-rounded">delete</span>
                                                    </button>
                                                </div>
                                            ))}

                                            {learningObjectives.length === 0 && (
                                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                                    <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <span className="material-symbols-rounded text-slate-200 text-3xl">playlist_add</span>
                                                    </div>
                                                    <p className="text-slate-400 font-bold text-sm">Los objetivos guardados aparecerán aquí.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Contenidos y Ejes Articuladores */}
                    {pdcStep === 4 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                            {/* Time Context Header */}
                            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
                                <div className="space-y-2 relative z-10">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block">Periodo de Cobertura</span>
                                    <h3 className="text-2xl font-black tracking-tight leading-none">
                                        TRIMESTRE {selectedTrimestre} • MES {selectedMes}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        {pdcWeeks.length} Semanas de Planificación
                                    </p>
                                </div>
                                <div className="flex gap-3 relative z-10">
                                    <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Inicio</span>
                                        <span className="text-xs font-black text-indigo-300">{new Date(pdcDates.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                    <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Final</span>
                                        <span className="text-xs font-black text-emerald-300">{new Date(pdcDates.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                </div>
                                {/* Deco */}
                                <div className="absolute top-0 right-0 size-48 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            </div>

                            <div className="space-y-12">
                                {Object.keys(weekContentsMap).length > 0 ? (
                                    Object.keys(weekContentsMap).sort().map(weekNum => {
                                        const weekContents = weekContentsMap[Number(weekNum)];
                                        const rootContents = weekContents.filter(c => {
                                            const isTheme = !c.padre_id;
                                            // Show if it's a theme OR if it's a subtheme whose parent is NOT in this same week
                                            if (isTheme) return true;
                                            return !weekContents.find(p => p.id === c.padre_id);
                                        });

                                        return (
                                            <div key={weekNum} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">
                                                        {weekNum}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Semana {weekNum}</h3>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                            {weekContents.length} Contenidos Planificados
                                                        </span>
                                                    </div>
                                                    <div className="h-px flex-1 bg-slate-100 ml-4"></div>
                                                </div>

                                                <div className="space-y-3">
                                                    {rootContents.map(content => {
                                                        const isTheme = !content.padre_id;
                                                        const subthemes = weekContents.filter(c => c.padre_id === content.id);
                                                        const isCovered = learningObjectives.some(obj => obj.contentIds.includes(content.id));

                                                        return (
                                                            <div key={content.id} className="space-y-2">
                                                                {/* Item: Theme or Standalone Content */}
                                                                <div className={`p-5 rounded-[2rem] border-2 transition-all flex items-center gap-4 group/item ${isCovered ? 'bg-emerald-50/50 border-emerald-100/50' : 'bg-white border-slate-50 hover:border-blue-100 shadow-sm'
                                                                    }`}>
                                                                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${isTheme ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <span className="material-symbols-rounded text-lg">{isTheme ? 'folder_open' : 'description'}</span>
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`text-[8px] font-black uppercase tracking-widest ${isCovered ? 'text-emerald-500' : 'text-blue-600'}`}>
                                                                                {isTheme ? 'TEMA' : 'CONTENIDO'}
                                                                            </span>
                                                                            {isCovered && (
                                                                                <span className="bg-emerald-100 text-emerald-600 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Vinculado</span>
                                                                            )}
                                                                        </div>
                                                                        <h4 className={`text-sm font-black tracking-tight leading-tight truncate ${isCovered ? 'text-emerald-900' : 'text-slate-800'}`}>
                                                                            {content.titulo}
                                                                        </h4>
                                                                    </div>

                                                                    <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${isCovered ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-200'}`}>
                                                                        <span className="material-symbols-rounded text-base">{isCovered ? 'check' : 'check_circle'}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Subthemes List */}
                                                                {subthemes.length > 0 && (
                                                                    <div className="pl-12 space-y-2">
                                                                        {subthemes.map(sub => {
                                                                            const isSubCovered = learningObjectives.some(obj => obj.contentIds.includes(sub.id));
                                                                            return (
                                                                                <div key={sub.id} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSubCovered ? 'bg-emerald-50/30 border-emerald-50' : 'bg-white/50 border-slate-50/50 hover:border-slate-100'
                                                                                    }`}>
                                                                                    <div className="h-3 w-3 border-l-2 border-b-2 border-slate-200 rounded-bl-sm shrink-0 -mt-2"></div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className={`text-xs font-bold truncate ${isSubCovered ? 'text-emerald-700' : 'text-slate-500'}`}>
                                                                                            {sub.titulo}
                                                                                        </p>
                                                                                    </div>
                                                                                    {isSubCovered && (
                                                                                        <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                        <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50">
                                            <span className="material-symbols-rounded text-4xl text-slate-200">event_busy</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800">No hay planificación semanal</h3>
                                        <p className="text-slate-400 text-sm mt-2 max-w-[320px] mx-auto font-medium leading-relaxed">
                                            Parece que aún no has organizado tus contenidos por semana en tu área de trabajo para este mes.
                                        </p>
                                        <button
                                            onClick={() => window.open(`/dashboard/areas/${selectedAreas[0]}`, '_blank')}
                                            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                                        >
                                            Ir al Cronograma
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
