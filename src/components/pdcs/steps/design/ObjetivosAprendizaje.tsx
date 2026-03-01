'use client';

import { Button } from '@/components/ui/button';

interface Props {
    generatorMode: 'auto' | 'manual';
    setGeneratorMode: (mode: 'auto' | 'manual') => void;
    currentObjective: any;
    setCurrentObjective: (val: any) => void;
    sortedVerbos: any[];
    hoveredVerb: any | null;
    setHoveredVerb: (v: any | null) => void;
    verbFilters: any;
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    toggleNivelFilter: (nivel: string) => void;
    setVerbFilters: (val: any) => void;
    catalogoVerbos: any[];
    availableContents: any[];
    expandedTitles: number[];
    setExpandedTitles: (val: any) => void;
    learningObjectives: any[];
    complementCategories: string[];
    selectedCompCategory: string;
    setSelectedCompCategory: (val: string) => void;
    complementSearch: string;
    setComplementSearch: (val: string) => void;
    filteredComplementos: any[];
    hoveredComplement: any | null;
    setHoveredComplement: (v: any | null) => void;
    catalogoComplementos: any[];
    addStrategicObjective: () => void;
    generateAIObjective: () => void;
    manualObjective: any;
    setManualObjective: (val: any) => void;
    improveManualWithAI: () => void;
    aiOptions: any[];
}

export function ObjetivosAprendizaje({
    generatorMode,
    setGeneratorMode,
    currentObjective,
    setCurrentObjective,
    sortedVerbos,
    hoveredVerb,
    setHoveredVerb,
    verbFilters,
    showFilters,
    setShowFilters,
    toggleNivelFilter,
    setVerbFilters,
    catalogoVerbos,
    availableContents,
    expandedTitles,
    setExpandedTitles,
    learningObjectives,
    complementCategories,
    selectedCompCategory,
    setSelectedCompCategory,
    complementSearch,
    setComplementSearch,
    filteredComplementos,
    hoveredComplement,
    setHoveredComplement,
    catalogoComplementos,
    addStrategicObjective,
    generateAIObjective,
    manualObjective,
    setManualObjective,
    improveManualWithAI,
    aiOptions
}: Props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 pt-6">
            <div className="flex flex-col gap-8">
                {/* Top: Generator Selector & Input Form */}
                <div className="w-full space-y-8">
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-50 shadow-sm space-y-6">
                        {/* Tabs Selector */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setGeneratorMode('auto')}
                                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-lg font-black text-sm transition-all ${generatorMode === 'auto'
                                    ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <span className="material-symbols-rounded text-lg">magic_button</span>
                                GENERADOR INTELIGENTE
                            </button>
                            <button
                                onClick={() => setGeneratorMode('manual')}
                                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-lg font-black text-sm transition-all ${generatorMode === 'manual'
                                    ? 'bg-white text-indigo-600 shadow-md scale-[1.02]'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <span className="material-symbols-rounded text-lg">edit_note</span>
                                MODO MANUAL
                            </button>
                        </div>

                        {generatorMode === 'auto' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 uppercase">Configuración de Objetivos</h3>
                                        <p className="text-slate-500 font-bold text-xs tracking-wider">Fórmula: Verbo + Contenidos + Complemento</p>
                                    </div>
                                </div>

                                {/* Toolbox: Verbs */}
                                <div className="space-y-6 relative">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="space-y-1">
                                            <label className="text-sm font-black text-blue-600 uppercase tracking-widest">Paso 3.1: Selección de Verbos</label>
                                            <p className="text-xs font-bold text-slate-400">Selecciona el verbo principal</p>
                                        </div>
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all font-black text-xs uppercase tracking-wider ${showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <span className="material-symbols-rounded text-sm">{showFilters ? 'filter_list_off' : 'filter_list'}</span>
                                            {showFilters ? 'Ocultar' : 'Filtros'}
                                        </button>
                                    </div>

                                    {showFilters && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                                            {/* Level Filter */}
                                            <div className="space-y-2">
                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nivel</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <button
                                                        onClick={() => setVerbFilters((prev: any) => ({ ...prev, niveles: [] }))}
                                                        className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all border-2 ${verbFilters.niveles.length === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                    >
                                                        Todos
                                                    </button>
                                                    {[
                                                        { label: 'Inicial', color: 'rose-600' },
                                                        { label: 'Primaria', color: 'amber-500' },
                                                        { label: 'Secundaria', color: 'indigo-600' }
                                                    ].map(n => (
                                                        <button
                                                            key={n.label}
                                                            onClick={() => toggleNivelFilter(n.label)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border-2 ${verbFilters.niveles.includes(n.label)
                                                                ? `bg-${n.color} text-white border-${n.color}`
                                                                : 'bg-white text-slate-500 border-slate-100'
                                                                }`}
                                                        >
                                                            {n.label}
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
                                                            onClick={() => setVerbFilters((prev: any) => ({ ...prev, dominio: dom }))}
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
                                                            onClick={() => setVerbFilters((prev: any) => ({ ...prev, profundidad: prof }))}
                                                            className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border-2 ${verbFilters.profundidad === prof ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                        >
                                                            {prof || 'Todos'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verbs List */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
                                                                    setCurrentObjective((prev: any) => {
                                                                        const isSelected = prev.verboIds.includes(v.id);
                                                                        let newVerbos = [...prev.verboIds];
                                                                        if (isSelected) {
                                                                            newVerbos = newVerbos.filter((id: number) => id !== v.id);
                                                                        } else {
                                                                            if (newVerbos.length >= 2) {
                                                                                newVerbos = [newVerbos[1], v.id];
                                                                            } else {
                                                                                newVerbos.push(v.id);
                                                                            }
                                                                        }
                                                                        return { ...prev, verboIds: newVerbos, isManual: false };
                                                                    });
                                                                }}
                                                                className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all border-2 flex items-center gap-3 group ${currentObjective.verboIds.includes(v.id)
                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
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

                                        {/* Detail Panel */}
                                        <div className="hidden lg:block sticky top-4">
                                            <div className={`transition-all duration-300 ${hoveredVerb || currentObjective.verboIds.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}`}>
                                                {(() => {
                                                    const lastVerboId = currentObjective.verboIds[currentObjective.verboIds.length - 1];
                                                    const activeVerb = hoveredVerb || catalogoVerbos.find(v => v.id === lastVerboId);

                                                    return activeVerb ? (
                                                        <div className="bg-blue-900 p-5 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden flex flex-col gap-4">
                                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                                                            <div className="relative space-y-1">
                                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block whitespace-nowrap overflow-hidden text-ellipsis">Definición y Nivel</span>
                                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{activeVerb.verbo}</h4>
                                                            </div>
                                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Significado Pedagógico</span>
                                                                <p className="text-xs font-medium leading-relaxed text-slate-300">
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
                                                                        <p className="text-[10px] font-bold text-slate-400 leading-snug">"{activeVerb.ejemplo_indicativo}"</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-3 py-14 grayscale opacity-60">
                                                            <div className="size-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                                <span className="material-symbols-rounded text-slate-300 text-2xl">psychology</span>
                                                            </div>
                                                            <p className="text-[10px] font-medium text-slate-400 px-4">Pasa el mouse sobre un verbo para ver su fundamentación.</p>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contents */}
                                <div className="space-y-4">
                                    <label className="text-sm font-black text-blue-600 uppercase tracking-widest block px-1">Paso 3.2: Contenidos asociados</label>
                                    <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                        {availableContents.length > 0 ? (
                                            availableContents.filter(c => !c.padre_id).map(parent => {
                                                const children = availableContents.filter(c => c.padre_id === parent.id);
                                                const isExpanded = expandedTitles.includes(parent.id);
                                                const isParentSelected = currentObjective.contentIds.includes(parent.id);
                                                const isParentCovered = learningObjectives.some(obj => obj.contentIds.includes(parent.id));

                                                return (
                                                    <div key={parent.id} className="space-y-1">
                                                        <div
                                                            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-4 group/item ${isParentCovered
                                                                ? 'bg-emerald-50 border-emerald-100 opacity-60 cursor-default'
                                                                : isParentSelected
                                                                    ? 'bg-indigo-50 border-indigo-200 cursor-pointer shadow-sm'
                                                                    : 'bg-slate-50 border-transparent hover:border-slate-200 cursor-pointer'
                                                                }`}
                                                            onClick={() => {
                                                                if (isParentCovered) return;
                                                                const ids = currentObjective.contentIds.includes(parent.id)
                                                                    ? currentObjective.contentIds.filter((id: number) => id !== parent.id)
                                                                    : [...currentObjective.contentIds, parent.id];
                                                                setCurrentObjective((prev: any) => ({ ...prev, contentIds: ids }));
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
                                                            <div className="flex-1 text-sm font-black">{parent.titulo}</div>
                                                            {children.length > 0 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setExpandedTitles((prev: number[]) =>
                                                                            prev.includes(parent.id) ? prev.filter(id => id !== parent.id) : [...prev, parent.id]
                                                                        );
                                                                    }}
                                                                    className={`size-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180' : 'bg-white text-slate-400 border border-slate-100'}`}
                                                                >
                                                                    <span className="material-symbols-rounded">expand_more</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {isExpanded && children.length > 0 && (
                                                            <div className="pl-6 space-y-1.5 animate-in slide-in-from-top-4 duration-300 py-1">
                                                                {children.map(child => {
                                                                    const isChildSelected = currentObjective.contentIds.includes(child.id);
                                                                    const isChildCovered = learningObjectives.some(obj => obj.contentIds.includes(child.id));
                                                                    return (
                                                                        <div
                                                                            key={child.id}
                                                                            onClick={() => {
                                                                                if (isChildCovered) return;
                                                                                const ids = currentObjective.contentIds.includes(child.id)
                                                                                    ? currentObjective.contentIds.filter((id: number) => id !== child.id)
                                                                                    : [...currentObjective.contentIds, child.id];
                                                                                setCurrentObjective((prev: any) => ({ ...prev, contentIds: ids }));
                                                                            }}
                                                                            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${isChildCovered ? 'bg-emerald-50 opacity-60' : isChildSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:border-slate-200'}`}
                                                                        >
                                                                            <span className="text-[11px] font-bold">{child.titulo}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-slate-400 p-4 text-center">Sin contenidos cargados.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Complements */}
                                <div className="space-y-6">
                                    <label className="text-xs font-black text-blue-600 uppercase tracking-widest block px-1">Paso 3.3: ¿Para qué? (Complemento)</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCompCategory('')}
                                            className={`px-5 py-2.5 rounded-full text-[11px] font-black transition-all border-2 ${!selectedCompCategory ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}
                                        >
                                            TODOS
                                        </button>
                                        {complementCategories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCompCategory(cat)}
                                                className={`px-5 py-2.5 rounded-full text-[11px] font-black transition-all border-2 ${selectedCompCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                        <div className="lg:col-span-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {filteredComplementos.map(comp => (
                                                <button
                                                    key={comp.id}
                                                    onMouseEnter={() => setHoveredComplement(comp)}
                                                    onMouseLeave={() => setHoveredComplement(null)}
                                                    onClick={() => setCurrentObjective((prev: any) => ({
                                                        ...prev,
                                                        complementId: prev.complementId === comp.id ? null : comp.id,
                                                        complement: prev.complementId === comp.id ? '' : comp.complemento
                                                    }))}
                                                    className={`p-3 rounded-xl text-left border-2 text-[11px] font-medium transition-all ${currentObjective.complementId === comp.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-100 hover:border-indigo-100'}`}
                                                >
                                                    {comp.complemento}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="hidden lg:block sticky top-4">
                                            {hoveredComplement || currentObjective.complementId ? (
                                                <div className="bg-blue-900 p-5 rounded-2xl text-white">
                                                    <h4 className="text-xs font-black uppercase text-blue-400">Información</h4>
                                                    <p className="text-[10px] text-slate-300 mt-2">"{(hoveredComplement || catalogoComplementos.find(c => c.id === currentObjective.complementId)).complemento}"</p>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center py-14 opacity-60">
                                                    <p className="text-[10px] text-slate-400">Pasa el mouse para ver detalles.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <textarea
                                        id="objective-draft-textarea"
                                        value={currentObjective.draft}
                                        onChange={(e) => setCurrentObjective((prev: any) => ({ ...prev, draft: e.target.value, isManual: true }))}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-[13px] font-bold min-h-[100px] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-slate-300"
                                        placeholder="El objetivo se construye automáticamente..."
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button onClick={generateAIObjective} className="bg-slate-900 text-white rounded-xl px-5 py-2 font-black flex gap-2 text-xs">
                                            <span className="material-symbols-rounded text-sm">psychology</span>
                                            REDACTAR CON AI
                                        </Button>
                                        <button onClick={addStrategicObjective} className="bg-blue-600 text-white rounded-lg px-6 py-2.5 font-black text-xs uppercase shadow-md shadow-blue-100 transition-all hover:scale-105 active:scale-95">
                                            Guardar Objetivo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="bg-slate-50 rounded-2xl p-6 space-y-6">
                                    <div className="space-y-3">
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-600 uppercase">Quiero</span>
                                            <input
                                                type="text"
                                                value={manualObjective.quiero}
                                                onChange={(e) => setManualObjective((prev: any) => ({ ...prev, quiero: e.target.value }))}
                                                className="flex-1 bg-transparent border-0 font-bold focus:ring-0 text-sm"
                                                placeholder="..."
                                            />
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                                            <span className="text-[10px] font-black text-blue-600 uppercase">para que</span>
                                            <input
                                                type="text"
                                                value={manualObjective.paraQue}
                                                onChange={(e) => setManualObjective((prev: any) => ({ ...prev, paraQue: e.target.value }))}
                                                className="flex-1 bg-transparent border-0 font-bold focus:ring-0 text-sm"
                                                placeholder="..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={improveManualWithAI} className="flex-1 bg-indigo-600 h-10 rounded-xl font-black text-xs">MEJORAR CON AI</Button>
                                        <Button onClick={() => {
                                            const text = `Quiero ${manualObjective.quiero} para que ${manualObjective.paraQue}.`;
                                            setCurrentObjective((prev: any) => ({ ...prev, draft: text }));
                                            addStrategicObjective();
                                            setManualObjective({ quiero: '', paraQue: '', medire: '' });
                                        }} className="flex-1 bg-blue-600 h-10 rounded-xl font-black text-xs">GUARDAR</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Results & Saved Objectives */}
                <div className="space-y-6">
                    {aiOptions.length > 0 && (
                        <div className="bg-blue-900 p-4 rounded-2xl text-white">
                            <h4 className="font-black text-[10px] text-blue-200 uppercase mb-4 tracking-widest">Sugerencias AI</h4>
                            <div className="space-y-3">
                                {aiOptions.map(opt => (
                                    <div key={opt.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center gap-4">
                                        <p className="text-xs font-medium leading-relaxed">{opt.description}</p>
                                        <button onClick={() => {
                                            setCurrentObjective((prev: any) => ({ ...prev, draft: opt.description }));
                                            addStrategicObjective();
                                        }} className="px-3 py-1.5 bg-emerald-500 rounded-lg text-[9px] font-black uppercase text-white whitespace-nowrap">USAR</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-900">Objetivos Guardados ({learningObjectives.length})</h3>
                        <div className="space-y-2">
                            {learningObjectives.map((obj, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border-2 border-slate-100 flex items-start gap-4 shadow-sm">
                                    <span className="size-6 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                                    <div className="flex-1 space-y-1 pt-0.5">
                                        <p className="font-bold text-slate-700 text-sm leading-relaxed">{obj.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
