'use client';

/**
 * View: PlanningPage (Bandeja de Entrada)
 * 
 * Interfaz tipo escritorio para seleccionar el área de trabajo a planificar.
 * Implementa MVC delegando la lógica al usePlanningDeskController.
 */

import { useRouter } from 'next/navigation';
import { usePlanningDeskController } from '@/hooks/usePlanningDeskController';
import { AreaTrabajo } from '@/types';
import { PageHeader } from '@/components/ui/page-header';

export default function PlanningPage() {
    const router = useRouter();
    const { areas, loading, gestion } = usePlanningDeskController();

    if (loading) {
        return <PlanningDeskSkeleton />;
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
            <PageHeader
                title="Mi Escritorio"
                subtitle="Bandeja de entrada: Selecciona una de tus clases para empezar a planificar."
                icon="inbox"
                actions={
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-[0.1em] border border-blue-100">
                        Gestión Escolar {gestion}
                    </span>
                }
            />

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {areas.map((area) => (
                    <AreaCard
                        key={area.id}
                        area={area}
                        onClick={() => router.push(`/dashboard/planning/${area.id}`)}
                    />
                ))}

                {areas.length === 0 && (
                    <EmptyDesk onConfigure={() => router.push('/dashboard/areas')} />
                )}
            </div>
        </div>
    );
}

// Sub-componentes Atómicos
function AreaCard({ area, onClick }: { area: AreaTrabajo; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] hover:border-blue-200 transition-all duration-500 p-8 cursor-pointer relative overflow-hidden"
        >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-40 transition-all duration-700 blur-2xl"></div>

            <div className="mb-6">
                <span className="text-[9px] font-black text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-blue-100/30">
                    {area.unidad_educativa?.nombre || 'UNIDAD EDUCATIVA'}
                </span>
            </div>

            <div className="space-y-1.5 mb-8">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {area.area_conocimiento?.nombre}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                    {(area.area_conocimiento as any).grado?.nombre} • {(area.area_conocimiento as any).grado?.nivel?.nombre}
                </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="material-symbols-rounded text-xl">schedule</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        {area.turno?.nombre}
                    </span>
                </div>

                <div className="flex gap-2">
                    {area.paralelos?.map(p => (
                        <span
                            key={p.id}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 text-[11px] font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                        >
                            {p.nombre}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function PlanningDeskSkeleton() {
    return (
        <div className="p-8">
            <div className="animate-pulse space-y-4">
                <div className="h-8 w-48 bg-slate-200 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-50 rounded-3xl border border-slate-100"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function EmptyDesk({ onConfigure }: { onConfigure: () => void }) {
    return (
        <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <span className="material-symbols-rounded text-4xl text-slate-300 mb-4">school</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No tienes clases configuradas</h3>
            <p className="text-slate-400 text-sm max-w-[280px] mx-auto font-medium mb-6">
                Primero debes configurar tus áreas de trabajo para empezar a planificar.
            </p>
            <button
                onClick={onConfigure}
                className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
                Ir a Configuración
            </button>
        </div>
    );
}
