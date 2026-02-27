import { supabase } from '@/lib/supabase';
import {
    PlanificacionGeneral,
    PlanificacionSemanal,
    PDC,
    ServiceResponse
} from '@/types';

export const PdcService = {
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

    async createAreaSchedule(weeks: Partial<PlanificacionSemanal>[]): Promise<ServiceResponse<PlanificacionSemanal[]>> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .insert(weeks)
            .select();

        return { data, error, success: !error };
    },

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

    async updateWeekObservations(planId: string, observaciones: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .update({ observaciones_generales: observaciones })
            .eq('id', planId)
            .select();

        return { data, error, success: !error };
    },

    async getPDCs(userId: string): Promise<PDC[]> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .select(`
                *,
                area_trabajo:areas_trabajo (
                    id,
                    profesor_id,
                    unidad_educativa:unidades_educativas (nombre),
                    area_conocimiento:areas_conocimiento (nombre)
                ),
                semana_contenido (
                    id,
                    estado,
                    contenido_usuario:contenidos_usuario (
                        id,
                        titulo,
                        padre_id
                    )
                )
            `)
            .eq('area_trabajo.profesor_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching PDCs:', error);
            return [];
        }
        return data as unknown as PDC[];
    },

    async deletePDC(id: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal')
            .delete()
            .eq('id', id)
            .select();

        return { data, error, success: !error };
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

