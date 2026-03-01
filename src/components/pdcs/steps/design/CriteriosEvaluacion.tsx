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
    const [activeDimension, setActiveDimension] = useState<string>('ser');

    const hasWeeks = Object.keys(weekContentsMap).length > 0;

    const dimensions = [
        { id: 'ser', label: 'SER (Actitudes)', icon: 'favorite', gradient: 'from-rose-500 to-pink-500', color: 'rose-500' },
        { id: 'saber', label: 'SABER (Conocimientos)', icon: 'psychology', gradient: 'from-blue-500 to-indigo-500', color: 'blue-500' },
        { id: 'hacer', label: 'HACER (Habilidades)', icon: 'construction', gradient: 'from-emerald-500 to-teal-500', color: 'emerald-500' },
        { id: 'decidir', label: 'DECIDIR (Impacto)', icon: 'gavel', gradient: 'from-amber-500 to-orange-500', color: 'amber-500' }
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

    const currentActiveDimension = dimensions.find(d => d.id === activeDimension);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 animate-in fade-in slide-in-from-right-8 duration-700 pt-2">

            {/* Selector de Dimensiones y Semanas */}
            {hasWeeks && (
                <div className="lg:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2 block">
                        Dimensiones
                    </label>
                    <div className="flex flex-col gap-1 px-1 mb-6">
                        {dimensions.map(dim => (
                            <button
                                key={dim.id}
                                onClick={() => setActiveDimension(dim.id)}
                                className={`w-full px-3 py-3 rounded-xl font-black text-xs uppercase tracking-tight transition-all text-left border-2 relative overflow-hidden flex items-center gap-3 ${activeDimension === dim.id
                                    ? `bg-blue-600 text-white border-${dim.color} shadow-lg scale-[1.05] z-10`
                                    : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100 opacity-80 shadow-none'
                                    }`}
                            >
                                <span className={`size-1.5 rounded-full ${activeDimension === dim.id ? `bg-${dim.color} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]` : 'bg-slate-100'}`}></span>
                                {dim.id}
                            </button>
                        ))}
                    </div>

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

            <div className={`${hasWeeks ? 'lg:col-span-10' : 'lg:col-span-12'} space-y-2`}>
                {hasWeeks ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-6 relative overflow-hidden min-h-[450px]">
                        {currentActiveDimension && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                    <div className={`size-12 bg-gradient-to-br ${currentActiveDimension.gradient} text-white rounded-2xl flex items-center justify-center shadow-xl`}>
                                        <span className="material-symbols-rounded text-2xl">{currentActiveDimension.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className={`text-xl font-black text-slate-800 tracking-tight leading-none uppercase`}>
                                            Evaluación: <span className={`text-${currentActiveDimension.color}`}>{currentActiveDimension.label}</span>
                                        </h3>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                                            Semana {activeWeek} • Planificación de Criterios
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 block">Redacción de Criterios</label>
                                    <textarea
                                        value={(currentCriterios as any)[currentActiveDimension.id] || ''}
                                        onChange={(e) => handleUpdate(currentActiveDimension.id, e.target.value)}
                                        className={`w-full bg-slate-50/30 border-2 border-transparent focus:border-${currentActiveDimension.color}/30 focus:bg-white rounded-2xl p-6 text-sm font-bold text-slate-700 transition-all min-h-[250px] resize-none outline-none leading-relaxed placeholder:text-slate-300 shadow-inner shadow-slate-100/50`}
                                        placeholder={`Escribe aquí los criterios de evaluación para el ${currentActiveDimension.label} en la Semana ${activeWeek}...`}
                                    />
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100/50 flex items-start gap-4">
                                    <span className="material-symbols-rounded text-slate-300 text-xl mt-0.5">lightbulb</span>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                                        Tip: Los criterios deben ser observables y medibles. Por ejemplo: "Identifica los valores de respeto en la convivencia comunitaria".
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="size-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
                            <span className="material-symbols-rounded text-4xl text-slate-200">event_busy</span>
                        </div>
                        <h3 className="text-base font-black text-slate-400 uppercase tracking-widest">SIN SEMANAS PLANIFICADAS</h3>
                    </div>
                )}
            </div>
        </div>
    );
}
