'use client';

import React, { useState } from 'react';

interface Props {
    weekContentsMap: Record<number, any[]>;
    weekDesignState: Record<number, any>;
    setWeekDesignState: (val: any) => void;
    levelColor: string;
}

export function CriteriosEvaluacion({
    weekContentsMap,
    weekDesignState,
    setWeekDesignState,
    levelColor
}: Props) {
    const [activeWeek, setActiveWeek] = useState<number>(
        Object.keys(weekContentsMap).length > 0 ? Number(Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b))[0]) : 1
    );

    const hasWeeks = Object.keys(weekContentsMap).length > 0;

    const dimensions = [
        { id: 'ser', label: 'SER (Actitudes)', icon: 'favorite', gradient: 'from-rose-500 to-pink-500' },
        { id: 'saber', label: 'SABER (Conocimientos)', icon: 'psychology', gradient: 'from-blue-500 to-indigo-500' },
        { id: 'hacer', label: 'HACER (Habilidades)', icon: 'construction', gradient: 'from-emerald-500 to-teal-500' },
        { id: 'decidir', label: 'DECIDIR (Impacto)', icon: 'gavel', gradient: 'from-amber-500 to-orange-500' }
    ];

    const currentCriterios = weekDesignState[activeWeek]?.criterios || { ser: '', saber: '', hacer: '', decidir: '' };

    const handleUpdate = (dim: string, value: string) => {
        setWeekDesignState((prev: any) => ({
            ...prev,
            [activeWeek]: {
                ...(prev[activeWeek] || {}),
                criterios: {
                    ...(prev[activeWeek]?.criterios || { ser: '', saber: '', hacer: '', decidir: '' }),
                    [dim]: value
                }
            }
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 animate-in fade-in slide-in-from-right-8 duration-700 pt-2">

            {/* Minimalist Vertical Week Selector */}
            {hasWeeks && (
                <div className="lg:col-span-2 space-y-1">
                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-tighter px-2 mb-1 block">
                        Semanas
                    </label>
                    <div className="flex flex-col gap-1 px-1">
                        {Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b)).map(weekNumStr => (
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
                </div>
            )}

            <div className={`${hasWeeks ? 'lg:col-span-10' : 'lg:col-span-12'} space-y-2`}>
                {/* Evaluation Dimensions Grid - Compact */}
                {hasWeeks ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {dimensions.map(dim => (
                            <div key={dim.id} className="bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden group">
                                <div className="p-2.5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`size-6 bg-gradient-to-br ${dim.gradient} text-white rounded-lg flex items-center justify-center shadow-sm`}>
                                            <span className="material-symbols-rounded text-base">{dim.icon}</span>
                                        </div>
                                        <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest">
                                            {dim.label}
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={(currentCriterios as any)[dim.id] || ''}
                                            onChange={(e) => handleUpdate(dim.id, e.target.value)}
                                            className={`w-full bg-slate-50/50 border border-transparent focus:border-slate-100 focus:bg-white rounded-lg p-2 text-[10px] font-medium text-slate-600 transition-all min-h-[100px] resize-none outline-none leading-relaxed placeholder:text-slate-200`}
                                            placeholder={`Criterios para el ${dim.label}...`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center bg-slate-50 rounded-xl border border-dashed border-slate-100">
                        <span className="material-symbols-rounded text-2xl text-slate-200 mb-2 block">event_busy</span>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sin semanas planificadas</h3>
                    </div>
                )}
            </div>
        </div>
    );
}

