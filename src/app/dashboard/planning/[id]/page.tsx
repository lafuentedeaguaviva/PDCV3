'use client';

/**
 * View: AreaPlanningPage
 * 
 * Interfaz principal para la planificación semanal de un área específica.
 * Delega la gestión del estado y la lógica de negocio al controlador usePlanningController.
 */

import { use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScheduleConfigModal } from '@/components/planning/ScheduleConfigModal';
import { PlanningSplitView } from '@/components/planning/PlanningSplitView';
import { usePlanningController } from '@/hooks/usePlanningController';

interface Props {
    params: Promise<{ id: string }>;
}

function PlanningContent({ id }: { id: string }) {
    const router = useRouter();
    const controller = usePlanningController(id);

    const {
        area,
        userContents,
        areaSchedule,
        globalSchedule,
        loading,
        showConfig,
        currentTrimestre,
        gestion,
        plannedContentIds
    } = controller;

    if (loading) {
        return <PlanningSkeleton />;
    }

    if (!area) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Área de trabajo no encontrada</h2>
                <Button variant="ghost" onClick={() => router.push('/dashboard/planning')} className="mt-4">
                    Volver a planificación
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Sticky */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 pb-4 pt-6 px-8">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/dashboard/planning')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {area.unidad_educativa.nombre}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Gestion {gestion}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                {area.area_conocimiento.nombre}
                                <span className="ml-3 text-slate-300 font-medium">/ Planificación Semanal</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {[1, 2, 3].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => controller.setCurrentTrimestre(t)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${currentTrimestre === t
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {t}º TRIMESTRE
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="h-10 rounded-xl font-black text-xs uppercase tracking-widest border-slate-200"
                            onClick={() => controller.setShowConfig(true)}
                        >
                            <span className="material-symbols-rounded text-sm mr-2">settings</span>
                            Ajustar Cronograma
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-120px)] pb-12">
                {areaSchedule.length > 0 ? (
                    <PlanningSplitView
                        area={area}
                        userContents={userContents}
                        areaSchedule={areaSchedule}
                        setAreaSchedule={controller.setAreaSchedule}
                        plannedContentIds={plannedContentIds}
                        onRefresh={controller.refreshScheduleOnly}
                        handleAssign={controller.handleAssign}
                        handleRemoveAssignment={controller.handleRemoveAssignment}
                        isProcessing={controller.isProcessing}
                    />
                ) : (
                    <EmptySchedulePlaceholder onShowConfig={() => controller.setShowConfig(true)} />
                )}
            </div>

            {showConfig && (
                <ScheduleConfigModal
                    areaId={id}
                    gestion={gestion}
                    trimestre={currentTrimestre}
                    globalSchedule={globalSchedule}
                    onClose={() => controller.setShowConfig(false)}
                    onSuccess={controller.handleConfigSuccess}
                />
            )}
        </div>
    );
}

export default function AreaPlanningPage({ params }: Props) {
    const { id } = use(params);
    return (
        <Suspense fallback={<PlanningSkeleton />}>
            <PlanningContent id={id} />
        </Suspense>
    );
}

// Sub-componentes Atómicos para mejorar legibilidad
function PlanningSkeleton() {
    return (
        <div className="p-8">
            <div className="animate-pulse space-y-4">
                <div className="h-8 w-64 bg-slate-200 rounded"></div>
                <div className="h-4 w-48 bg-slate-100 rounded"></div>
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="h-96 bg-slate-50 rounded-3xl border border-slate-100"></div>
                    <div className="h-96 bg-slate-50 rounded-3xl border border-slate-100"></div>
                </div>
            </div>
        </div>
    );
}

function EmptySchedulePlaceholder({ onShowConfig }: { onShowConfig: () => void }) {
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-rounded text-4xl text-slate-300">calendar_today</span>
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Sin cronograma disponible</h2>
                <p className="text-slate-400 max-w-sm mx-auto font-medium">
                    No se ha definido un calendario global para este trimestre o ha ocurrido un error al cargar los datos.
                </p>
            </div>
            <Button
                variant="outline"
                onClick={onShowConfig}
                className="h-12 px-8 rounded-2xl font-black"
            >
                Configuración Manual
            </Button>
        </div>
    );
}
