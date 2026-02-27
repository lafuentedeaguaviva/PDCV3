'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AreasService, AreaTrabajo } from '@/services/areas.service';
import { LibraryService, UserContent } from '@/services/library.service';
import { PdcService } from '@/services/pdc.service';
import { PlanificacionSemanal, PlanificacionGeneral } from '@/types';
import { Button } from '@/components/ui/button';
import { ScheduleConfigModal } from '@/components/planning/ScheduleConfigModal';
import { PlanningSplitView } from '@/components/planning/PlanningSplitView';

export default function AreaPlanningPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [userContents, setUserContents] = useState<UserContent[]>([]);
    const [areaSchedule, setAreaSchedule] = useState<PlanificacionSemanal[]>([]);
    const [globalSchedule, setGlobalSchedule] = useState<PlanificacionGeneral[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [currentTrimestre, setCurrentTrimestre] = useState(1);
    const [gestion] = useState(new Date().getFullYear());

    const [plannedContentIds, setPlannedContentIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadData();
    }, [id, currentTrimestre]);

    const refreshScheduleOnly = async () => {
        const [scheduleData, plannedIds] = await Promise.all([
            PdcService.getAreaSchedule(id, gestion, currentTrimestre),
            PdcService.getAllPlannedContents(id, gestion)
        ]);
        setAreaSchedule(scheduleData);
        setPlannedContentIds(new Set(plannedIds));
    };

    const loadData = async (isInitial = true) => {
        if (isInitial) setLoading(true);
        try {
            // Cargar datos básicos solo si es la carga inicial o si no existen
            let areaData = area;
            if (isInitial || !area) {
                areaData = await AreasService.getAreaById(id);
                setArea(areaData);
            }

            if (areaData) {
                const [userData, scheduleData, globalData, plannedIds] = await Promise.all([
                    LibraryService.getUserContents(id),
                    PdcService.getAreaSchedule(id, gestion, currentTrimestre),
                    PdcService.getGlobalSchedule(gestion, currentTrimestre),
                    PdcService.getAllPlannedContents(id, gestion)
                ]);

                setUserContents(userData);
                setGlobalSchedule(globalData);
                setPlannedContentIds(new Set(plannedIds));

                // Si no hay cronograma local pero sí global, copiarlo automáticamente
                if (scheduleData.length === 0 && globalData.length > 0) {
                    const newWeeks = globalData.map((gw: any) => ({
                        area_trabajo_id: id,
                        gestion,
                        trimestre: currentTrimestre,
                        mes: gw.mes,
                        semana: gw.semana,
                        fecha_inicio_trimestre: gw.fecha_inicio_trimestre,
                        fecha_fin_trimestre: gw.fecha_fin_trimestre
                    }));

                    const result = await PdcService.createAreaSchedule(newWeeks);
                    if (result.success) {
                        const updatedSchedule = await PdcService.getAreaSchedule(id, gestion, currentTrimestre);
                        setAreaSchedule(updatedSchedule);
                    } else {
                        setAreaSchedule([]);
                    }
                } else {
                    setAreaSchedule(scheduleData);
                }
            }
        } catch (error) {
            console.error('Error loading planning data:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const handleConfigSuccess = () => {
        setShowConfig(false);
        loadData(false); // Refrescar sin mostrar el loader grande
    };

    if (loading) {
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
                                    onClick={() => setCurrentTrimestre(t)}
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
                            onClick={() => setShowConfig(true)}
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
                        setAreaSchedule={setAreaSchedule}
                        plannedContentIds={plannedContentIds}
                        onRefresh={refreshScheduleOnly}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
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
                            onClick={() => setShowConfig(true)}
                            className="h-12 px-8 rounded-2xl font-black"
                        >
                            Configuración Manual
                        </Button>
                    </div>
                )}
            </div>

            {showConfig && (
                <ScheduleConfigModal
                    areaId={id}
                    gestion={gestion}
                    trimestre={currentTrimestre}
                    globalSchedule={globalSchedule}
                    onClose={() => setShowConfig(false)}
                    onSuccess={handleConfigSuccess}
                />
            )}
        </div>
    );
}
