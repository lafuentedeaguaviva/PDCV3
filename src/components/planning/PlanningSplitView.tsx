'use client';

import { useState, useMemo } from 'react';
import { AreaTrabajo } from '@/services/areas.service';
import { UserContent } from '@/services/library.service';
import { PdcService } from '@/services/pdc.service';
import { PlanificacionSemanal, SemanaContenido } from '@/types';
import { Button } from '@/components/ui/button';

interface Props {
    area: AreaTrabajo;
    userContents: UserContent[];
    areaSchedule: PlanificacionSemanal[];
    setAreaSchedule: React.Dispatch<React.SetStateAction<PlanificacionSemanal[]>>;
    plannedContentIds: Set<number>;
    onRefresh: () => void;
}

export function PlanningSplitView({ area, userContents, areaSchedule, setAreaSchedule, plannedContentIds, onRefresh }: Props) {
    const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set(areaSchedule.map(w => w.mes)));
    const [dragOverWeekId, setDragOverWeekId] = useState<string | null>(null);

    // Group schedule by month
    const months = useMemo(() => {
        const grouped: Record<number, PlanificacionSemanal[]> = {};
        areaSchedule.forEach(week => {
            if (!grouped[week.mes]) grouped[week.mes] = [];
            grouped[week.mes].push(week);
        });
        return grouped;
    }, [areaSchedule]);

    const handleDragStart = (e: React.DragEvent, contentId: number) => {
        e.dataTransfer.setData('contentId', contentId.toString());
        setSelectedContentId(contentId);
    };

    const handleDragOver = (e: React.DragEvent, weekId: string) => {
        e.preventDefault();
        setDragOverWeekId(weekId);
    };

    const handleDrop = async (e: React.DragEvent, weekId: string) => {
        e.preventDefault();
        setDragOverWeekId(null);
        const contentId = parseInt(e.dataTransfer.getData('contentId'));
        if (contentId) {
            setSelectedContentId(contentId);
            handleAssign(weekId, contentId);
        }
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Filtrar contenidos ya planificados
    const themes = useMemo(() => {
        return userContents.filter(theme => {
            // Solo procesar temas raíz
            if (theme.padre_id) return false;

            const isThemePlanned = plannedContentIds.has(theme.id);
            const subthemes = userContents.filter(c => c.padre_id === theme.id);
            const hasUnplannedSubthemes = subthemes.some(s => !plannedContentIds.has(s.id));

            // El tema debe seguir apareciendo si NO ha sido planificado O si aún tiene subtemas por planificar
            return !isThemePlanned || hasUnplannedSubthemes;
        });
    }, [userContents, plannedContentIds]);

    const getSubthemes = (parentId: number) =>
        userContents.filter(c => c.padre_id === parentId && !plannedContentIds.has(c.id));

    const handleAssign = async (planId: string, contentIdOverride?: number) => {
        const contentId = contentIdOverride || selectedContentId;
        if (!contentId) return;

        // Identificar jerarquía
        const selectedContent = userContents.find(c => c.id === contentId);
        if (!selectedContent) return;

        const idsToAssign: number[] = [contentId];
        const contentItemsToUpdate: { id: number; titulo: string }[] = [{ id: contentId, titulo: selectedContent.titulo }];

        if (!selectedContent.padre_id) {
            // Es un TEMA: incluir todos sus SUBTEMAS
            const subthemes = getSubthemes(contentId);
            subthemes.forEach(sub => {
                idsToAssign.push(sub.id);
                contentItemsToUpdate.push({ id: sub.id, titulo: sub.titulo });
            });
        } else {
            // Es un SUBTEMA: incluir su TEMA PADRE
            const parentTheme = themes.find(t => t.id === selectedContent.padre_id);
            if (parentTheme) {
                idsToAssign.push(parentTheme.id);
                contentItemsToUpdate.push({ id: parentTheme.id, titulo: parentTheme.titulo });
            }
        }

        // Optimistic Update: Add all identified items to local state immediately
        setAreaSchedule(prev => prev.map(week => {
            if (week.id === planId) {
                const existingIds = new Set(week.semana_contenido?.map(sc => sc.contenido_usuario_id) || []);
                const newItems = contentItemsToUpdate
                    .filter(item => !existingIds.has(item.id))
                    .map(item => ({
                        id: `temp-${item.id}-${Date.now()}`,
                        contenido_usuario_id: item.id,
                        estado: 'planificado',
                        contenido_usuario: {
                            titulo: item.titulo,
                            padre_id: userContents.find(c => c.id === item.id)?.padre_id || null
                        } as any
                    } as SemanaContenido));

                if (newItems.length === 0) return week;

                return {
                    ...week,
                    semana_contenido: [
                        ...(week.semana_contenido || []),
                        ...newItems
                    ]
                };
            }
            return week;
        }));

        setIsProcessing(planId);
        try {
            const result = await PdcService.assignMultipleContentsToWeek(planId, idsToAssign);
            if (!result.success) {
                // Rollback if failed
                onRefresh();
                alert('No se pudieron asignar algunos contenidos.');
            } else {
                // Silently refresh to get real IDs and sync
                onRefresh();
            }
        } catch (error) {
            console.error('Assignment error:', error);
            onRefresh();
        } finally {
            setIsProcessing(null);
            setSelectedContentId(null);
        }
    };

    const handleRemoveAssignment = async (planId: string, contentId: number) => {
        // Identificar si es un padre y buscar hijos asignados a ESTA semana
        const week = areaSchedule.find(w => w.id === planId);
        const contentToRemove = userContents.find(c => c.id === contentId);

        const idsToRemove: number[] = [contentId];

        if (week && contentToRemove && !contentToRemove.padre_id) {
            // Es un TEMA: buscar sus SUBTEMAS que estén en esta misma semana
            const assignedSubthemeIds = week.semana_contenido
                ?.filter(sc => {
                    const subContent = userContents.find(uc => uc.id === sc.contenido_usuario_id);
                    return subContent?.padre_id === contentId;
                })
                .map(sc => sc.contenido_usuario_id) || [];

            idsToRemove.push(...assignedSubthemeIds);
        }

        // Optimistic Remove: Remove all identified IDs
        setAreaSchedule(prev => prev.map(w => {
            if (w.id === planId) {
                return {
                    ...w,
                    semana_contenido: w.semana_contenido?.filter(sc => !idsToRemove.includes(sc.contenido_usuario_id))
                };
            }
            return w;
        }));

        setIsProcessing(`${planId}-${contentId}`);
        try {
            const result = await PdcService.removeMultipleContentsFromWeek(planId, idsToRemove);
            if (!result.success) {
                // Rollback
                onRefresh();
            } else {
                // Silently sync
                onRefresh();
            }
        } catch (error) {
            console.error('Removal error:', error);
            onRefresh();
        } finally {
            setIsProcessing(null);
        }
    };

    const toggleMonth = (mes: number) => {
        const next = new Set(expandedMonths);
        if (next.has(mes)) next.delete(mes);
        else next.add(mes);
        setExpandedMonths(next);
    };

    // Calculate if a content is already assigned somewhere
    const contentAssignments = useMemo(() => {
        const map: Record<number, string[]> = {};
        areaSchedule.forEach(week => {
            week.semana_contenido?.forEach(sc => {
                if (!map[sc.contenido_usuario_id]) map[sc.contenido_usuario_id] = [];
                map[sc.contenido_usuario_id].push(`M${week.mes} - S${week.semana}`);
            });
        });
        return map;
    }, [areaSchedule]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            {/* Left Column: Contenidos */}
            <div className="border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-600">list_alt</span>
                        Tus Contenidos
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Selecciona un tema para asignarlo a una semana</p>
                </div>

                <div className="p-4 space-y-3">
                    {themes.map(theme => (
                        <div key={theme.id} className="space-y-2">
                            <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, theme.id)}
                                onClick={() => setSelectedContentId(selectedContentId === theme.id ? null : theme.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group/theme ${selectedContentId === theme.id
                                    ? 'border-blue-500 bg-white shadow-md z-10'
                                    : 'border-slate-100 bg-white hover:border-blue-200 active:scale-95'
                                    }`}
                            >
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/theme:opacity-100 transition-opacity">
                                    <span className="material-symbols-rounded text-slate-300 text-lg">drag_indicator</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${selectedContentId === theme.id ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'}`}></div>
                                    <h3 className={`text-sm font-bold ${selectedContentId === theme.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                        {theme.titulo}
                                    </h3>
                                </div>
                                {contentAssignments[theme.id] && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {contentAssignments[theme.id].map((tag, i) => (
                                            <span key={i} className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="ml-4 space-y-1 border-l-2 border-slate-100 pl-3">
                                {getSubthemes(theme.id).map(sub => (
                                    <div
                                        key={sub.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, sub.id)}
                                        onClick={() => setSelectedContentId(selectedContentId === sub.id ? null : sub.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer group/sub ${selectedContentId === sub.id
                                            ? 'border-blue-400 bg-white shadow-sm'
                                            : 'border-transparent hover:bg-white hover:border-slate-200 active:scale-95'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-300">SUB</span>
                                            <h4 className={`text-xs font-semibold ${selectedContentId === sub.id ? 'text-blue-800' : 'text-slate-500'}`}>
                                                {sub.titulo}
                                            </h4>
                                        </div>
                                        {contentAssignments[sub.id] && (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {contentAssignments[sub.id].map((tag, i) => (
                                                    <span key={i} className="text-[7px] font-black text-blue-500 bg-blue-50 px-1 py-0.5 rounded uppercase leading-none">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {themes.length === 0 && (
                        <div className="py-12 text-center text-slate-300">
                            <span className="material-symbols-rounded text-4xl block mb-2">sticky_note_2</span>
                            <p className="text-xs font-bold uppercase tracking-widest">Sin contenidos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Cronograma */}
            <div className="flex flex-col bg-white">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-600">calendar_view_week</span>
                        Cronograma de Trabajo
                    </h2>
                    {selectedContentId && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
                                Asignando: {userContents.find(c => c.id === selectedContentId)?.titulo.substring(0, 30)}...
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {Object.entries(months).map(([mes, weeks]) => {
                        const mId = parseInt(mes);
                        const isExpanded = expandedMonths.has(mId);

                        return (
                            <div key={mes} className="space-y-4">
                                <div
                                    onClick={() => toggleMonth(mId)}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                                        }`}>
                                        MES {mId}
                                        <span className={`material-symbols-rounded text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                    </div>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                </div>

                                {isExpanded && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                        {weeks.map(week => (
                                            <div
                                                key={week.id}
                                                onDragOver={(e) => handleDragOver(e, week.id)}
                                                onDragLeave={() => setDragOverWeekId(null)}
                                                onDrop={(e) => handleDrop(e, week.id)}
                                                className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col ${dragOverWeekId === week.id || (selectedContentId && dragOverWeekId === null)
                                                    ? 'border-blue-400 bg-blue-50/20 shadow-lg ring-2 ring-blue-500/20 shadow-blue-500/10'
                                                    : selectedContentId
                                                        ? 'border-blue-100 bg-blue-50/10 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                                    }`}
                                                onClick={() => selectedContentId && handleAssign(week.id)}
                                            >
                                                {isProcessing === week.id && (
                                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                                        <span className="material-symbols-rounded animate-spin text-blue-600">sync</span>
                                                    </div>
                                                )}

                                                <div className="p-3 flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                                                S{week.semana}
                                                            </div>
                                                            <div className="text-[8px] font-black text-slate-300 uppercase tracking-tight">
                                                                {week.fecha_inicio_trimestre.split('-').reverse().join('/')} AL {week.fecha_fin_trimestre.split('-').reverse().join('/')}
                                                            </div>
                                                        </div>
                                                        {selectedContentId && (
                                                            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-bounce">
                                                                <span className="material-symbols-rounded text-xs">add</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1 min-h-[40px]">
                                                        {week.semana_contenido
                                                            ?.sort((a, b) => {
                                                                const aParentId = a.contenido_usuario?.padre_id || a.contenido_usuario_id;
                                                                const bParentId = b.contenido_usuario?.padre_id || b.contenido_usuario_id;

                                                                // Si son de familias diferentes, mantener orden por ID de familia (agrupa familias)
                                                                if (aParentId !== bParentId) return aParentId - bParentId;

                                                                // Si son de la misma familia, el padre (padre_id null) va primero
                                                                if (!a.contenido_usuario?.padre_id) return -1;
                                                                if (!b.contenido_usuario?.padre_id) return 1;

                                                                return 0;
                                                            })
                                                            .map(sc => {
                                                                const isSubtheme = !!sc.contenido_usuario?.padre_id;
                                                                return (
                                                                    <div
                                                                        key={sc.id}
                                                                        className={`group/item flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-all shadow-sm ${isSubtheme
                                                                            ? 'ml-6 pl-3 border-l-4 border-slate-200 bg-white hover:border-slate-300'
                                                                            : 'bg-slate-100/50 border-slate-100 hover:border-blue-200 font-bold'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-2 truncate">
                                                                            {!isSubtheme && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                                                            <span className={`truncate ${isSubtheme ? 'text-[9px] font-semibold text-slate-500' : 'text-[10px] text-slate-800'}`}>
                                                                                {sc.contenido_usuario?.titulo}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRemoveAssignment(week.id, sc.contenido_usuario_id);
                                                                            }}
                                                                            className="p-0.5 hover:text-red-500 text-slate-300 transition-colors"
                                                                        >
                                                                            {isProcessing === `${week.id}-${sc.contenido_usuario_id}` ? (
                                                                                <span className="material-symbols-rounded text-[10px] animate-spin">sync</span>
                                                                            ) : (
                                                                                <span className="material-symbols-rounded text-sm">cancel</span>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}

                                                        {(!week.semana_contenido || week.semana_contenido.length === 0) && !selectedContentId && (
                                                            <div className="flex flex-col items-center justify-center h-full py-2 opacity-20">
                                                                <span className="material-symbols-rounded text-xl">event_available</span>
                                                                <span className="text-[8px] font-black uppercase mt-0.5 text-center">Libre</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
