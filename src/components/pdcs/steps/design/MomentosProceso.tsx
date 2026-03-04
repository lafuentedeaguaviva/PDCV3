'use client';

import { useState, useEffect } from 'react';
import { PracticasService, PracticaLibraryItem } from '@/services/practicas.service';
import { PracticaItem } from '@/types';


interface Props {
    pdcWeeks: any[];
    weekContentsMap: Record<number, any[]>;
    weekDesignState: Record<number, {
        momentos: {
            practica: PracticaItem[];
            teoria: string;
            produccion: string;
            valoracion: string;
            adaptaciones: string;
            recursos: string;
            fuentes: string;
            herramientas: string;
        };
        herramientas: string;
    }>;
    setWeekDesignState: (val: any) => void;
    levelColor: string;
    selectedType?: number;
}

const EMPTY_EDITING_ITEM: PracticaItem = {
    nombre_practica: '',
    preguntas: '',
    descripcion: ''
};

export function MomentosProceso({
    weekContentsMap,
    weekDesignState,
    setWeekDesignState,
    levelColor,
    selectedType
}: Props) {
    const [activeWeek, setActiveWeek] = useState<number>(
        Object.keys(weekContentsMap).length > 0 ? Number(Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b))[0]) : 1
    );
    const [activeTab, setActiveTab] = useState<'practica' | 'teoria' | 'produccion' | 'valoracion' | 'adaptaciones' | 'recursos' | 'fuentes' | 'herramientas'>('practica');

    // Estados para la biblioteca de Prácticas
    const [library, setLibrary] = useState<PracticaLibraryItem[]>([]);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState<PracticaLibraryItem | null>(null);
    const [editingItem, setEditingItem] = useState<PracticaItem>(EMPTY_EDITING_ITEM);
    const [selectedProposito, setSelectedProposito] = useState<string>('');
    const [selectedTipo, setSelectedTipo] = useState<string>('');

    useEffect(() => {
        const loadLibrary = async () => {
            const { data } = await PracticasService.getLibrary();
            if (data) setLibrary(data);
        };
        loadLibrary();
    }, []);

    const hasWeeks = Object.keys(weekContentsMap).length > 0;

    const momentos = [
        { id: 'practica', label: 'Práctica', icon: 'auto_fix', color: 'rose-500' },
        { id: 'teoria', label: 'Teoría', icon: 'menu_book', color: 'blue-500' },
        { id: 'produccion', label: 'Producción', icon: 'construction', color: 'amber-500' },
        { id: 'valoracion', label: 'Valoración', icon: 'verified', color: 'emerald-500' },
        { id: 'adaptaciones', label: 'Adaptaciones', icon: 'accessibility_new', color: 'indigo-500' },
        { id: 'recursos', label: 'Recursos', icon: 'inventory_2', color: 'cyan-500' },
        { id: 'fuentes', label: 'Fuentes', icon: 'import_contacts', color: 'orange-500' },
        { id: 'herramientas', label: 'Herramientas', icon: 'handshake', color: 'slate-500' }
    ] as const;

    const rawMomentos = weekDesignState[activeWeek]?.momentos;
    const currentMomentos = (rawMomentos && typeof rawMomentos === 'object')
        ? rawMomentos
        : {
            practica: typeof rawMomentos === 'string' && rawMomentos ? [{ id_practica: 'legacy', nombre_practica: 'Planificación Anterior', descripcion: rawMomentos, preguntas: '' }] : [],
            teoria: '', produccion: '', valoracion: '', adaptaciones: '', recursos: '', fuentes: '', herramientas: ''
        };

    const currentDesign = {
        momentos: currentMomentos,
        herramientas: weekDesignState[activeWeek]?.herramientas || ''
    };

    const handleUpdateMomento = (tab: typeof activeTab, value: any) => {
        setWeekDesignState((prev: any) => {
            const currentWeekData = prev[activeWeek] || { herramientas: '', momentos: {} };
            const rawMomentos = currentWeekData.momentos || {};

            return {
                ...prev,
                [activeWeek]: {
                    ...currentWeekData,
                    momentos: {
                        ...rawMomentos,
                        [tab]: value
                    },
                    ...(tab === 'herramientas' ? { herramientas: value } : {})
                }
            };
        });
    };

    const handleSavePractica = () => {
        if (!editingItem.nombre_practica) return;

        const currentPracticas = Array.isArray(currentDesign.momentos.practica) ? currentDesign.momentos.practica : [];
        let newPracticas;

        if (editingItem.id_practica !== undefined) {
            newPracticas = currentPracticas.map(p => p.id_practica === editingItem.id_practica ? { ...editingItem } : p);
        } else {
            newPracticas = [...currentPracticas, { ...editingItem, id_practica: `temp-${Date.now()}` }];
        }

        handleUpdateMomento('practica', newPracticas);
        setEditingItem(EMPTY_EDITING_ITEM);
        setSelectedLibraryItem(null);
    };

    const handleDeletePractica = (id_practica: string | number) => {
        const currentPracticas = Array.isArray(currentDesign.momentos.practica) ? currentDesign.momentos.practica : [];
        const newPracticas = currentPracticas.filter(p => p.id_practica !== id_practica);
        handleUpdateMomento('practica', newPracticas);
        if (editingItem.id_practica === id_practica) {
            setEditingItem(EMPTY_EDITING_ITEM);
        }
    };

    const handleLoadToEditor = (item: PracticaLibraryItem) => {
        // Al cargar al editor, copiamos TODO de la biblioteca
        // pero permitimos que el usuario edite nombre, descripción y preguntas
        setEditingItem({
            id_practica: undefined, // Nueva entrada basada en biblioteca
            nombre_practica: item.nombre_practica,
            descripcion: item.descripcion_concreta || '',
            preguntas: item.preguntas || '',
            proposito: item.proposito,
            tipo: item.tipo,
            apto_para: item.apto_para,
            redactado: item.redactado,
            ejemplo_inicial: item.ejemplo_inicial,
            ejemplo_primaria: item.ejemplo_primaria,
            ejemplo_secundaria: item.ejemplo_secundaria,
            ejemplo_multigrado: item.ejemplo_multigrado
        });
    };

    const groupedLibrary = library.reduce((acc, item) => {
        if (!acc[item.proposito]) acc[item.proposito] = {};
        if (!acc[item.proposito][item.tipo]) acc[item.proposito][item.tipo] = [];
        acc[item.proposito][item.tipo].push(item);
        return acc;
    }, {} as Record<string, Record<string, PracticaLibraryItem[]>>);

    const getExampleByLevel = (item: PracticaLibraryItem) => {
        switch (selectedType) {
            case 1: return item.ejemplo_inicial || 'Ejemplo no disponible para este nivel.';
            case 2: return item.ejemplo_primaria || 'Ejemplo no disponible para este nivel.';
            case 3: return item.ejemplo_secundaria || 'Ejemplo no disponible para este nivel.';
            case 4: return item.ejemplo_multigrado || 'Ejemplo no disponible para este nivel.';
            default: return item.ejemplo_primaria || item.descripcion_concreta;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 animate-in fade-in slide-in-from-right-8 duration-700 pt-2">

            {/* Selector de Semanas */}
            {hasWeeks && (
                <div className="lg:col-span-1 space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2 block">
                        Semanas
                    </label>
                    <div className="flex flex-col gap-1 px-1">
                        {Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b)).map(weekNumStr => (
                            <button
                                key={weekNumStr}
                                onClick={() => setActiveWeek(Number(weekNumStr))}
                                className={`w-full px-3 py-2 rounded-xl font-black text-xs tracking-tight transition-all text-center border-2 relative overflow-hidden flex flex-col items-center gap-1 ${activeWeek === Number(weekNumStr)
                                    ? `bg-blue-600 text-white border-${levelColor} shadow-lg scale-[1.05] z-10`
                                    : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100 opacity-80 shadow-none'
                                    }`}
                            >
                                <span className={`size-1.5 rounded-full ${activeWeek === Number(weekNumStr) ? `bg-${levelColor} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]` : 'bg-slate-100'}`}></span>
                                S{weekNumStr}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={`${hasWeeks ? 'lg:col-span-11' : 'lg:col-span-12'} space-y-2`}>
                {hasWeeks ? (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        {/* Word-style Toolbar - Expanded */}
                        <div className="bg-slate-50 border-b border-slate-100 p-0.5 flex flex-wrap items-center gap-px sticky top-0 z-20">
                            {momentos.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveTab(m.id)}
                                    className={`px-2 py-1.5 rounded-md flex flex-col items-center gap-1 transition-all min-w-[70px] ${activeTab === m.id
                                        ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                                        }`}
                                >
                                    <div className={`size-6 rounded-lg flex items-center justify-center shadow-sm ${activeTab === m.id ? `bg-${m.color}/10 text-${m.color}` : 'bg-slate-100 text-slate-400'}`}>
                                        <span className="material-symbols-rounded text-lg">{m.icon}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === m.id ? 'opacity-100' : 'opacity-60'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="p-3 space-y-3 flex-1 relative flex flex-col">
                            {/* Radiant Color Glows */}
                            <div className={`absolute top-0 right-0 size-[200px] bg-gradient-to-br from-${levelColor}/10 via-transparent to-transparent rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none`}></div>

                            <div className="flex flex-col gap-3 relative z-10 bg-slate-100/30 p-3 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg shadow-blue-500/20`}>
                                            Semana {activeWeek}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {weekContentsMap[activeWeek]?.map((c, i) => (
                                                <span key={i} className="text-[10px] font-black text-slate-700 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm truncate max-w-[120px] italic">
                                                    {c.titulo}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full bg-blue-50 border border-blue-100`}>
                                        <span className={`text-[10px] font-black uppercase text-blue-600 tracking-widest`}>Biblioteca de Prácticas</span>
                                    </div>
                                </div>

                                {/* Selectores de Biblioteca (Top Bar) */}
                                {activeTab === 'practica' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                                        <select
                                            value={selectedProposito}
                                            onChange={(e) => { setSelectedProposito(e.target.value); setSelectedTipo(''); setSelectedLibraryItem(null); }}
                                            className="bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-rose-400 transition-all"
                                        >
                                            <option value="">Seleccionar Propósito...</option>
                                            {Object.keys(groupedLibrary).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>

                                        <select
                                            value={selectedTipo}
                                            disabled={!selectedProposito}
                                            onChange={(e) => { setSelectedTipo(e.target.value); setSelectedLibraryItem(null); }}
                                            className="bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-rose-400 transition-all disabled:opacity-50"
                                        >
                                            <option value="">Seleccionar Tipo...</option>
                                            {selectedProposito && Object.keys(groupedLibrary[selectedProposito] || {}).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>

                                        <select
                                            value={selectedLibraryItem?.id_practica || ''}
                                            disabled={!selectedTipo}
                                            onChange={(e) => {
                                                const item = library.find(l => l.id_practica === Number(e.target.value));
                                                if (item) setSelectedLibraryItem(item);
                                            }}
                                            className="bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-rose-400 transition-all disabled:opacity-50"
                                        >
                                            <option value="">Seleccionar Técnica...</option>
                                            {selectedProposito && selectedTipo && groupedLibrary[selectedProposito][selectedTipo].map(item => (
                                                <option key={item.id_practica} value={item.id_practica}>{item.nombre_practica}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col pt-1 overflow-hidden">
                                {activeTab === 'practica' ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden">
                                        {/* Columna Izquierda: Detalle de Selección */}
                                        <div className="lg:col-span-3 flex flex-col space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm overflow-y-auto">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Detalle de Técnica</span>
                                                <span className="material-symbols-rounded text-blue-400 text-lg">info</span>
                                            </div>

                                            {selectedLibraryItem ? (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-500">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nombre</label>
                                                        <p className="text-xs font-black text-slate-800 leading-tight uppercase">{selectedLibraryItem.nombre_practica}</p>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Descripción</label>
                                                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">"{selectedLibraryItem.descripcion_concreta}"</p>
                                                    </div>

                                                    {selectedLibraryItem.preguntas && (
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Preguntas Guía</label>
                                                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{selectedLibraryItem.preguntas}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedLibraryItem.apto_para && (
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Apto para</label>
                                                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">{selectedLibraryItem.apto_para}</span>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ejemplo Sugerido</label>
                                                        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 text-[11px] text-rose-700 font-medium leading-relaxed">
                                                            {getExampleByLevel(selectedLibraryItem)}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleLoadToEditor(selectedLibraryItem)}
                                                        className="w-full mt-4 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-rounded text-lg">add_circle</span>
                                                        Llevar al Panel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-4 gap-3 opacity-40">
                                                    <span className="material-symbols-rounded text-4xl text-slate-200">manage_search</span>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Selecciona una técnica para ver sus detalles aquí</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Columna Central: Editor (Filtro por Propósito solicitado) */}
                                        <div className="lg:col-span-6 flex flex-col space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-3.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)] animate-pulse`}></div>
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Configuración de Actividad</span>
                                                </div>
                                                {editingItem.id_practica && (
                                                    <button onClick={() => setEditingItem(EMPTY_EDITING_ITEM)} className="text-[10px] font-black text-rose-500 uppercase hover:underline tracking-widest">Cancelar Edición</button>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-4 flex-1 overflow-y-auto pr-1">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Técnica Seleccionada</label>
                                                    <input
                                                        type="text"
                                                        value={editingItem.nombre_practica}
                                                        onChange={(e) => setEditingItem(prev => ({ ...prev, nombre_practica: e.target.value }))}
                                                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-800 focus:border-blue-400 focus:ring-0 outline-none transition-all shadow-sm"
                                                        placeholder="Nombre de la actividad..."
                                                    />
                                                </div>

                                                <div className="space-y-1.5 flex-1 flex flex-col">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Descripción</label>
                                                    <textarea
                                                        value={editingItem.descripcion}
                                                        onChange={(e) => setEditingItem(prev => ({ ...prev, descripcion: e.target.value }))}
                                                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:border-blue-400 focus:ring-0 outline-none transition-all resize-none shadow-sm flex-1 min-h-[100px]"
                                                        placeholder="Detalles adicionales..."
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Preguntas de Reflexión</label>
                                                    <textarea
                                                        value={editingItem.preguntas}
                                                        onChange={(e) => setEditingItem(prev => ({ ...prev, preguntas: e.target.value }))}
                                                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 focus:border-blue-400 focus:ring-0 outline-none transition-all resize-none shadow-sm min-h-[80px]"
                                                        placeholder="Preguntas dinamizadoras..."
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleSavePractica}
                                                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 ${editingItem.nombre_practica
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]'
                                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
                                                >
                                                    <span className="material-symbols-rounded text-xl">check_circle</span>
                                                    {editingItem.id_practica ? 'ACTUALIZAR ACTIVIDAD' : 'GUARDAR EN PLANIFICACIÓN'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Resumen Guardado */}
                                        <div className="lg:col-span-3 flex flex-col space-y-2 overflow-hidden">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Actividades Guardadas</span>
                                                <span className={`text-xs font-black text-white px-2 py-0.5 rounded-full bg-rose-500 shadow-lg shadow-rose-200`}>S{activeWeek}</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                                {Array.isArray(currentDesign.momentos.practica) && currentDesign.momentos.practica.length > 0 ? (
                                                    currentDesign.momentos.practica.map((p, idx) => (
                                                        <div key={p.id_practica || idx} className="bg-white border-2 border-rose-100 rounded-2xl p-4 shadow-xl shadow-rose-50/50 hover:shadow-rose-100/50 transition-all relative group border-l-[6px] border-l-rose-500">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <h4 className="text-sm font-black text-slate-900 uppercase leading-tight pr-12">{p.nombre_practica}</h4>
                                                                <div className="flex items-center gap-1.5 absolute top-3 right-3">
                                                                    <button
                                                                        onClick={() => setEditingItem(p)}
                                                                        className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 hover:shadow-md transition-all flex items-center justify-center"
                                                                    >
                                                                        <span className="material-symbols-rounded text-lg">edit</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePractica(p.id_practica!)}
                                                                        className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:shadow-md transition-all flex items-center justify-center"
                                                                    >
                                                                        <span className="material-symbols-rounded text-lg">delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-4 mb-3">{p.descripcion || p.detalle}</p>
                                                            {p.preguntas && (
                                                                <div className="pt-3 border-t border-slate-100">
                                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1.5">Preguntas Guía:</span>
                                                                    <p className="text-xs text-slate-500 italic font-bold leading-relaxed">"{p.preguntas}"</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 p-6 text-center">
                                                        <span className="material-symbols-rounded text-slate-200 text-4xl mb-3">inventory_2</span>
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No hay actividades para esta semana</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col space-y-2.5">
                                        <div className="flex items-center gap-3 px-1">
                                            <div className={`size-3 rounded-full bg-${momentos.find(m => m.id === activeTab)?.color} shadow-lg animate-pulse`}></div>
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
                                                Redacción de {momentos.find(m => m.id === activeTab)?.label}
                                            </span>
                                            <div className="h-px flex-1 bg-slate-100"></div>
                                        </div>
                                        <textarea
                                            value={(currentDesign.momentos[activeTab as keyof typeof currentDesign.momentos] as string) || ''}
                                            onChange={(e) => handleUpdateMomento(activeTab, e.target.value)}
                                            className="w-full flex-1 bg-slate-50/30 border-2 border-transparent focus:border-slate-200 focus:bg-white rounded-2xl p-6 text-sm font-bold text-slate-700 transition-all min-h-[400px] resize-none outline-none leading-relaxed placeholder:text-slate-300 shadow-inner"
                                            placeholder={`Escribe aquí el contenido detallado de ${momentos.find(m => m.id === activeTab)?.label}...`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-blue-50">
                        <span className="material-symbols-rounded text-4xl text-blue-100 mb-4 block">rocket_launch</span>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Sin planificación</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
