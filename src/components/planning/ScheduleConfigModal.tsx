'use client';

import { useState, useMemo, useEffect } from 'react';
import { PdcService } from '@/services/pdc.service';
import { PlanificacionGeneral, PlanificacionSemanal } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
    areaId: string;
    gestion: number;
    trimestre: number;
    globalSchedule: PlanificacionGeneral[];
    onClose: () => void;
    onSuccess: () => void;
}

export function ScheduleConfigModal({ areaId, gestion, trimestre, globalSchedule, onClose, onSuccess }: Props) {
    const [isSaving, setIsSaving] = useState(false);

    // 1. Calculate initial weeks per month from global schedule
    const initialWeeksPerMonth = useMemo(() => {
        const counts = [0, 0, 0];
        globalSchedule.forEach(w => {
            if (w.mes >= 1 && w.mes <= 3) counts[w.mes - 1]++;
        });
        return counts;
    }, [globalSchedule]);

    const [weeksPerMonth, setWeeksPerMonth] = useState(initialWeeksPerMonth);
    const [startDate, setStartDate] = useState(globalSchedule[0]?.fecha_inicio_trimestre || '');
    const [endDate, setEndDate] = useState(globalSchedule[0]?.fecha_fin_trimestre || '');

    // 2. Generate preview weeks based on state
    const previewWeeks = useMemo(() => {
        const weeks: Partial<PlanificacionSemanal>[] = [];

        for (let m = 0; m < 3; m++) {
            const count = weeksPerMonth[m];
            for (let w = 1; w <= count; w++) {
                weeks.push({
                    area_trabajo_id: areaId,
                    gestion,
                    trimestre,
                    mes: m + 1,
                    semana: w,
                    fecha_inicio_trimestre: startDate,
                    fecha_fin_trimestre: endDate
                });
            }
        }
        return weeks;
    }, [weeksPerMonth, startDate, endDate, areaId, gestion, trimestre]);

    const handleReset = () => {
        setWeeksPerMonth(initialWeeksPerMonth);
        setStartDate(globalSchedule[0]?.fecha_inicio_trimestre || '');
        setEndDate(globalSchedule[0]?.fecha_fin_trimestre || '');
    };

    const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());

    // Initialize selection with all generated weeks
    useEffect(() => {
        const allIds = previewWeeks.map(w => `${w.mes}-${w.semana}`);
        setSelectedWeeks(new Set(allIds));
    }, [previewWeeks]);

    const toggleWeek = (mes: number, semana: number) => {
        const key = `${mes}-${semana}`;
        const next = new Set(selectedWeeks);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedWeeks(next);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Clear existing for this area/trimester
            await PdcService.deleteAreaSchedule(areaId, gestion, trimestre);

            // 2. Create only selected weeks
            const weeksToCreate = previewWeeks.filter(w =>
                selectedWeeks.has(`${w.mes}-${w.semana}`)
            );

            if (weeksToCreate.length === 0) {
                alert('Selecciona al menos una semana');
                setIsSaving(false);
                return;
            }

            const result = await PdcService.createAreaSchedule(weeksToCreate);
            if (result.success) {
                onSuccess();
            } else {
                alert('Error al guardar el cronograma: ' + result.error?.message);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Group preview weeks by month for display
    const groupedMonths = useMemo(() => {
        const grouped: Record<number, any[]> = {};
        previewWeeks.forEach(week => {
            if (!grouped[week.mes!]) grouped[week.mes!] = [];
            grouped[week.mes!].push(week);
        });
        return grouped;
    }, [previewWeeks]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Configurar {trimestre}º Trimestre</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            Ajusta las semanas de trabajo para tu área
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center">
                        <span className="material-symbols-rounded text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-8 max-h-[65vh] overflow-y-auto space-y-8">
                    {/* Controls (Admin style) */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración del {trimestre}º Trimestre</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[9px] font-black text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                                onClick={handleReset}
                            >
                                REINICIAR A GLOBAL
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Inicio</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="font-bold h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Fin</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="font-bold h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-slate-200/50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semanas por Mes (Personalizable)</label>
                            <div className="grid grid-cols-3 gap-4">
                                {weeksPerMonth.map((count, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="text-[10px] font-bold text-slate-400 text-center">MES {i + 1}</div>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={10}
                                            value={count}
                                            onChange={(e) => {
                                                const next = [...weeksPerMonth];
                                                next[i] = Number(e.target.value);
                                                setWeeksPerMonth(next);
                                            }}
                                            className="text-center font-black h-11 rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview List */}
                    <div className="space-y-8">
                        {Object.entries(groupedMonths).map(([mes, weeks]) => (
                            <div key={mes} className="space-y-4">
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest pl-1">
                                    MES {mes}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {weeks.map(week => {
                                        const isSelected = selectedWeeks.has(`${week.mes}-${week.semana}`);
                                        return (
                                            <div
                                                key={`${week.mes}-${week.semana}`}
                                                onClick={() => toggleWeek(week.mes!, week.semana!)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                                                    ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 shadow-sm'
                                                        }`}>
                                                        {week.semana}
                                                    </div>
                                                    <div>
                                                        <div className={`text-[8px] font-black leading-none mb-1 opacity-50 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                                            {trimestre}º TRIMESTRE
                                                        </div>
                                                        <div className={`text-xs font-black transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-400'}`}>
                                                            SEMANA {week.semana}
                                                        </div>
                                                        <div className="text-[10px] font-medium text-slate-400">
                                                            Hereda límites globales del trimestre
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-slate-300'
                                                    }`}>
                                                    {isSelected && <span className="material-symbols-rounded text-white text-base">check</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="text-xs font-medium text-slate-400 italic">
                        Seleccionadas: <span className="font-black text-blue-600">{selectedWeeks.size} semanas</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="h-12 px-6 font-bold" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            className="h-12 px-8 bg-blue-600 rounded-2xl font-black shadow-lg shadow-blue-500/20"
                            onClick={handleSave}
                            disabled={isSaving || selectedWeeks.size === 0}
                        >
                            {isSaving ? (
                                <span className="material-symbols-rounded animate-spin">sync</span>
                            ) : (
                                'CONFIRMAR Y GUARDAR'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
