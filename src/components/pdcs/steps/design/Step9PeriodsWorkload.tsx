'use client';

import { Input } from '@/components/ui/input';

interface Props {
    periodsPerWeek: number;
    setPeriodsPerWeek: (val: number) => void;
    weeklyHours: number;
    setWeeklyHours: (val: number) => void;
    levelColor: string;
}

export function Step9PeriodsWorkload({
    periodsPerWeek,
    setPeriodsPerWeek,
    weeklyHours,
    setWeeklyHours,
    levelColor
}: Props) {
    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="flex flex-col">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Periodos y Carga Horaria</h3>
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Configura el tiempo dedicado a esta área por semana</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 border border-slate-100 shadow-xl rounded-[2.5rem] relative overflow-hidden group hover:border-blue-200 transition-all">
                    <div className="absolute top-0 right-0 size-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors"></div>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="material-symbols-rounded text-3xl">schedule</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase">Periodos Semanales</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de sesiones</p>
                            </div>
                        </div>
                        <Input
                            type="number"
                            value={periodsPerWeek || ''}
                            onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value) || 0)}
                            placeholder="Ej: 4"
                            className="h-16 px-6 text-2xl font-black text-center bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all"
                        />
                        <p className="text-xs text-slate-400 font-bold italic text-center px-4">
                            Indica cuántos periodos de clase se imparten a la semana.
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 border border-slate-100 shadow-xl rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-200 transition-all">
                    <div className="absolute top-0 right-0 size-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors"></div>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="material-symbols-rounded text-3xl">timer</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase">Carga Horaria</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horas cronológicas</p>
                            </div>
                        </div>
                        <Input
                            type="number"
                            value={weeklyHours || ''}
                            onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 0)}
                            placeholder="Ej: 8"
                            className="h-16 px-6 text-2xl font-black text-center bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl transition-all"
                        />
                        <p className="text-xs text-slate-400 font-bold italic text-center px-4">
                            Total de horas académicas mensuales u horaria semanal.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100/50 flex items-start gap-4">
                <div className="size-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-slate-400">lightbulb</span>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Importante para la Planificación</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Esta información es esencial para distribuir los contenidos y asegurar que la carga pedagógica sea adecuada para el tiempo disponible en el aula.
                    </p>
                </div>
            </div>
        </div>
    );
}
