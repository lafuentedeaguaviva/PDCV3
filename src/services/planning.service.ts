import { supabase } from '@/lib/supabase';
import {
    PracticaItem,
    TeoriaItem,
    ProductoItem,
    ValoracionItem,
    RecursosItem,
    SerItem,
    SaberItem,
    HacerItem
} from '@/types';

export const PlanningService = {
    /**
     * Generic upsert for any of the planning detail tables
     */
    async upsertDetail<T extends { semana_contenido_id: string }>(table: string, detail: T) {
        return await supabase
            .from(table)
            .upsert(detail)
            .select()
            .single();
    },

    /**
     * Fetch all details for a specific semana_contenido
     */
    async getDetailsByWeekContentId(semanaContenidoId: string) {
        const [
            practica, teoria, producto, valoracion,
            recursos, ser, saber, hacer
        ] = await Promise.all([
            supabase.from('practica').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('teoria').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('producto').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('valoracion').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('recursos').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('ser').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('saber').select('*').eq('semana_contenido_id', semanaContenidoId),
            supabase.from('hacer').select('*').eq('semana_contenido_id', semanaContenidoId),
        ]);

        return {
            practica: practica.data || [],
            teoria: teoria.data || [],
            producto: producto.data || [],
            valoracion: valoracion.data || [],
            recursos: recursos.data || [],
            ser: ser.data || [],
            saber: saber.data || [],
            hacer: hacer.data || [],
            error: practica.error || teoria.error || producto.error || valoracion.error ||
                recursos.error || ser.error || saber.error || hacer.error
        };
    },

    /**
     * Delete a detail by its ID and table name
     */
    async deleteDetail(table: string, idField: string, id: number | string) {
        return await supabase
            .from(table)
            .delete()
            .eq(idField, id);
    }
};
