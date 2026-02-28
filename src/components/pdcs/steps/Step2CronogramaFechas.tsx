'use client';

interface Props {
    selectedTrimestre: number | null;
    setSelectedTrimestre: (t: number) => void;
    selectedMes: number | null;
    setSelectedMes: (m: number) => void;
    pdcDates: { inicio: string; fin: string };
    handlePdcDatesChange: (field: 'inicio' | 'fin', value: string) => void;
    pdcWeeks: any[];
    addWeek: () => void;
    removeLastWeek: () => void;
}

export function Step2CronogramaFechas({
    selectedTrimestre,
    setSelectedTrimestre,
    selectedMes,
    setSelectedMes,
    pdcDates,
    handlePdcDatesChange,
    pdcWeeks,
    addWeek,
    removeLastWeek
}: Props) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 duration-500 pt-6">
            {/* Selectors */}
            <div className="xl:col-span-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">1. Selecciona Trimestre</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedTrimestre(t)}
                                className={`py-2 rounded-xl font-black text-base transition-all ${selectedTrimestre === t
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                    : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                {t}°
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">2. Selecciona el Mes</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[1, 2, 3].map(m => (
                            <button
                                key={m}
                                onClick={() => setSelectedMes(m)}
                                className={`px-4 py-2.5 rounded-xl font-bold text-left flex items-center justify-between transition-all text-xs ${selectedMes === m
                                    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                                    : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <span>Mes {m} del Trimestre</span>
                                {selectedMes === m && <span className="material-symbols-rounded text-sm">check</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Schedule Preview */}
            <div className="xl:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-50 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-black text-slate-900 leading-tight">Cronograma del Plan</h3>
                                {selectedMes && selectedTrimestre && (
                                    <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                                        <button
                                            onClick={removeLastWeek}
                                            className="size-7 flex items-center justify-center rounded-md hover:bg-white hover:text-rose-600 hover:shadow-sm transition-all text-slate-400"
                                        >
                                            <span className="material-symbols-rounded text-lg">remove</span>
                                        </button>
                                        <span className="px-2 font-black text-slate-600 text-[10px]">
                                            {pdcWeeks.length} Semanas
                                        </span>
                                        <button
                                            onClick={addWeek}
                                            className="size-7 flex items-center justify-center rounded-md hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all text-slate-400"
                                        >
                                            <span className="material-symbols-rounded text-lg">add</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-500 font-medium text-xs">Gestiona las fechas de cada semana de tu cronograma.</p>
                        </div>
                        <div className="size-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-rounded text-xl text-blue-600">calendar_month</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block px-1">Fecha de Inicio</span>
                            <input
                                type="date"
                                value={pdcDates.inicio}
                                onChange={(e) => handlePdcDatesChange('inicio', e.target.value)}
                                className="w-full bg-white border-2 border-white rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-100 focus:ring-0 transition-all cursor-pointer shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block px-1">Fecha de Finalización</span>
                            <input
                                type="date"
                                value={pdcDates.fin}
                                onChange={(e) => handlePdcDatesChange('fin', e.target.value)}
                                className="w-full bg-white border-2 border-white rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-100 focus:ring-0 transition-all cursor-pointer shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-3">
                    {pdcWeeks.length > 0 ? pdcWeeks.map((week, idx) => (
                        <div
                            key={week.id}
                            className="p-3 bg-white rounded-xl border-2 border-slate-50 flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 group hover:border-blue-100 transition-all font-outfit"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="px-3 py-2 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center shrink-0 min-w-[100px]">
                                <span className="text-[8px] font-black uppercase tracking-tighter leading-none mb-1 text-slate-400">Semana {week.semana}</span>
                                <span className="text-[9px] font-bold leading-none text-blue-400 whitespace-nowrap">Mes {week.mes}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-700 text-xs mb-1 uppercase tracking-tight">Cronograma PDC</h4>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-full opacity-20"></div>
                                </div>
                            </div>
                            <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all shrink-0">
                                <span className="material-symbols-rounded text-lg">link</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-16 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                            <span className="material-symbols-rounded text-4xl text-slate-200 mb-2 block">event_busy</span>
                            <h4 className="text-sm font-bold text-slate-500 font-outfit">Selecciona Mes y Trimestre</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
