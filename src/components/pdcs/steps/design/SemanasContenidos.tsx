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
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-tighter px-1 mb-1 block">
                            Semanas
                        </label>
                        {sortedWeekKeys.map(weekNumStr => (
                            <button
                                key={weekNumStr}
                                onClick={() => setActiveWeek(Number(weekNumStr))}
                                className={`w-full px-2 py-1.5 rounded-lg font-black text-[9px] tracking-tight transition-all text-left border relative overflow-hidden flex items-center gap-1.5 ${activeWeek === Number(weekNumStr)
                                    ? `bg-slate-950 text-white border-${levelColor} shadow-sm`
                                    : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100 opacity-80 shadow-none'
                                    }`}
                            >
                                <span className={`size-1 rounded-full ${activeWeek === Number(weekNumStr) ? `bg-${levelColor} animate-pulse` : 'bg-slate-100'}`}></span>
                                S{weekNumStr}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-1 pt-2 border-t border-slate-50 mx-1">
                        <div className="flex-1 text-center">
                            <span className="text-[7px] font-black text-slate-300 uppercase block tracking-tighter leading-none">Ini</span>
                            <span className={`text-[8px] font-black text-${levelColor}`}>{new Date(pdcDates.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="text-[7px] font-black text-slate-300 uppercase block tracking-tighter leading-none">Fin</span>
                            <span className="text-[8px] font-black text-emerald-600">{new Date(pdcDates.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${hasWeeks ? 'lg:col-span-10' : 'lg:col-span-12'} space-y-4`}>
                {hasWeeks ? (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 space-y-4 relative overflow-hidden min-h-[450px]">
                        {/* Compact Header */}
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                            <div className={`size-6 bg-${levelColor} text-white rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm`}>
                                {activeWeek}
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xs font-black text-slate-800 tracking-tight leading-none uppercase">Contenidos de la Semana {activeWeek}</h3>
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    {weekContentsMap[activeWeek]?.length || 0} Elementos
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
                                            <div className={`p-2 rounded-lg border transition-all flex items-center gap-2 group/item ${isCovered ? 'bg-emerald-50/30 border-emerald-100/30' : `bg-white border-slate-50 hover:border-slate-100 shadow-sm`
                                                }`}>
                                                <div className={`size-5 rounded flex items-center justify-center shrink-0 ${isTheme ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <span className="material-symbols-rounded text-xs">{isTheme ? 'folder_open' : 'description'}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-[6px] font-black uppercase tracking-tighter ${isCovered ? 'text-emerald-500' : `text-${levelColor}/70`}`}>
                                                            {isTheme ? 'TEMA' : 'CONTENIDO'}
                                                        </span>
                                                        {isCovered && (
                                                            <span className="bg-emerald-100/50 text-emerald-600 text-[6px] font-black px-1 rounded-full uppercase tracking-tighter">OK</span>
                                                        )}
                                                    </div>
                                                    <h4 className={`text-[10px] font-bold tracking-tight leading-tight truncate ${isCovered ? 'text-emerald-900/80' : 'text-slate-700'}`}>
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
                                                            <div key={sub.id} className={`p-1.5 rounded-md border transition-all flex items-center gap-2 ${isSubCovered ? 'bg-emerald-50/20 border-emerald-50' : 'bg-white/50 border-slate-50/50 hover:border-slate-100'
                                                                }`}>
                                                                <div className="h-1.5 w-1.5 border-l border-b border-slate-200 rounded-bl-sm shrink-0 -mt-1"></div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-[9px] font-bold truncate ${isSubCovered ? 'text-emerald-700/70' : 'text-slate-500'}`}>
                                                                        {sub.titulo}
                                                                    </p>
                                                                </div>
                                                                {isSubCovered && (
                                                                    <span className="material-symbols-rounded text-emerald-500 text-[8px]">check_circle</span>
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
                    <div className="py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="size-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="material-symbols-rounded text-2xl text-slate-200">event_busy</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-400">SIN PLANIFICACIÓN SEMANAL</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
