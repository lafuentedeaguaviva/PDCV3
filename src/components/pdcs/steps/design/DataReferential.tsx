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
                            <td className="p-4 w-1/4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100">Distrito educativo</td>
                            <td className="p-4 w-1/4 font-black text-slate-800 border-r border-slate-100 text-sm tracking-tight">
                                {mainAreaDetails?.unidad_educativa?.distrito?.nombre || 'Omereque'}
                            </td>
                            <td className="p-4 w-1/4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100">Unidad educativa</td>
                            <td className="p-4 w-1/4 font-black text-slate-800 text-sm tracking-tight">
                                {mainAreaDetails?.unidad_educativa?.nombre || 'Anselmo Andreotti'}
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                            <td className="p-4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100">Nivel</td>
                            <td className="p-4 font-black text-slate-800 border-r border-slate-100 text-sm tracking-tight flex items-center gap-2">
                                <div className={`size-1.5 bg-${levelColor} rounded-full`}></div>
                                {levelText}
                            </td>
                            <td className="p-4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100">Año / Paralelos</td>
                            <td className="p-4 font-black text-slate-800 text-sm tracking-tight">
                                {(mainAreaDetails?.area_conocimiento as any)?.grado?.nombre}
                                {mainAreaDetails?.paralelos && mainAreaDetails.paralelos.length > 0 &&
                                    ` - "${mainAreaDetails.paralelos.map(p => p.nombre).join('", "')}"`}
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                            <td className="p-4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100">Maestra/o</td>
                            <td colSpan={3} className="p-4 font-black text-slate-800 text-sm tracking-tight">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-rounded text-base">person</span>
                                    </div>
                                    {userProfile?.nombre_completo || 'Cargando...'}
                                </div>
                            </td>
                        </tr>
                        <tr className="border-b border-slate-100">
                            <td className="p-4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100">Área de Planificación</td>
                            <td colSpan={3} className={`p-4 font-black text-${levelColor} text-base tracking-tight bg-${levelColor}/5`}>
                                {mainAreaDetails?.area_conocimiento?.nombre || 'Biología - Geografía'}
                            </td>
                        </tr>
                        <tr>
                            <td rowSpan={2} className="p-4 bg-slate-50/50 font-black text-slate-400 text-[9px] uppercase tracking-widest border-r border-slate-100 align-top">Trimestre y Fechas</td>
                            <td colSpan={3} className="p-4 font-black text-slate-900 border-b border-slate-100 text-base tracking-tight">
                                {selectedTrimestre === 1 ? 'PRIMER TRIMESTRE' : selectedTrimestre === 2 ? 'SEGUNDO TRIMESTRE' : 'TERCER TRIMESTRE'}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="p-4 font-bold text-slate-400 text-xs tracking-widest uppercase">
                                Vigencia del {new Date(pdcDates.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} al {new Date(pdcDates.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
