import { supabase } from '@/lib/supabase';
import { ServiceResponse, AreaTrabajo } from '@/types';
export type { AreaTrabajo };

export interface Catalogs {
    unidades: { id: number; nombre: string; }[];
    areas: { id: number; nombre: string; }[];
    turnos: { id: string; nombre: string; }[];
    paralelos: { id: string; nombre: string; }[];
}

export const AreasService = {
    async getAreas(userId: string): Promise<AreaTrabajo[]> {
        const { data, error } = await supabase
            .from('areas_trabajo')
            .select(`
                id,
                profesor_id,
                unidad_educativa:unidades_educativas(id, nombre),
                area_conocimiento:areas_conocimiento(
                    id, 
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre)
                    )
                ),
                turno:turnos(id, nombre),
                created_at
            `)
            .eq('profesor_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching areas:', error);
            return [];
        }

        const areasWithParalelos = await Promise.all(data.map(async (area: any) => {
            const { data: paralelosData } = await supabase
                .from('area_trabajo_paralelo')
                .select('paralelo:paralelos(id, nombre)')
                .eq('area_trabajo_id', area.id);

            return {
                ...area,
                paralelos: paralelosData?.map((p: any) => p.paralelo) || []
            };
        }));

        return areasWithParalelos as unknown as AreaTrabajo[];
    },

    async getCatalogs(): Promise<Catalogs> {
        const [unidades, areas, turnos, paralelos] = await Promise.all([
            supabase.from('unidades_educativas').select('id, nombre'),
            supabase.from('areas_conocimiento').select('id, nombre'),
            supabase.from('turnos').select('id, nombre'),
            supabase.from('paralelos').select('id, nombre').order('nombre')
        ]);

        return {
            unidades: unidades.data || [],
            areas: areas.data || [],
            turnos: turnos.data || [],
            paralelos: paralelos.data || []
        };
    },

    async createArea(data: {
        profesor_id: string;
        unidad_educativa_id: number;
        area_conocimiento_id: number;
        turno_id: string;
        paralelos_ids: string[];
    }): Promise<ServiceResponse<any>> {
        const { data: area, error: areaError } = await supabase
            .from('areas_trabajo')
            .insert({
                profesor_id: data.profesor_id,
                unidad_educativa_id: data.unidad_educativa_id,
                area_conocimiento_id: data.area_conocimiento_id,
                turno_id: data.turno_id
            })
            .select()
            .single();

        if (areaError) {
            if (areaError.code !== '23505') {
                console.error('AreasService.createArea - areaError:', areaError);
            }
            return { data: null, error: areaError, success: false };
        }

        if (data.paralelos_ids.length > 0) {
            const paralelosInserts = data.paralelos_ids.map(pid => ({
                area_trabajo_id: area.id,
                paralelo_id: pid
            }));

            const { error: paralelosError } = await supabase
                .from('area_trabajo_paralelo')
                .insert(paralelosInserts);

            if (paralelosError) {
                console.error('AreasService.createArea - paralelosError:', paralelosError);
                return { data: area, error: paralelosError, success: false };
            }
        }

        return { data: area, error: null, success: true };
    },

    async updateArea(id: string, data: {
        unidad_educativa_id: number;
        area_conocimiento_id: number;
        turno_id: string;
        paralelos_ids: string[];
    }): Promise<ServiceResponse<any>> {
        const { error: areaError } = await supabase
            .from('areas_trabajo')
            .update({
                unidad_educativa_id: data.unidad_educativa_id,
                area_conocimiento_id: data.area_conocimiento_id,
                turno_id: data.turno_id
            })
            .eq('id', id);

        if (areaError) {
            if (areaError.code !== '23505') {
                console.error('AreasService.updateArea - areaError:', areaError);
            }
            return { data: null, error: areaError, success: false };
        }

        const { error: deleteError } = await supabase
            .from('area_trabajo_paralelo')
            .delete()
            .eq('area_trabajo_id', id);

        if (deleteError) {
            console.error('Error in updateArea (delete area_trabajo_paralelo):', deleteError);
            return { data: null, error: deleteError, success: false };
        }

        if (data.paralelos_ids.length > 0) {
            const paralelosInserts = data.paralelos_ids.map(pid => ({
                area_trabajo_id: id,
                paralelo_id: pid
            }));

            const { error: paralelosError } = await supabase
                .from('area_trabajo_paralelo')
                .insert(paralelosInserts);

            if (paralelosError) {
                console.error('Error in updateArea (area_trabajo_paralelo):', paralelosError);
                return { data: null, error: paralelosError, success: false };
            }
        }

        return { data: { id, ...data }, error: null, success: true };
    },

    async deleteArea(id: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('areas_trabajo')
            .delete()
            .eq('id', id)
            .select();

        return { data, error, success: !error };
    },

    async getAreaById(id: string): Promise<AreaTrabajo | null> {
        const { data, error } = await supabase
            .from('areas_trabajo')
            .select(`
                id,
                profesor_id,
                unidad_educativa:unidades_educativas(
                    id, 
                    nombre,
                    distrito:distritos(
                        id,
                        nombre,
                        departamento:departamentos(id, nombre)
                    )
                ),
                area_conocimiento:areas_conocimiento(
                    id, 
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre)
                    )
                ),
                turno:turnos(id, nombre),
                created_at
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error fetching area by id:', error);
            return null;
        }

        const { data: paralelosData } = await supabase
            .from('area_trabajo_paralelo')
            .select('paralelo:paralelos(id, nombre)')
            .eq('area_trabajo_id', data.id);

        return {
            ...data,
            paralelos: paralelosData?.map((p: any) => p.paralelo) || []
        } as unknown as AreaTrabajo;
    }
};

