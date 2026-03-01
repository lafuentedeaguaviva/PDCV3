'use client';

import { useState, useEffect } from 'react';
import { PracticasService, PracticaLibraryItem } from '@/services/practicas.service';


interface Props {
    pdcWeeks: any[];
    weekContentsMap: Record<number, any[]>;
    weekDesignState: Record<number, {
        momentos: {
            practica: { id: string | number; tecnica: string; detalle: string; preguntas: string }[];
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
}

export function MomentosProceso({
    weekContentsMap,
    weekDesignState,
    setWeekDesignState,
    levelColor
}: Props) {
    const [activeWeek, setActiveWeek] = useState<number>(
        Object.keys(weekContentsMap).length > 0 ? Number(Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b))[0]) : 1
    );
    const [activeTab, setActiveTab] = useState<'practica' | 'teoria' | 'produccion' | 'valoracion' | 'adaptaciones' | 'recursos' | 'fuentes' | 'herramientas'>('practica');

    // Estados para la biblioteca de Prácticas
    const [library, setLibrary] = useState<PracticaLibraryItem[]>([]);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState<PracticaLibraryItem | null>(null);
    const [editingItem, setEditingItem] = useState<{ id?: string | number; tecnica: string; detalle: string; preguntas: string }>({ tecnica: '', detalle: '', preguntas: '' });
    const [openPropositos, setOpenPropositos] = useState<Record<string, boolean>>({});

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
            practica: typeof rawMomentos === 'string' && rawMomentos ? [{ id: 'legacy', tecnica: 'Planificación Anterior', detalle: rawMomentos, preguntas: '' }] : [],
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
        if (!editingItem.tecnica) return;

        const currentPracticas = Array.isArray(currentDesign.momentos.practica) ? currentDesign.momentos.practica : [];
        let newPracticas;

        if (editingItem.id !== undefined) {
            newPracticas = currentPracticas.map(p => p.id === editingItem.id ? { ...editingItem } : p);
        } else {
            newPracticas = [...currentPracticas, { ...editingItem, id: Date.now() }];
        }

        handleUpdateMomento('practica', newPracticas);
        setEditingItem({ tecnica: '', detalle: '', preguntas: '' });
        setSelectedLibraryItem(null);
    };

    const handleDeletePractica = (id: string | number) => {
        const currentPracticas = Array.isArray(currentDesign.momentos.practica) ? currentDesign.momentos.practica : [];
        const newPracticas = currentPracticas.filter(p => p.id !== id);
        handleUpdateMomento('practica', newPracticas);
    };

    const handleLoadToEditor = (item: PracticaLibraryItem) => {
        setEditingItem(prev => ({
            ...prev,
            tecnica: item.tecnica,
            preguntas: item.preguntas_generales || ''
        }));
        setSelectedLibraryItem(item);
    };

    const groupedLibrary = library.reduce((acc, item) => {
        if (!acc[item.proposito]) acc[item.proposito] = [];
        acc[item.proposito].push(item);
        return acc;
    }, {} as Record<string, PracticaLibraryItem[]>);

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

                            {/* Contents & Active Week Header - Ultra Compact */}
                            <div className="flex items-center justify-between gap-4 relative z-10 bg-slate-100/30 p-2.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg shadow-blue-500/20`}>
                                        Semana {activeWeek}
                                    </span>
                                    <label className={`text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 opacity-80`}>
                                        Temas Centrales:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {weekContentsMap[activeWeek]?.map((c, i) => (
                                            <span key={i} className="text-xs font-black text-slate-700 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm max-w-[150px] truncate italic">
                                                {c.titulo}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full bg-${levelColor}/10 border border-${levelColor}/20`}>
                                    <span className={`text-[10px] font-black uppercase text-${levelColor} tracking-widest`}>Modo Edición Activo</span>
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col pt-1 overflow-hidden">
                                {activeTab === 'practica' ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden">
                                        {/* Columna Izquierda: Biblioteca */}
                                        <div className="lg:col-span-3 flex flex-col space-y-2 overflow-hidden">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Biblioteca</span>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{library.length} técnicas</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto pr-0.5 space-y-0">
                                                {library.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center p-4 gap-2 min-h-[180px]">
                                                        <span className="material-symbols-rounded text-3xl text-slate-200">library_books</span>
                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Biblioteca vacía</p>
                                                        <p className="text-[8px] text-slate-300 leading-relaxed max-w-[140px]">Ejecuta los archivos SQL en Supabase para cargar las técnicas.</p>
                                                    </div>
                                                ) : Object.entries(groupedLibrary).map(([proposito, items]) => (
                                                    <div key={proposito} className="mb-2">
                                                        {/* Separador estilo Word por Propósito */}
                                                        <div className="flex items-center gap-2 px-1 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100">
                                                            <div className="h-1.5 flex-shrink-0 w-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] whitespace-nowrap">{proposito}</span>
                                                            <div className="h-px flex-1 bg-slate-100"></div>
                                                            <span className="text-[9px] font-black text-slate-300">{items.length}</span>
                                                        </div>
                                                        {/* Lista de técnicas sin acordeón */}
                                                        <div className="space-y-px pt-0.5">
                                                            {items.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    onClick={() => setSelectedLibraryItem(item)}
                                                                    onDoubleClick={() => handleLoadToEditor(item)}
                                                                    title="Clic: ver detalle · Doble clic: enviar al editor"
                                                                    className={`px-2 py-1.5 rounded-lg border cursor-pointer transition-all group select-none ${selectedLibraryItem?.id === item.id
                                                                        ? 'bg-rose-50 border-rose-200 shadow-sm'
                                                                        : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-1">
                                                                        <span className={`text-xs font-black leading-tight ${selectedLibraryItem?.id === item.id ? 'text-rose-700' : 'text-slate-700'
                                                                            }`}>
                                                                            {item.tecnica}
                                                                        </span>
                                                                        <span className={`material-symbols-rounded text-base flex-shrink-0 transition-opacity ${selectedLibraryItem?.id === item.id ? 'opacity-100 text-rose-500' : 'opacity-0 group-hover:opacity-50 text-slate-300'
                                                                            }`}>east</span>
                                                                    </div>
                                                                    {selectedLibraryItem?.id === item.id && (
                                                                        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">"{item.descripcion_concreta}"</p>
                                                                            {item.preguntas_generales && (
                                                                                <div className="mt-2 p-2 bg-rose-50/50 rounded-lg border border-rose-100/50">
                                                                                    <p className="text-[10px] text-rose-600 font-bold leading-relaxed">{item.preguntas_generales}</p>
                                                                                </div>
                                                                            )}
                                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2">↑ doble clic para insertar</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Columna Central: Editor */}
                                        <div className="lg:col-span-6 flex flex-col space-y-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse`}></div>
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Panel de Edición Técnica</span>
                                                </div>
                                                {editingItem.id && (
                                                    <button onClick={() => setEditingItem({ tecnica: '', detalle: '', preguntas: '' })} className="text-[10px] font-black text-rose-500 uppercase hover:underline tracking-widest">Cancelar Edición</button>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-3 flex-1 overflow-y-auto pr-1">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Título de la Técnica</label>
                                                    <input
                                                        type="text"
                                                        value={editingItem.tecnica}
                                                        onChange={(e) => setEditingItem(prev => ({ ...prev, tecnica: e.target.value }))}
                                                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-800 focus:border-rose-400 focus:ring-0 outline-none transition-all shadow-sm"
                                                        placeholder="Nombre de la técnica..."
                                                    />
                                                </div>

                                                <div className="space-y-1.5 flex-1 flex flex-col">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Desarrollo Metodológico</label>
                                                    <textarea
                                                        value={editingItem.detalle}
                                                        onChange={(e) => setEditingItem(prev => ({ ...prev, detalle: e.target.value }))}
                                                        className="w-full flex-1 bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-rose-400 focus:ring-0 outline-none transition-all resize-none shadow-sm min-h-[150px] leading-relaxed"
                                                        placeholder="Describe detalladamente cómo aplicarás esta técnica en el aula..."
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Preguntas de Reflexión / Dinamización</label>
                                                    <textarea
                                                        value={editingItem.preguntas}
                                                        onChange={(e) => setEditingItem(prev => ({ ...prev, preguntas: e.target.value }))}
                                                        className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 focus:border-rose-400 focus:ring-0 outline-none transition-all resize-none shadow-sm h-[100px]"
                                                        placeholder="Preguntas para guiar el proceso..."
                                                    />
                                                </div>

                                                <button
                                                    onClick={handleSavePractica}
                                                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 ${editingItem.tecnica
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]'
                                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
                                                >
                                                    <span className="material-symbols-rounded text-xl">save_as</span>
                                                    {editingItem.id ? 'ACTUALIZAR ACTIVIDAD' : 'GUARDAR EN PLANIFICACIÓN'}
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
                                                        <div key={p.id || idx} className="bg-white border-2 border-rose-100 rounded-2xl p-4 shadow-xl shadow-rose-50/50 hover:shadow-rose-100/50 transition-all relative group border-l-[6px] border-l-rose-500">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <h4 className="text-sm font-black text-slate-900 uppercase leading-tight pr-12">{p.tecnica}</h4>
                                                                <div className="flex items-center gap-1.5 absolute top-3 right-3">
                                                                    <button
                                                                        onClick={() => setEditingItem(p)}
                                                                        className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-blue-50 hover:shadow-md transition-all flex items-center justify-center"
                                                                    >
                                                                        <span className="material-symbols-rounded text-lg">edit</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePractica(p.id)}
                                                                        className="size-8 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:shadow-md transition-all flex items-center justify-center"
                                                                    >
                                                                        <span className="material-symbols-rounded text-lg">delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-4 mb-3">{p.detalle}</p>
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
