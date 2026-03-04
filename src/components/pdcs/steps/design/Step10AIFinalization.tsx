'use client';

import { Button } from '@/components/ui/button';

interface Props {
    pdcName: string;
    levelColor: string;
    levelText: string;
}

export function Step10AIFinalization({
    pdcName,
    levelColor,
    levelText
}: Props) {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center space-y-6">
                <div className="relative inline-block">
                    <div className="size-32 bg-blue-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 rotate-6 animate-bounce">
                        <span className="material-symbols-rounded text-6xl text-white">magic_button</span>
                    </div>
                    <div className="absolute -top-2 -right-2 size-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                        <span className="material-symbols-rounded text-white text-xl">check</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        ¡Planificación Completada!
                    </h2>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
                        Has diseñado todos los componentes pedagógicos para <span className="text-blue-600 font-black">{pdcName}</span>.
                    </p>
                </div>
            </div>

            <div className="bg-white p-10 border border-slate-100 shadow-2xl rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 size-80 bg-blue-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-70"></div>

                <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                        <div className="size-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100">
                            <span className="material-symbols-rounded text-4xl text-blue-600">psychology</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 uppercase">Revisión Asistida con IA</h4>
                            <p className="text-sm font-bold text-slate-500">
                                El siguiente paso es optimizar tu PDC utilizando nuestro motor de inteligencia artificial.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:bg-slate-50">
                            <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-rounded">check_circle</span>
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Coherencia Pedagógica</span>
                        </div>
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:bg-slate-50">
                            <div className="size-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-rounded">auto_fix_high</span>
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Ortografía y Redacción</span>
                        </div>
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:bg-slate-50">
                            <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-rounded">insights</span>
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Análisis de Resultados</span>
                        </div>
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:bg-slate-50">
                            <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-rounded">description</span>
                            </div>
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Generación de PDF</span>
                        </div>
                    </div>

                    <div className="pt-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Pulsa finalizar para proceder</p>
                        <div className="text-xs text-slate-400 font-bold leading-relaxed px-10">
                            Tu trabajo ha sido guardado automáticamente. Puedes volver a editar cualquier paso antes de iniciar la revisión definitiva.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
