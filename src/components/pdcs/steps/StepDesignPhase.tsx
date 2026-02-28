'use client';

import { DataReferential } from './design/DataReferential';
import { ObjetivoHolisticoNivel } from './design/ObjetivoHolisticoNivel';
import { ObjetivosAprendizaje } from './design/ObjetivosAprendizaje';
import { SemanasContenidos } from './design/SemanasContenidos';
import { MomentosProceso } from './design/MomentosProceso';
import { CriteriosEvaluacion } from './design/CriteriosEvaluacion';
import { ProductoFinal } from './design/ProductoFinal';

interface Props {
    pdcStep: number;
    controller: any;
}

const LEVEL_COLORS: Record<number, string> = {
    1: 'rose-600',
    2: 'amber-500',
    3: 'indigo-600',
    4: 'emerald-600'
};

const LEVEL_TEXTS: Record<number, string> = {
    1: 'Inicial',
    2: 'Primaria',
    3: 'Secundaria',
    4: 'Multigrado'
};

export function StepDesignPhase({ pdcStep, controller }: Props) {
    const levelColor = LEVEL_COLORS[controller.selectedType || 2] || 'blue-600';
    const levelText = LEVEL_TEXTS[controller.selectedType || 2] || 'Primaria';

    return (
        <div className="space-y-12">
            {pdcStep === 1 && (
                <DataReferential
                    selectedType={controller.selectedType}
                    levelColor={levelColor}
                    levelText={levelText}
                    mainAreaDetails={controller.mainAreaDetails}
                    userProfile={controller.userProfile}
                    selectedTrimestre={controller.selectedTrimestre}
                    pdcDates={controller.pdcDates}
                />
            )}

            {pdcStep === 2 && (
                <ObjetivoHolisticoNivel
                    objetivoNivel={controller.objetivoNivel}
                    setObjetivoNivel={controller.setObjetivoNivel}
                    levelColor={levelColor}
                    levelText={levelText}
                />
            )}

            {pdcStep === 3 && (
                <ObjetivosAprendizaje
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
                    toggleNivelFilter={controller.toggleNivelFilter}
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
                />
            )}

            {pdcStep === 4 && (
                <SemanasContenidos
                    selectedTrimestre={controller.selectedTrimestre}
                    selectedMes={controller.selectedMes}
                    pdcWeeks={controller.pdcWeeks}
                    pdcDates={controller.pdcDates}
                    weekContentsMap={controller.weekContentsMap}
                    learningObjectives={controller.learningObjectives}
                    selectedAreas={[controller.selectedAreas[controller.currentAreaIndex]]}
                    levelColor={levelColor}
                />
            )}

            {pdcStep === 5 && (
                <MomentosProceso
                    pdcWeeks={controller.pdcWeeks}
                    weekContentsMap={controller.weekContentsMap}
                    weekDesignState={controller.weekDesignState}
                    setWeekDesignState={controller.setWeekDesignState}
                    levelColor={levelColor}
                />
            )}

            {pdcStep === 6 && (
                <CriteriosEvaluacion
                    weekContentsMap={controller.weekContentsMap}
                    weekDesignState={controller.weekDesignState}
                    setWeekDesignState={controller.setWeekDesignState}
                    levelColor={levelColor}
                />
            )}

            {pdcStep === 7 && (
                <ProductoFinal
                    finalProductState={controller.finalProductState}
                    setFinalProductState={controller.setFinalProductState}
                    levelColor={levelColor}
                    levelText={levelText}
                />
            )}
        </div>
    );
}
