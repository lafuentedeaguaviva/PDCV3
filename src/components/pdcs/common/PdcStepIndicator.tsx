'use client';

import React from 'react';

/**
 * PdcStepIndicator
 * 
 * Un componente de navegación estilo paginación para el asistente de PDC.
 * Visualiza el progreso actual y permite una navegación clara.
 */

interface PdcStepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function PdcStepIndicator({ currentStep, totalSteps, className = "" }: PdcStepIndicatorProps) {
    return (
        <div className={`flex items-center gap-1.5 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50 shadow-inner ${className}`}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
                const isActive = s === currentStep;
                const isCompleted = s < currentStep;

                return (
                    <div
                        key={s}
                        className={`
                            size-7 md:size-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black transition-all duration-300
                            ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 scale-110 z-10'
                                : isCompleted
                                    ? 'bg-blue-50 text-blue-500 border border-blue-100'
                                    : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                            }
                        `}
                    >
                        {s}
                    </div>
                );
            })}
        </div>
    );
}
