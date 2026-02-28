/**
 * Model: PdcService
 * 
 * Este servicio gestiona la Planificación de Desarrollo Curricular (PDC).
 * Incluye la gestión del cronograma global, cronograma por área y la asignación
 * de contenidos a semanas específicas.
 */

import { supabase } from '@/lib/supabase';
import {
    PlanificacionGeneral,
    PlanificacionSemanal,
    PDC,
    PDCMaster,
    ServiceResponse
} from '@/types';

export const PdcService = {
    /**
     * Obtiene el cronograma general (feriados, eventos) para una gestión y trimestre.
     * @param {number} gestion - Año de la gestión.
     * @param {number} trimestre - Número de trimestre (1, 2 o 3).
     * @returns {Promise<PlanificacionGeneral[]>} Lista de eventos semanales.
     */
    async getGlobalSchedule(gestion: number, trimestre: number): Promise<PlanificacionGeneral[]> {
        const { data, error } = await supabase
            .from('planificacion_semanal_general')
            .select('*')
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .order('mes', { ascending: true })
            .order('semana', { ascending: true });

        if (error) {
            console.error('Error fetching global schedule:', error);
            return [];
        }
        return data as PlanificacionGeneral[];
    },

    /**
     * Obtiene la planificación semanal específica para un área de trabajo.
     * @param {string} areaId - ID del área de trabajo.
     * @param {number} gestion - Año.
     * @param {number} trimestre - Trimestre (1, 2, 3).
     * @returns {Promise<PlanificacionSemanal[]>} Lista de semanas con sus contenidos asociados.
     */
    async getAreaSchedule(areaId: string, gestion: number, trimestre: number): Promise<PlanificacionSemanal[]> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .select(`
                *,
                semana_contenido (
                    id,
                    contenido_usuario_id,
                    estado,
                    contenido_usuario:contenidos_usuario (
                        titulo,
                        padre_id
                    )
                )
            `)
            .eq('area_trabajo_id', areaId)
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .order('mes', { ascending: true })
            .order('semana', { ascending: true });

        if (error) {
            console.error('Error fetching area schedule:', error);
            return [];
        }
        return data as unknown as PlanificacionSemanal[];
    },

    /**
     * Crea un conjunto de semanas de planificación para un área.
     * @param {Partial<PlanificacionSemanal>[]} weeks - Datos de las semanas a insertar.
     * @returns {Promise<ServiceResponse<PlanificacionSemanal[]>>} Resultado de la inserción.
     */
    async createAreaSchedule(weeks: Partial<PlanificacionSemanal>[]): Promise<ServiceResponse<PlanificacionSemanal[]>> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .insert(weeks)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Asocia un contenido de usuario a una semana de planificación específica.
     * @param {string} planId - ID de la semana de planificación.
     * @param {number} contentId - ID del contenido del usuario.
     */
    async assignContentToWeek(planId: string, contentId: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('semana_contenido')
            .insert({
                planificacion_semanal_id: planId,
                contenido_usuario_id: contentId
            })
            .select();

        return { data, error, success: !error };
    },

    async assignMultipleContentsToWeek(planId: string, contentIds: number[]): Promise<ServiceResponse<any>> {
        const inserts = contentIds.map(id => ({
            planificacion_semanal_id: planId,
            contenido_usuario_id: id
        }));

        const { data, error } = await supabase
            .from('semana_contenido')
            .upsert(inserts, {
                onConflict: 'planificacion_semanal_id,contenido_usuario_id',
                ignoreDuplicates: true
            })
            .select();

        return { data, error, success: !error };
    },

    async removeContentFromWeek(planId: string, contentId: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('semana_contenido')
            .delete()
            .eq('planificacion_semanal_id', planId)
            .eq('contenido_usuario_id', contentId)
            .select();

        return { data, error, success: !error };
    },

    async removeMultipleContentsFromWeek(planId: string, contentIds: number[]): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('semana_contenido')
            .delete()
            .eq('planificacion_semanal_id', planId)
            .in('contenido_usuario_id', contentIds)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Actualiza las observaciones generales de una semana.
     * @param {string} planId - ID del plan semanal.
     * @param {string} observaciones - Texto de las observaciones.
     */
    async updateWeekObservations(planId: string, observaciones: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .update({ observaciones_generales: observaciones })
            .eq('id', planId)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Crea un nuevo Plan de Desarrollo Curricular (Maestro).
     * @param {Partial<PDCMaster>} data - Datos iniciales del PDC.
     * @returns {Promise<ServiceResponse<PDCMaster>>} El PDC creado.
     */
    async createPdcMaster(data: Partial<PDCMaster>): Promise<ServiceResponse<PDCMaster>> {
        const { data: pdc, error } = await supabase
            .from('pdcs')
            .insert({
                ...data,
                gestion: data.gestion || new Date().getFullYear(),
                estado: 'Pendiente'
            })
            .select()
            .single();

        return { data: pdc as PDCMaster, error, success: !error };
    },

    /**
     * Vincula múltiples áreas de trabajo a un PDC.
     * @param {string} pdcId - ID del PDC Maestro.
     * @param {string[]} areaIds - Listado de IDs de áreas de trabajo.
     */
    async associateAreasToPdc(pdcId: string, areaIds: string[]): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('areas_trabajo')
            .update({ pdc_id: pdcId })
            .in('id', areaIds)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Actualiza los datos de un PDC Maestro.
     */
    async updatePdcMaster(pdcId: string, data: Partial<PDCMaster>): Promise<ServiceResponse<PDCMaster>> {
        const { data: pdc, error } = await supabase
            .from('pdcs')
            .update(data)
            .eq('id', pdcId)
            .select()
            .single();

        return { data: pdc as PDCMaster, error, success: !error };
    },

    async getPDCs(userId: string): Promise<PDCMaster[]> {
        const { data, error } = await supabase
            .from('pdcs')
            .select(`
                *,
                areas_trabajo!areas_trabajo_pdc_id_fkey (
                    id,
                    unidad_educativa:unidades_educativas (id, nombre),
                    area_conocimiento:areas_conocimiento (id, nombre),
                    turno:turnos (id, nombre)
                )
            `)
            .eq('docente_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching PDCs:', error.message, error.details, error.hint);
            return [];
        }
        return data as unknown as PDCMaster[];
    },

    /**
     * Elimina un PDC Maestro y limpia todas sus asociaciones.
     * @param {string} id - ID del PDC Maestro.
     */
    async deletePDC(id: string): Promise<ServiceResponse<any>> {
        try {
            // 1. Desvincular áreas de trabajo (poner pdc_id a null)
            const { error: unlinkError } = await supabase
                .from('areas_trabajo')
                .update({ pdc_id: null })
                .eq('pdc_id', id);

            if (unlinkError) throw unlinkError;

            // 2. Eliminar planificación semanal asociada
            const { error: planningsError } = await supabase
                .from('planificacion_semanal')
                .delete()
                .eq('pdc_id', id);

            if (planningsError) throw planningsError;

            // 3. Eliminar el registro maestro del PDC
            const { data, error: masterError } = await supabase
                .from('pdcs')
                .delete()
                .eq('id', id)
                .select();

            if (masterError) throw masterError;

            return { data, error: null, success: true };
        } catch (error) {
            console.error('PdcService Error [deletePDC]:', error);
            return { data: null, error, success: false };
        }
    },

    async deleteAreaSchedule(areaId: string, gestion: number, trimestre: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .delete()
            .eq('area_trabajo_id', areaId)
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .select();

        return { data, error, success: !error };
    },

    async getAllPlannedContents(areaId: string, gestion: number): Promise<number[]> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .select(`
                semana_contenido (
                    contenido_usuario_id
                )
            `)
            .eq('area_trabajo_id', areaId)
            .eq('gestion', gestion);

        if (error) {
            console.error('Error fetching all planned contents:', error);
            return [];
        }

        const ids = new Set<number>();
        data?.forEach((week: any) => {
            week.semana_contenido?.forEach((sc: any) => {
                ids.add(sc.contenido_usuario_id);
            });
        });

        return Array.from(ids);
    }
};

