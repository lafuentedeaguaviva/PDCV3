'use client';


interface Props {
    finalProductState: string;
    setFinalProductState: (val: string) => void;
    levelColor: string;
    levelText: string;
}

export function ProductoFinal({
    finalProductState,
    setFinalProductState,
    levelColor,
    levelText
}: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 pt-6">

            {/* Product Definition Card - Compact */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 size-48 bg-${levelColor}/5 rounded-full blur-3xl -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-1000`}></div>

                <div className="space-y-4 relative z-10">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <div className={`size-7 bg-gradient-to-br from-${levelColor} to-slate-400 text-white rounded-lg flex items-center justify-center shadow-sm`}>
                            <span className="material-symbols-rounded text-base">verified</span>
                        </div>
                        Descripción del Producto Final: {levelText}
                    </label>
                    <div className="relative px-0.5">
                        <textarea
                            value={finalProductState}
                            onChange={(e) => setFinalProductState(e.target.value)}
                            className={`w-full bg-slate-50/50 border border-transparent focus:border-${levelColor}/20 focus:bg-white rounded-lg p-3 text-[11px] font-bold text-slate-700 transition-all min-h-[180px] resize-none outline-none leading-relaxed placeholder:text-slate-300`}
                            placeholder="Ejemplo: Elaboración de un catálogo digital interactivo..."
                        />
                        <div className="absolute bottom-4 right-4 flex flex-col items-end opacity-20 pointer-events-none">
                            <span className={`text-[8px] font-black uppercase tracking-widest text-${levelColor}`}>Output Final</span>
                            <div className={`h-0.5 w-12 bg-${levelColor} mt-0.5 rounded-full`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
