'use client';

import { Input } from '@/components/ui/input';

interface Props {
    pdcName: string;
    setPdcName: (val: string) => void;
    selectedAreas: string[];
    areas: any[];
}

export function Step3ConfirmationName({
    pdcName,
    setPdcName,
    selectedAreas,
    areas
}: Props) {
    const selectedAreasNames = selectedAreas.map(id => {
        const area = areas.find(a => String(a.id) === String(id));
        return area?.area_conocimiento?.nombre || 'Área';
    });

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center space-y-4">
                <div className="size-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 rotate-3 group hover:rotate-6 transition-transform duration-500">
                    <span className="material-symbols-rounded text-4xl text-white">verified</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        ¡Todo listo para comenzar!
                    </h2>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
                        Hemos configurado la estructura base. Ahora, dale un nombre a tu planificación para identificarla fácilmente.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 border border-slate-100 shadow-xl rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 size-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

                <div className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">
                            Nombre del PDC
                        </label>
                        <Input
                            value={pdcName}
                            onChange={(e) => setPdcName(e.target.value)}
                            placeholder="Ej: PDC 1ER TRIMESTRE - MATEMÁTICAS"
                            className="h-16 px-6 text-xl font-bold bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl transition-all shadow-inner"
                        />
                    </div>

                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Resumen de Configuración</h4>
                        <div className="flex flex-wrap gap-3">
                            {selectedAreasNames.map((name, i) => (
                                <div key={i} className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-xs font-black text-blue-600 uppercase tracking-widest shadow-sm">
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-rounded text-white text-xl">info</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-blue-900 uppercase tracking-tight">Registro Oficial</p>
                            <p className="text-xs text-blue-600/80 font-bold leading-relaxed">
                                Al continuar, se creará formalmente el registro de este PDC en tu biblioteca personal y comenzaremos con el diseño pedagógico detallado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
