/**
 * Domain Models & Types
 * Prime Directive: Atomic, explicable and non-destructive.
 */

export interface ServiceResponse<T> {
    data: T | null;
    error: any | null;
    success: boolean;
}

export interface Profile {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    rol?: string;
    created_at?: string;
}

// --- Areas & Infrastructure ---

export interface UnidadEducativa {
    id: number;
    nombre: string;
    distrito?: {
        id: number;
        nombre: string;
        departamento?: { id: number; nombre: string; }
    }
}

export interface Grado {
    id: number;
    nombre: string;
    nivel?: { id: number; nombre: string }
}

export interface AreaConocimiento {
    id: number;
    nombre: string;
    grado?: Grado;
}

export interface AreaTrabajo {
    id: string;
    profesor_id: string;
    unidad_educativa_id?: number;
    area_conocimiento_id?: number;
    turno_id?: string;
    unidad_educativa: UnidadEducativa;
    area_conocimiento: AreaConocimiento;
    turno: { id: string; nombre: string; };
    paralelos: { id: string; nombre: string; }[];
    created_at?: string;
}

// --- Library & Content ---

export interface ContentItem {
    id: number;
    titulo: string;
    padre_id?: number | null;
    orden: number;
    descripcion?: string;
    trimestre?: string;
    area_conocimiento?: AreaConocimiento;
    is_base: boolean;
}

export interface UserContent {
    id: number;
    propietario_id: string;
    area_trabajo_id: string;
    origen_base_id?: number | null;
    padre_id?: number | null;
    titulo: string;
    orden: number;
    trimestre?: string;
    created_at: string;
    updated_at: string;
}

// --- PDC & Planning ---

export interface PlanificacionGeneral {
    id: number;
    gestion: number;
    trimestre: number;
    mes: number; // 1-3
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
}

export interface SemanaContenido {
    id: string;
    planificacion_semanal_id?: string;
    contenido_usuario_id: number;
    estado: 'planificado' | 'en_progreso' | 'completado';
    contenido_usuario?: UserContent;
}

export interface PlanificacionSemanal {
    id: string;
    area_trabajo_id: string;
    pdc_id?: string; // Relación con la nueva tabla maestra
    gestion: number;
    trimestre: number;
    mes: number;
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
    observaciones_generales?: string;
    semana_contenido?: SemanaContenido[];
    created_at?: string;
}

// --- Nueva Estructura PDC (Maestra) ---

export interface PDCMaster {
    id: string;
    docente_id: string;
    tipo_pdc_id: number;
    estado: 'Pendiente' | 'Verificado' | 'Rechazado';
    director_id?: string;
    observaciones_director?: string;
    gestion: number;
    trimestre?: number;
    mes?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    created_at?: string;
    updated_at?: string;
    areas_trabajo?: AreaTrabajo[];
}

export type PDC = PDCMaster;

// --- PDC Wizard & Design Structs ---

export interface CatalogoVerbo {
    id: number;
    verbo: string;
    tipo_verbo_id: number;
    dominio?: string;
    nivel_profundidad?: string;
    niveles_educativos?: string[];
}

export interface CatalogoComplemento {
    id: number;
    complemento: string;
    categoria: string;
    subcategoria: string;
    tipo_complemento_id: number;
}

export interface LearningObjective {
    text: string;
    contentIds: number[];
}

export interface MomentosFormativos {
    practica: {
        id: string | number;
        tecnica: string;
        detalle: string;
        preguntas: string;
    }[];
    teoria: string;
    produccion: string;
    valoracion: string;
    adaptaciones: string;
    recursos: string;
    fuentes: string;
    herramientas: string;
}

export interface CriteriosEvaluacion {
    ser: string;
    saber: string;
    hacer: string;
    decidir: string;
}

export interface WeekDesign {
    momentos: MomentosFormativos;
    herramientas?: string;
    criterios?: CriteriosEvaluacion;
}

export interface AreaDesignState {
    learningObjectives: LearningObjective[];
    generatorMode: 'auto' | 'manual';
    currentObjective: {
        verboIds: number[];
        contentIds: number[];
        complementId: number | null;
        complement: string;
        draft: string;
        isManual: boolean;
    };
    manualObjective: {
        quiero: string;
        paraQue: string;
        medire: string;
    };
    weekContentsMap: Record<number, UserContent[]>;
    availableContents: UserContent[];
    weekDesignState: Record<number, WeekDesign>;
    finalProduct: string;
}
