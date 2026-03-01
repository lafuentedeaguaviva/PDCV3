'use client';

import { AreaTrabajo } from '@/types';

interface Props {
    selectedType: number | null;
    levelColor: string;
    levelText: string;
    mainAreaDetails: AreaTrabajo | null;
    userProfile: any;
    selectedTrimestre: number | null;
    pdcDates: { inicio: string; fin: string };
}

export function DataReferential({
    selectedType,
    levelColor,
    levelText,
    mainAreaDetails,
    userProfile,
    selectedTrimestre,
    pdcDates
}: Props) {
    return (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 pt-6">

            <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-xl shadow-slate-200/50 font-outfit">
                <table className="w-full border-collapse text-left">
                    <tbody>
                        <tr className="border-b border-slate-100">
                            <td className="p-5 w-1/4 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 italic">Distrito educativo</td>
                            <td className="p-5 w-1/4 font-black text-slate-800 border-r border-slate-100 text-base tracking-tight">
                                {mainAreaDetails?.unidad_educativa?.distrito?.nombre || 'Omereque'}
                            </td>
                            <td className="p-5 w-1/4 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 italic">Unidad educativa</td>
                            <td className="p-5 w-1/4 font-black text-slate-800 text-base tracking-tight">
                                {mainAreaDetails?.unidad_educativa?.nombre || 'Anselmo Andreotti'}
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                            <td className="p-5 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 italic">Nivel</td>
                            <td className="p-5 font-black text-slate-800 border-r border-slate-100 text-base tracking-tight flex items-center gap-2">
                                <div className={`size-2 bg-${levelColor} rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]`}></div>
                                {levelText}
                            </td>
                            <td className="p-5 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 italic">Año / Paralelos</td>
                            <td className="p-5 font-black text-slate-800 text-base tracking-tight">
                                {(mainAreaDetails?.area_conocimiento as any)?.grado?.nombre}
                                {mainAreaDetails?.paralelos && mainAreaDetails.paralelos.length > 0 &&
                                    ` - "${mainAreaDetails.paralelos.map(p => p.nombre).join('", "')}"`}
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                            <td className="p-5 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 italic">Maestra/o</td>
                            <td colSpan={3} className="p-5 font-black text-slate-800 text-base tracking-tight">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                                        <span className="material-symbols-rounded text-xl">person</span>
                                    </div>
                                    {userProfile?.nombre_completo || 'Cargando...'}
                                </div>
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                            <td className="p-5 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 italic">Área de Planificación</td>
                            <td colSpan={3} className={`p-5 font-black text-${levelColor} text-lg tracking-tight bg-${levelColor}/5 italic uppercase`}>
                                {mainAreaDetails?.area_conocimiento?.nombre || 'Biología - Geografía'}
                            </td>
                        </tr>
                        <tr>
                            <td rowSpan={2} className="p-5 bg-slate-50/50 font-black text-slate-400 text-xs uppercase tracking-widest border-r border-slate-100 align-top italic">Trimestre y Fechas</td>
                            <td colSpan={3} className="p-5 font-black text-slate-900 border-b border-slate-100 text-lg tracking-tight uppercase italic underline decoration-${levelColor}/30 underline-offset-8">
                                {selectedTrimestre === 1 ? 'PRIMER TRIMESTRE' : selectedTrimestre === 2 ? 'SEGUNDO TRIMESTRE' : 'TERCER TRIMESTRE'}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="p-5 font-black text-slate-400 text-xs tracking-[0.3em] uppercase">
                                Vigencia del {new Date(pdcDates.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} al {new Date(pdcDates.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
