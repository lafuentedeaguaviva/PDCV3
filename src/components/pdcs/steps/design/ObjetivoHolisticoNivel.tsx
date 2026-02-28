'use client';


interface Props {
    objetivoNivel: string;
    setObjetivoNivel: (val: string) => void;
    levelColor: string;
    levelText: string;
}

export function ObjetivoHolisticoNivel({
    objetivoNivel,
    setObjetivoNivel,
    levelColor,
    levelText
}: Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pt-6">

            <div className="bg-white p-6 rounded-2xl border-2 border-slate-50 shadow-xl space-y-6 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 size-48 bg-${levelColor}/5 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-1000`}></div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 italic">
                            <div className={`h-1 w-6 bg-${levelColor} rounded-full`}></div>
                            <p className="text-slate-400 font-bold text-xs tracking-tight">Referencia: "{levelText}"</p>
                        </div>
                    </div>
                    <div className={`size-12 bg-${levelColor}/5 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-3 transition-transform duration-500`}>
                        <span className={`material-symbols-rounded text-xl text-${levelColor}`}>psychology_alt</span>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <label className={`text-[9px] font-black text-${levelColor} uppercase tracking-widest block px-2`}>Cuerpo del Objetivo Estratégico</label>
                    <div className="relative">
                        <textarea
                            value={objetivoNivel}
                            onChange={(e) => setObjetivoNivel(e.target.value)}
                            className={`w-full min-h-[150px] bg-slate-50/50 border-2 border-transparent focus:border-${levelColor}/20 focus:bg-white rounded-xl p-6 font-bold text-sm text-slate-700 shadow-inner transition-all leading-relaxed custom-scrollbar outline-none placeholder:text-slate-200`}
                            placeholder="Cargando objetivo del nivel..."
                        />
                        <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
                            <span className="material-symbols-rounded text-4xl">format_quote</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
