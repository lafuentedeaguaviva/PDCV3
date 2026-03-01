'use client';

import { useState, useEffect, useCallback } from 'react';
import { AreasService } from '@/services/areas.service';
import { AreaTrabajo, UserContent, PlanificacionSemanal, PlanificacionGeneral } from '@/types';
import { LibraryService } from '@/services/library.service';
import { PdcService } from '@/services/pdc.service';

/**
 * Controller: usePlanningController
 * 
 * Gestiona el estado y la lógica de negocio para la planificación semanal de un área.
 * Centraliza la carga de datos, la gestión del cronograma y la configuración.
 */
export function usePlanningController(areaId: string) {
    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [userContents, setUserContents] = useState<UserContent[]>([]);
    const [areaSchedule, setAreaSchedule] = useState<PlanificacionSemanal[]>([]);
    const [globalSchedule, setGlobalSchedule] = useState<PlanificacionGeneral[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [currentTrimestre, setCurrentTrimestre] = useState(1);
    const [gestion] = useState(new Date().getFullYear());
    const [plannedContentIds, setPlannedContentIds] = useState<Set<number>>(new Set());

    const refreshScheduleOnly = useCallback(async () => {
        try {
            const [scheduleData, plannedIds] = await Promise.all([
                PdcService.getAreaSchedule(areaId, gestion, currentTrimestre),
                PdcService.getAllPlannedContents(areaId, gestion)
            ]);
            setAreaSchedule(scheduleData);
            setPlannedContentIds(new Set(plannedIds));
        } catch (error) {
            console.error('Controller Error [refreshScheduleOnly]:', error);
        }
    }, [areaId, gestion, currentTrimestre]);

    const loadData = useCallback(async (isInitial = true) => {
        if (isInitial) setLoading(true);
        try {
            // Cargar datos del área
            const areaData = await AreasService.getAreaById(areaId);
            setArea(areaData);

            if (areaData) {
                const [userData, scheduleData, globalData, plannedIds] = await Promise.all([
                    LibraryService.getUserContents(areaId),
                    PdcService.getAreaSchedule(areaId, gestion, currentTrimestre),
                    PdcService.getGlobalSchedule(gestion, currentTrimestre),
                    PdcService.getAllPlannedContents(areaId, gestion)
                ]);

                setUserContents(userData);
                setGlobalSchedule(globalData);
                setPlannedContentIds(new Set(plannedIds));

                // Lógica de Negocio: Autocopia del cronograma global si el local está vacío
                if (scheduleData.length === 0 && globalData.length > 0) {
                    const newWeeks = globalData.map((gw: PlanificacionGeneral) => ({
                        area_trabajo_id: areaId,
                        gestion,
                        trimestre: currentTrimestre,
                        mes: gw.mes,
                        semana: gw.semana,
                        fecha_inicio_trimestre: gw.fecha_inicio_trimestre,
                        fecha_fin_trimestre: gw.fecha_fin_trimestre
                    }));

                    const result = await PdcService.createAreaSchedule(newWeeks);
                    if (result.success) {
                        const updatedSchedule = await PdcService.getAreaSchedule(areaId, gestion, currentTrimestre);
                        setAreaSchedule(updatedSchedule);
                    } else {
                        setAreaSchedule([]);
                    }
                } else {
                    setAreaSchedule(scheduleData);
                }
            }
        } catch (error) {
            console.error('Controller Error [loadData]:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [areaId, gestion, currentTrimestre]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleConfigSuccess = () => {
        setShowConfig(false);
        loadData(false);
    };

    const handleAssign = async (planId: string, contentId: number) => {
        const selectedContent = userContents.find((c: UserContent) => c.id === contentId);
        if (!selectedContent) return;

        const idsToAssign: number[] = [contentId];
        const contentItemsToUpdate: { id: number; titulo: string }[] = [{ id: contentId, titulo: selectedContent.titulo }];

        if (!selectedContent.padre_id) {
            const subthemes = userContents.filter((c: UserContent) => c.padre_id === contentId && !plannedContentIds.has(c.id));
            subthemes.forEach((sub: UserContent) => {
                idsToAssign.push(sub.id);
                contentItemsToUpdate.push({ id: sub.id, titulo: sub.titulo });
            });
        } else {
            const parentTheme = userContents.find((t: UserContent) => t.id === selectedContent.padre_id && !t.padre_id);
            if (parentTheme) {
                idsToAssign.push(parentTheme.id);
                contentItemsToUpdate.push({ id: parentTheme.id, titulo: parentTheme.titulo });
            }
        }

        // Optimistic Update
        setAreaSchedule((prev: PlanificacionSemanal[]) => prev.map((week: PlanificacionSemanal) => {
            if (week.id === planId) {
                const existingIds = new Set(week.semana_contenido?.map((sc): number => sc.contenido_usuario_id) || []);
                const newItems = contentItemsToUpdate
                    .filter(item => !existingIds.has(item.id))
                    .map(item => ({
                        id: `temp-${item.id}-${Date.now()}`,
                        contenido_usuario_id: item.id,
                        estado: 'planificado' as const,
                        contenido_usuario: {
                            titulo: item.titulo,
                            padre_id: userContents.find((c: UserContent) => c.id === item.id)?.padre_id || null
                        } as UserContent
                    }));

                if (newItems.length === 0) return week;
                return {
                    ...week,
                    semana_contenido: [...(week.semana_contenido || []), ...newItems]
                };
            }
            return week;
        }));

        setIsProcessing(planId);
        try {
            const result = await PdcService.assignMultipleContentsToWeek(planId, idsToAssign);
            if (!result.success) {
                refreshScheduleOnly();
                alert('No se pudieron asignar algunos contenidos.');
            } else {
                refreshScheduleOnly();
            }
        } catch (error) {
            console.error('Assignment error:', error);
            refreshScheduleOnly();
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRemoveAssignment = async (planId: string, contentId: number) => {
        const week = areaSchedule.find((w: PlanificacionSemanal) => w.id === planId);
        const contentToRemove = userContents.find((c: UserContent) => c.id === contentId);
        const idsToRemove: number[] = [contentId];

        if (week && contentToRemove && !contentToRemove.padre_id) {
            const assignedSubthemeIds = week.semana_contenido
                ?.filter((sc) => {
                    const subContent = userContents.find((uc: UserContent) => uc.id === sc.contenido_usuario_id);
                    return subContent?.padre_id === contentId;
                })
                .map((sc) => sc.contenido_usuario_id) || [];
            idsToRemove.push(...assignedSubthemeIds);
        }

        // Optimistic Remove
        setAreaSchedule((prev: PlanificacionSemanal[]) => prev.map((w: PlanificacionSemanal) => {
            if (w.id === planId) {
                return {
                    ...w,
                    semana_contenido: w.semana_contenido?.filter((sc: { contenido_usuario_id: number }) => !idsToRemove.includes(sc.contenido_usuario_id))
                };
            }
            return w;
        }));

        setIsProcessing(`${planId}-${contentId}`);
        try {
            const result = await PdcService.removeMultipleContentsFromWeek(planId, idsToRemove);
            if (!result.success) {
                refreshScheduleOnly();
            } else {
                refreshScheduleOnly();
            }
        } catch (error) {
            console.error('Removal error:', error);
            refreshScheduleOnly();
        } finally {
            setIsProcessing(null);
        }
    };

    return {
        area,
        userContents,
        areaSchedule,
        globalSchedule,
        loading,
        saving,
        isProcessing,
        showConfig,
        currentTrimestre,
        gestion,
        plannedContentIds,

        setShowConfig,
        setCurrentTrimestre,
        setAreaSchedule,

        loadData,
        refreshScheduleOnly,
        handleConfigSuccess,
        handleAssign,
        handleRemoveAssignment
    };
}
