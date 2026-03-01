'use client';

import { useState } from 'react';

interface Props {
    selectedTrimestre: number | null;
    selectedMes: number | null;
    pdcWeeks: any[];
    pdcDates: { inicio: string; fin: string };
    weekContentsMap: Record<number, any[]>;
    learningObjectives: any[];
    selectedAreas: string[];
    levelColor: string;
}

export function SemanasContenidos({
    selectedTrimestre,
    pdcDates,
    weekContentsMap,
    learningObjectives,
    levelColor
}: Props) {
    const hasWeeks = Object.keys(weekContentsMap).length > 0;
    const sortedWeekKeys = Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b));

    const [activeWeek, setActiveWeek] = useState<number>(
        hasWeeks ? Number(sortedWeekKeys[0]) : 1
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 animate-in fade-in slide-in-from-right-8 duration-700 pt-2">

            {/* Minimalist Vertical Week Selector */}
            {hasWeeks && (
                <div className="lg:col-span-2 space-y-1">
                    <div className="flex flex-col gap-1 px-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2 block">
                            Semanas
                        </label>
                        {sortedWeekKeys.map(weekNumStr => (
                            <button
                                key={weekNumStr}
                                onClick={() => setActiveWeek(Number(weekNumStr))}
                                className={`w-full px-3 py-2 rounded-xl font-black text-xs tracking-tight transition-all text-left border-2 relative overflow-hidden flex items-center gap-2 ${activeWeek === Number(weekNumStr)
                                    ? `bg-blue-600 text-white border-${levelColor} shadow-lg scale-[1.05] z-10`
                                    : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100 opacity-80 shadow-none'
                                    }`}
                            >
                                <span className={`size-1 rounded-full ${activeWeek === Number(weekNumStr) ? `bg-${levelColor} animate-pulse` : 'bg-slate-100'}`}></span>
                                S{weekNumStr}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-100 mx-1">
                        <div className="flex-1 text-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase block tracking-widest leading-none mb-1">Ini</span>
                            <span className={`text-[11px] font-black text-${levelColor}`}>{new Date(pdcDates.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="text-[10px] font-black text-slate-300 uppercase block tracking-widest leading-none mb-1">Fin</span>
                            <span className="text-[11px] font-black text-emerald-600">{new Date(pdcDates.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${hasWeeks ? 'lg:col-span-10' : 'lg:col-span-12'} space-y-4`}>
                {hasWeeks ? (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-4 relative overflow-hidden min-h-[450px]">
                        {/* Compact Header */}
                        <div className="flex items-center gap-4 pb-3 border-b border-slate-100">
                            <div className={`size-8 bg-${levelColor} text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg`}>
                                {activeWeek}
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">Contenidos de la Semana {activeWeek}</h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">
                                    {weekContentsMap[activeWeek]?.length || 0} Elementos Planificados
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(() => {
                                const weekContents = weekContentsMap[activeWeek] || [];
                                const rootContents = weekContents.filter(c => {
                                    const isTheme = !c.padre_id;
                                    if (isTheme) return true;
                                    return !weekContents.find(p => p.id === c.padre_id);
                                });

                                return rootContents.map(content => {
                                    const isTheme = !content.padre_id;
                                    const subthemes = weekContents.filter(c => c.padre_id === content.id);
                                    const isCovered = learningObjectives.some(obj => obj.contentIds.includes(content.id));

                                    return (
                                        <div key={content.id} className="space-y-1">
                                            <div className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 group/item ${isCovered ? 'bg-emerald-50/50 border-emerald-100/50' : `bg-white border-slate-100 hover:border-${levelColor}/30 shadow-sm`
                                                }`}>
                                                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${isTheme ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                                    <span className="material-symbols-rounded text-lg">{isTheme ? 'folder_open' : 'description'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCovered ? 'text-emerald-500' : `text-${levelColor}`}`}>
                                                            {isTheme ? 'TEMA CENTRAL' : 'CONTENIDO'}
                                                        </span>
                                                        {isCovered && (
                                                            <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Planificado</span>
                                                        )}
                                                    </div>
                                                    <h4 className={`text-sm font-black tracking-tight leading-tight truncate ${isCovered ? 'text-emerald-900/80' : 'text-slate-900'}`}>
                                                        {content.titulo}
                                                    </h4>
                                                </div>

                                                <div className={`size-4 rounded-full flex items-center justify-center shrink-0 ${isCovered ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-50 text-slate-200'}`}>
                                                    <span className="material-symbols-rounded text-[10px]">{isCovered ? 'check' : 'circle'}</span>
                                                </div>
                                            </div>

                                            {subthemes.length > 0 && (
                                                <div className="pl-4 space-y-1">
                                                    {subthemes.map(sub => {
                                                        const isSubCovered = learningObjectives.some(obj => obj.contentIds.includes(sub.id));
                                                        return (
                                                            <div key={sub.id} className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-3 ${isSubCovered ? 'bg-emerald-50/20 border-emerald-50' : 'bg-white/50 border-slate-100 hover:border-slate-300'
                                                                }`}>
                                                                <div className="h-2 w-2 border-l-2 border-b-2 border-slate-200 rounded-bl-md shrink-0 -mt-1"></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs font-bold truncate ${isSubCovered ? 'text-emerald-700/70' : 'text-slate-600'}`}>
                                                                        {sub.titulo}
                                                                    </p>
                                                                </div>
                                                                {isSubCovered && (
                                                                    <span className="material-symbols-rounded text-emerald-500 text-sm">verified</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                ) : (
                    <div className="py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="size-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                            <span className="material-symbols-rounded text-4xl text-slate-200">event_busy</span>
                        </div>
                        <h3 className="text-base font-black text-slate-400 uppercase tracking-widest">SIN PLANIFICACIÓN SEMANAL</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
