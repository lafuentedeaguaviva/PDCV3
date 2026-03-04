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
import { Step3ConfirmationName } from '@/components/pdcs/steps/Step3ConfirmationName';
import { StepDesignPhase } from '@/components/pdcs/steps/StepDesignPhase';
import { PdcStepIndicator } from '@/components/pdcs/common/PdcStepIndicator';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function NewPdcContent() {
    const controller = usePdcWizardController();
    const {
        step,
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
        areas,
        pdcName,
        periodsPerWeek,
        weeklyHours,
        setPdcName,
        setPeriodsPerWeek,
        setWeeklyHours
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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 px-6 py-3 min-h-[80px] flex items-center transition-all duration-300">
                <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        {/* Interactive Navigation Group */}
                        <div className="flex items-center gap-4 bg-white/40 p-2 rounded-[2rem] border border-slate-200/50 shadow-sm backdrop-blur-xl group/nav hover:border-blue-200/50 transition-all duration-500">
                            {step !== 4 && (
                                <button
                                    onClick={handleBack}
                                    className="size-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 active:scale-95 group/back"
                                    title="Volver"
                                >
                                    <span className="material-symbols-rounded text-2xl font-bold group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
                                </button>
                            )}

                            <div className="flex flex-col gap-3 px-2">
                                <div className="flex flex-col gap-0.5 min-w-[300px]">
                                    <h1 className="text-lg font-black text-blue-950 tracking-tight leading-none uppercase truncate">
                                        {getStepName().includes(':') ? getStepName().split(':')[1].trim() : getStepName()}
                                    </h1>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Asistente de Planificación PDC</p>
                                </div>
                                <PdcStepIndicator
                                    currentStep={step}
                                    totalSteps={10}
                                    className="scale-90 origin-left"
                                />
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={saving}
                                className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 font-black rounded-2xl gap-3 shadow-lg shadow-blue-500/20 transition-all active:scale-95 group/next disabled:opacity-50 text-[11px] uppercase tracking-widest border-b-2 border-blue-800"
                            >
                                {saving ? (
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="italic">{step === 10 && currentAreaIndex === selectedAreas.length - 1 ? 'FINALIZAR' : 'Continuar'}</span>
                                        <div className="size-8 bg-white/20 text-white rounded-lg flex items-center justify-center group-hover/next:translate-x-1 transition-transform">
                                            <span className="material-symbols-rounded text-sm font-bold">arrow_forward</span>
                                        </div>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        {step >= 4 && selectedAreas.length > 1 && (
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
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1.5 rounded-full transition-all duration-700 ease-in-out shadow-sm ${step === s
                                            ? 'w-10 bg-gradient-to-r from-slate-900 to-slate-700'
                                            : step > s
                                                ? 'w-4 bg-blue-500'
                                                : 'w-4 bg-slate-200'
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
                        <Step3ConfirmationName
                            pdcName={pdcName}
                            setPdcName={setPdcName}
                            selectedAreas={controller.selectedAreas}
                            areas={controller.areas}
                        />
                    )}

                    {step >= 4 && (
                        <StepDesignPhase
                            step={step}
                            levelColor={controller.selectedType === 1 ? 'rose-600' : controller.selectedType === 2 ? 'amber-500' : controller.selectedType === 3 ? 'indigo-600' : 'emerald-600'}
                            pdcName={pdcName}
                            // Pass all required props from controller
                            selectedType={controller.selectedType}
                            mainAreaDetails={controller.mainAreaDetails}
                            userProfile={controller.userProfile}
                            selectedTrimestre={controller.selectedTrimestre}
                            pdcDates={controller.pdcDates}
                            objetivoNivel={controller.objetivoNivel}
                            setObjetivoNivel={controller.setObjetivoNivel}
                            generatorMode={controller.generatorMode}
                            setGeneratorMode={controller.setGeneratorMode}
                            currentObjective={controller.currentObjective}
                            setCurrentObjective={controller.setCurrentObjective}
                            sortedVerbos={controller.sortedVerbos}
                            hoveredVerb={controller.hoveredVerb}
                            setHoveredVerb={controller.setHoveredVerb}
                            verbFilters={controller.verbFilters}
                            showFilters={controller.showFilters}
                            setShowFilters={controller.setShowFilters}
                            setVerbFilters={controller.setVerbFilters}
                            catalogoVerbos={controller.catalogoVerbos}
                            availableContents={controller.availableContents}
                            expandedTitles={controller.expandedTitles}
                            setExpandedTitles={controller.setExpandedTitles}
                            learningObjectives={controller.learningObjectives}
                            complementCategories={controller.complementCategories}
                            selectedCompCategory={controller.selectedCompCategory}
                            setSelectedCompCategory={controller.setSelectedCompCategory}
                            complementSearch={controller.complementSearch}
                            setComplementSearch={controller.setComplementSearch}
                            filteredComplementos={controller.filteredComplementos}
                            hoveredComplement={controller.hoveredComplement}
                            setHoveredComplement={controller.setHoveredComplement}
                            catalogoComplementos={controller.catalogoComplementos}
                            addStrategicObjective={controller.addStrategicObjective}
                            generateAIObjective={controller.generateAIObjective}
                            manualObjective={controller.manualObjective}
                            setManualObjective={controller.setManualObjective}
                            improveManualWithAI={controller.improveManualWithAI}
                            aiOptions={controller.aiOptions}
                            pdcWeeks={controller.pdcWeeks}
                            selectedMes={controller.selectedMes}
                            weekContentsMap={controller.weekContentsMap}
                            selectedAreas={controller.selectedAreas}
                            currentAreaIndex={controller.currentAreaIndex}
                            weekDesignState={controller.weekDesignState}
                            setWeekDesignState={controller.setWeekDesignState}
                            finalProductState={controller.finalProductState}
                            setFinalProductState={controller.setFinalProductState}
                            periodsPerWeek={periodsPerWeek}
                            setPeriodsPerWeek={setPeriodsPerWeek}
                            weeklyHours={weeklyHours}
                            setWeeklyHours={setWeeklyHours}
                            toggleNivelFilter={controller.toggleNivelFilter}
                        />
                    )}
                </div>
            </main>

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
