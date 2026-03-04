'use client';

import React from 'react';
import { DataReferential } from './design/DataReferential';
import { ObjetivoHolisticoNivel } from './design/ObjetivoHolisticoNivel';
import { ObjetivosAprendizaje } from './design/ObjetivosAprendizaje';
import { SemanasContenidos } from './design/SemanasContenidos';
import { MomentosProceso } from './design/MomentosProceso';
import { Step9PeriodsWorkload } from './design/Step9PeriodsWorkload';
import { Step10AIFinalization } from './design/Step10AIFinalization';

export interface StepDesignPhaseProps {
    step: number;
    levelColor: string;
    pdcName: string;
    selectedType?: number | null;
    mainAreaDetails: any;
    userProfile: any;
    selectedTrimestre: number | null;
    pdcDates: { inicio: string; fin: string };
    objetivoNivel: string;
    setObjetivoNivel: (val: string) => void;
    generatorMode: 'auto' | 'manual';
    setGeneratorMode: (val: 'auto' | 'manual') => void;
    currentObjective: any;
    setCurrentObjective: (val: any) => void;
    sortedVerbos: any[];
    hoveredVerb: any;
    setHoveredVerb: (val: any) => void;
    verbFilters: any;
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    setVerbFilters: (val: any) => void;
    toggleNivelFilter: (nivel: string) => void;
    catalogoVerbos: any[];
    availableContents: any[];
    expandedTitles: number[];
    setExpandedTitles: (val: number[]) => void;
    learningObjectives: any[];
    complementCategories: string[];
    selectedCompCategory: string;
    setSelectedCompCategory: (val: string) => void;
    complementSearch: string;
    setComplementSearch: (val: string) => void;
    filteredComplementos: any[];
    hoveredComplement: any;
    setHoveredComplement: (val: any) => void;
    catalogoComplementos: any[];
    addStrategicObjective: () => void;
    generateAIObjective: () => void;
    manualObjective: any;
    setManualObjective: (val: any) => void;
    improveManualWithAI: () => void;
    aiOptions: any[];
    pdcWeeks: any[];
    selectedMes: number | null;
    weekContentsMap: Record<number, any[]>;
    selectedAreas: string[];
    currentAreaIndex: number;
    weekDesignState: Record<number, any>;
    setWeekDesignState: (val: any) => void;
    finalProductState: string;
    setFinalProductState: (val: string) => void;
    periodsPerWeek: number;
    setPeriodsPerWeek: (val: number) => void;
    weeklyHours: number;
    setWeeklyHours: (val: number) => void;
}

const LEVEL_TEXTS: Record<number, string> = {
    1: 'Inicial',
    2: 'Primaria',
    3: 'Secundaria',
    4: 'Multigrado'
};

export function StepDesignPhase({
    step,
    levelColor,
    pdcName,
    selectedType,
    mainAreaDetails,
    userProfile,
    selectedTrimestre,
    pdcDates,
    objetivoNivel,
    setObjetivoNivel,
    generatorMode,
    setGeneratorMode,
    currentObjective,
    setCurrentObjective,
    sortedVerbos,
    hoveredVerb,
    setHoveredVerb,
    verbFilters,
    showFilters,
    setShowFilters,
    setVerbFilters,
    toggleNivelFilter,
    catalogoVerbos,
    availableContents,
    expandedTitles,
    setExpandedTitles,
    learningObjectives,
    complementCategories,
    selectedCompCategory,
    setSelectedCompCategory,
    complementSearch,
    setComplementSearch,
    filteredComplementos,
    hoveredComplement,
    setHoveredComplement,
    catalogoComplementos,
    addStrategicObjective,
    generateAIObjective,
    manualObjective,
    setManualObjective,
    improveManualWithAI,
    aiOptions,
    pdcWeeks,
    selectedMes,
    weekContentsMap,
    selectedAreas,
    currentAreaIndex,
    weekDesignState,
    setWeekDesignState,
    finalProductState,
    setFinalProductState,
    periodsPerWeek,
    setPeriodsPerWeek,
    weeklyHours,
    setWeeklyHours
}: StepDesignPhaseProps) {
    const levelText = LEVEL_TEXTS[selectedType || 2] || 'Primaria';

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {step === 4 && (
                <DataReferential
                    selectedType={selectedType ?? null}
                    levelColor={levelColor}
                    levelText={levelText}
                    mainAreaDetails={mainAreaDetails}
                    userProfile={userProfile}
                    selectedTrimestre={selectedTrimestre}
                    pdcDates={pdcDates}
                />
            )}

            {step === 5 && (
                <ObjetivoHolisticoNivel
                    objetivoNivel={objetivoNivel}
                    levelColor={levelColor}
                    levelText={levelText}
                />
            )}

            {step === 6 && (
                <ObjetivosAprendizaje
                    generatorMode={generatorMode}
                    setGeneratorMode={setGeneratorMode}
                    currentObjective={currentObjective}
                    setCurrentObjective={setCurrentObjective}
                    sortedVerbos={sortedVerbos}
                    hoveredVerb={hoveredVerb}
                    setHoveredVerb={setHoveredVerb}
                    verbFilters={verbFilters}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    toggleNivelFilter={toggleNivelFilter}
                    setVerbFilters={setVerbFilters}
                    catalogoVerbos={catalogoVerbos}
                    availableContents={availableContents}
                    expandedTitles={expandedTitles}
                    setExpandedTitles={setExpandedTitles}
                    learningObjectives={learningObjectives}
                    complementCategories={complementCategories}
                    selectedCompCategory={selectedCompCategory}
                    setSelectedCompCategory={setSelectedCompCategory}
                    complementSearch={complementSearch}
                    setComplementSearch={setComplementSearch}
                    filteredComplementos={filteredComplementos}
                    hoveredComplement={hoveredComplement}
                    setHoveredComplement={setHoveredComplement}
                    catalogoComplementos={catalogoComplementos}
                    addStrategicObjective={addStrategicObjective}
                    generateAIObjective={generateAIObjective}
                    manualObjective={manualObjective}
                    setManualObjective={setManualObjective}
                    improveManualWithAI={improveManualWithAI}
                    aiOptions={aiOptions}
                />
            )}

            {step === 7 && (
                <SemanasContenidos
                    selectedTrimestre={selectedTrimestre}
                    selectedMes={selectedMes}
                    pdcWeeks={pdcWeeks}
                    pdcDates={pdcDates}
                    weekContentsMap={weekContentsMap}
                    learningObjectives={learningObjectives}
                    selectedAreas={[selectedAreas[currentAreaIndex]]}
                    levelColor={levelColor}
                />
            )}

            {step === 8 && (
                <MomentosProceso
                    pdcWeeks={pdcWeeks}
                    weekContentsMap={weekContentsMap}
                    weekDesignState={weekDesignState}
                    setWeekDesignState={setWeekDesignState}
                    levelColor={levelColor}
                    selectedType={selectedType ?? undefined}
                />
            )}

            {step === 9 && (
                <Step9PeriodsWorkload
                    periodsPerWeek={periodsPerWeek}
                    setPeriodsPerWeek={setPeriodsPerWeek}
                    weeklyHours={weeklyHours}
                    setWeeklyHours={setWeeklyHours}
                    levelColor={levelColor}
                />
            )}

            {step === 10 && (
                <Step10AIFinalization
                    pdcName={pdcName}
                    levelColor={levelColor}
                    levelText={levelText}
                />
            )}
        </div>
    );
}
