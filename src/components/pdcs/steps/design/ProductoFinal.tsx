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
                    <div className="flex flex-col">
                        <h3 className="text-xl font-black text-slate-900 uppercase">Producto Final del PDC</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5">Define el resultado tangible de este proceso educativo</p>
                    </div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <div className={`size-7 bg-gradient-to-br from-${levelColor} to-slate-400 text-white rounded-lg flex items-center justify-center shadow-sm`}>
                            <span className="material-symbols-rounded text-base">verified</span>
                        </div>
                        Descripción del Producto Final: {levelText}
                    </label>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 block">Descripción del Producto</label>
                        <textarea
                            value={finalProductState}
                            onChange={(e) => setFinalProductState(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 min-h-[120px] resize-none focus:border-slate-300 focus:ring-0 outline-none transition-all shadow-sm leading-relaxed"
                            placeholder="Ej: Álbum de recortes sobre la historia de la comunidad con reflexiones éticas..."
                        />
                    </div>
                    <div className="absolute bottom-4 right-4 flex flex-col items-end opacity-20 pointer-events-none">
                        <p className="text-sm font-black text-slate-400 tracking-tight leading-relaxed italic border-l-4 border-slate-200 pl-4 py-1">
                            Este producto representa la síntesis de los conocimientos, habilidades y valores desarrollados durante todas las semanas planificadas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
