/**
 * Domain Models & Types
 * Prime Directive: Atomic, explicable and non-destructive.
 */

export interface ServiceResponse<T> {
    data: T | null;
    error: any | null;
    success: boolean;
}

// User & Auth
export interface Profile {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    rol?: string;
    created_at?: string;
}

// PDC & Planning
export interface PlanificacionGeneral {
    id: number;
    gestion: number;
    trimestre: number;
    mes: number; // 1-3
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
}

export interface ContenidoUsuario {
    id: number;
    titulo: string;
    padre_id: number | null;
    trimestre?: string;
}

export interface SemanaContenido {
    id: string;
    planificacion_semanal_id?: string;
    contenido_usuario_id: number;
    estado: 'planificado' | 'en_progreso' | 'completado';
    contenido_usuario?: ContenidoUsuario;
}

export interface PlanificacionSemanal {
    id: string;
    area_trabajo_id: string;
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

export interface AreaTrabajo {
    id: string;
    profesor_id: string;
    unidad_educativa_id?: number;
    area_conocimiento_id?: number;
    turno_id?: string;
    unidad_educativa: {
        id: number;
        nombre: string;
        distrito?: {
            id: number;
            nombre: string;
            departamento?: { id: number; nombre: string; }
        }
    };
    area_conocimiento: {
        id: number;
        nombre: string;
        grado?: {
            id: number;
            nombre: string;
            nivel?: { id: number; nombre: string; }
        }
    };
    turno: { id: string; nombre: string; };
    paralelos: { id: string; nombre: string; }[];
    created_at?: string;
}

export type PDC = PlanificacionSemanal & {
    area_trabajo?: AreaTrabajo;
};
