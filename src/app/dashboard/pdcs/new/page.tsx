'use client';

/**
 * View: NewPdcPage
 * 
 * Punto de entrada para la creación de un nuevo PDC.
 * Implementa el patrón MVC delegando la lógica al controlador usePdcWizardController
 * y la interfaz a componentes modulares por pasos.
 */

import { usePdcWizardController, PDC_TYPES } from '@/hooks/usePdcWizardController';
import { Step1ModalidadAreas } from '@/components/pdcs/steps/Step1ModalidadAreas';
import { Step2CronogramaFechas } from '@/components/pdcs/steps/Step2CronogramaFechas';
import { StepDesignPhase } from '@/components/pdcs/steps/StepDesignPhase';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function NewPdcContent() {
    const controller = usePdcWizardController();
    const {
        step,
        pdcStep,
        loading,
        saving,
        handleNext,
        handleBack,
        getStepName,
        getTotalSteps,
        currentAreaIndex,
        selectedAreas,
        mainAreaDetails,
        areasDesignState,
        jumpToArea,
        areas
    } = controller;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="size-20 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-rounded text-slate-900 animate-pulse text-2xl">magic_button</span>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-xl font-black text-slate-900 tracking-tight">Preparando tu asistente</p>
                    <p className="text-slate-400 font-medium animate-pulse text-sm">Configurando el entorno pedagógico...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-8 py-3 min-h-[80px] flex items-center transition-all duration-300">
                <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between gap-12">
                    <div className="flex items-center gap-10">
                        <button
                            onClick={handleBack}
                            className="size-10 bg-white rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-90 group"
                        >
                            <span className="material-symbols-rounded text-xl font-bold group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        </button>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 border border-white/10">
                                    {step === 3 ? `FASE ${pdcStep} DE 7` : `FASE ${step} DE 3`}
                                </span>
                                <h1 className="text-xl md:text-2xl font-black text-blue-950 tracking-tighter leading-none uppercase">
                                    {getStepName().includes(':') ? getStepName().split(':')[1].trim() : getStepName()}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-sm"></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Asistente de Planificación PDC</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        {step === 3 && selectedAreas.length > 1 && (
                            <div className="flex bg-slate-100/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-inner gap-1">
                                {selectedAreas.map((areaId, idx) => {
                                    const areaData = areas.find(a => a.id === areaId);
                                    const isActive = currentAreaIndex === idx;
                                    const hasData = !!areasDesignState[areaId]?.learningObjectives?.length;

                                    return (
                                        <button
                                            key={areaId}
                                            onClick={() => jumpToArea(idx)}
                                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 relative overflow-hidden group/area ${isActive
                                                ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-50 scale-105 z-10'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-cyan-50 opacity-50"></div>
                                            )}
                                            <span className="relative z-10">{areaData?.area_conocimiento?.nombre || 'Cargando...'}</span>
                                            {hasData && (
                                                <div className="relative z-10 size-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="hidden xl:flex flex-col items-end gap-3 px-4">
                            <div className="flex gap-2.5">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1.5 rounded-full transition-all duration-700 ease-in-out shadow-sm ${step === s
                                            ? 'w-16 bg-gradient-to-r from-slate-900 to-slate-700'
                                            : step > s
                                                ? 'w-6 bg-blue-500'
                                                : 'w-6 bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Progreso Global</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-[1600px] mx-auto px-10 pt-16">
                <div className="relative">
                    {step === 1 && (
                        <Step1ModalidadAreas
                            pdcTypes={PDC_TYPES}
                            selectedType={controller.selectedType}
                            setSelectedType={controller.setSelectedType}
                            filteredAreas={controller.filteredAreas}
                            selectedAreas={controller.selectedAreas}
                            toggleAreaSelection={controller.toggleAreaSelection}
                            recentPdcs={controller.recentPdcs}
                            resumePdc={controller.resumePdc}
                        />
                    )}

                    {step === 2 && (
                        <Step2CronogramaFechas
                            selectedTrimestre={controller.selectedTrimestre}
                            setSelectedTrimestre={controller.setSelectedTrimestre}
                            selectedMes={controller.selectedMes}
                            setSelectedMes={controller.setSelectedMes}
                            pdcWeeks={controller.pdcWeeks}
                            pdcDates={controller.pdcDates}
                            addWeek={controller.addWeek}
                            removeLastWeek={controller.removeLastWeek}
                            handlePdcDatesChange={controller.handlePdcDatesChange}
                        />
                    )}

                    {step === 3 && (
                        <StepDesignPhase
                            pdcStep={pdcStep}
                            controller={controller}
                        />
                    )}
                </div>
            </main>

            {/* Floating Footer Navigation */}
            <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
                <div className="max-w-4xl mx-auto px-6 w-full pointer-events-auto">
                    <div className="bg-blue-900/95 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 overflow-hidden relative group/footer ring-1 ring-white/5">
                        {/* Progress Bar for Step 3 sub-steps */}
                        {step === 3 && (
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                                    style={{ width: `${(pdcStep / 7) * 100}%` }}
                                />
                            </div>
                        )}

                        <div className="flex-1 flex items-center gap-4 px-2">
                            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover/footer:scale-110 transition-transform duration-500 shadow-inner">
                                <span className={`material-symbols-rounded text-xl ${step === 3 ? 'text-blue-400 animate-pulse' : 'text-emerald-400'}`}>
                                    {step === 3 ? 'auto_awesome' : 'task_alt'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Próximo Objetivo</span>
                                <span className="text-white font-black text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none tracking-tight">
                                    {step === 1 ? 'Vincular Áreas y Modalidad' :
                                        step === 2 ? 'Configurar Cronograma' :
                                            pdcStep === 7 && currentAreaIndex < selectedAreas.length - 1 ? 'Siguiente Materia' :
                                                `Paso ${pdcStep + 1}: Continuar Diseño`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleNext}
                                disabled={saving}
                                className="h-12 px-8 bg-white text-blue-900 hover:bg-slate-50 font-black rounded-xl gap-3 shadow-xl transition-all active:scale-95 group/btn disabled:opacity-50 text-sm border-b-2 border-slate-200"
                            >
                                {saving ? (
                                    <div className="size-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="tracking-tight italic">
                                            {step === 3 && pdcStep === 7 && currentAreaIndex === selectedAreas.length - 1 ? 'FINALIZAR' :
                                                step === 3 && pdcStep === 7 ? 'SIGUIENTE ÁREA' : 'CONTINUAR'}
                                        </span>
                                        <div className="size-8 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                                            <span className="material-symbols-rounded text-sm font-bold">arrow_forward</span>
                                        </div>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NewPdcPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="size-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        }>
            <NewPdcContent />
        </Suspense>
    );
}
