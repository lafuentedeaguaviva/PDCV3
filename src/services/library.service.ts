/**
 * Model: LibraryService
 * 
 * Este servicio actúa como la capa de acceso a datos (Model) para la Biblioteca de contenidos.
 * Se encarga de las consultas a Supabase y la lógica de persistencia de contenidos base y de usuario.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResponse, ContentItem, UserContent } from '@/types';

export const LibraryService = {
    /**
     * Obtiene el siguiente ID secuencial para un contenido de usuario.
     * @returns {Promise<number>} El próximo ID disponible.
     */
    async getNextUserContentId(): Promise<number> {
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows found
            console.error('Error getting next user content ID:', error);
            throw error;
        }

        const id = data?.id;
        if (typeof id === 'string') return parseInt(id, 10) + 1;
        return (id || 0) + 1;
    },

    /**
     * Busca contenidos base filtrando por texto y área de conocimiento opcional.
     * @param {string} query - Término de búsqueda.
     * @param {number} areaConocimientoId - ID opcional del área de conocimiento.
     * @returns {Promise<ContentItem[]>} Lista de contenidos encontrados.
     */
    async searchContents(query: string = '', areaConocimientoId?: number): Promise<ContentItem[]> {
        let queryBuilder = supabase
            .from('contenidos_base')
            .select(`
                id,
                titulo,
                trimestre,
                area_conocimiento:areas_conocimiento(
                    id,
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre)
                    )
                )
            `)
            .limit(50);

        if (query) {
            queryBuilder = queryBuilder.ilike('titulo', `%${query}%`);
        }

        if (areaConocimientoId) {
            queryBuilder = queryBuilder.eq('area_conocimiento_id', areaConocimientoId);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error searching library:', error);
            return [];
        }

        return data.map((item: any) => ({
            ...item,
            is_base: true
        })) as ContentItem[];
    },

    /**
     * Obtiene los contenidos base asociados a un área de conocimiento específica.
     * @param {number} areaConocimientoId - ID del área de conocimiento.
     * @returns {Promise<ContentItem[]>} Lista de contenidos base.
     */
    async getBaseContentsByArea(areaConocimientoId: number): Promise<ContentItem[]> {
        const { data, error } = await supabase
            .from('contenidos_base')
            .select(`
                id,
                titulo,
                padre_id,
                orden,
                trimestre,
                area_conocimiento:areas_conocimiento(
                    id,
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre)
                    )
                )
            `)
            .eq('area_conocimiento_id', areaConocimientoId)
            .order('orden');

        if (error) {
            console.error('Error fetching base contents by area:', error);
            return [];
        }

        return data.map((item: any) => ({
            ...item,
            is_base: true
        })) as ContentItem[];
    },

    /**
     * Obtiene los contenidos personalizados de un usuario para un área de trabajo.
     * @param {string} areaTrabajoId - ID del área de trabajo.
     * @returns {Promise<UserContent[]>} Lista de contenidos del usuario.
     */
    async getUserContents(areaTrabajoId: string): Promise<UserContent[]> {
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .select('*')
            .eq('area_trabajo_id', areaTrabajoId)
            .order('orden');

        if (error) {
            console.error('Error fetching user contents:', error);
            return [];
        }

        return data as UserContent[];
    },

    /**
     * Copia un contenido base al repositorio personalizado del usuario.
     * Preserva la jerarquía si el padre ya existe en el repositorio del usuario. 
     * @param {number} baseContentId - ID del contenido base.
     * @param {string} areaTrabajoId - ID del área de trabajo destino.
     * @returns {Promise<ServiceResponse<any>>} Respuesta del servicio.
     */
    async copyContentToUser(baseContentId: number, areaTrabajoId: string): Promise<ServiceResponse<any>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No authenticated session' };

        // 1. Get base content details
        const { data: baseContent } = await supabase
            .from('contenidos_base')
            .select('*')
            .eq('id', baseContentId)
            .single();

        if (!baseContent) return { success: false, data: null, error: 'Base content not found' };

        // 2. Preserve hierarchy in individual copies
        let userPadreId = null;
        if (baseContent.padre_id) {
            const { data: existingUserPadre } = await supabase
                .from('contenidos_usuario')
                .select('id')
                .eq('area_trabajo_id', areaTrabajoId)
                .eq('origen_base_id', baseContent.padre_id)
                .single();

            if (existingUserPadre) {
                userPadreId = existingUserPadre.id;
            }
        }

        // 3. Generate Manual ID
        const nextId = await this.getNextUserContentId();

        // 4. Create user content
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                id: nextId,
                propietario_id: session.user.id,
                area_trabajo_id: areaTrabajoId,
                origen_base_id: baseContentId,
                padre_id: userPadreId,
                titulo: baseContent.titulo,
                orden: baseContent.orden
            })
            .select()
            .single();

        return { success: !error, data, error };
    },

    async updateUserContent(id: number, updates: { titulo?: string }): Promise<ServiceResponse<{ updated: boolean; count: number }>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No authenticated session' };

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating user content:', error);
            return { success: false, data: null, error };
        }

        const count = data?.length || 0;
        if (count === 0) {
            console.warn('No rows updated. Check if the ID exists and if you have permissions (RLS).');
        }

        return { success: count > 0, data: { updated: count > 0, count }, error: null };
    },

    async deleteUserContent(id: number): Promise<boolean> {
        const { error } = await supabase
            .from('contenidos_usuario')
            .delete()
            .eq('id', id);

        return !error;
    },

    async clearUserContents(areaTrabajoId: string): Promise<boolean> {
        const { error } = await supabase
            .from('contenidos_usuario')
            .delete()
            .eq('area_trabajo_id', areaTrabajoId);

        if (error) {
            console.error('Error clearing user contents:', error);
            return false;
        }
        return true;
    },

    async createCustomContent(areaTrabajoId: string, titulo: string): Promise<ServiceResponse<UserContent>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No authenticated session' };

        // Get max order
        const { data: maxOrderData } = await supabase
            .from('contenidos_usuario')
            .select('orden')
            .eq('area_trabajo_id', areaTrabajoId)
            .is('padre_id', null)
            .order('orden', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = (maxOrderData?.orden || 0) + 1;
        const nextId = await this.getNextUserContentId();

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                id: nextId,
                propietario_id: session.user.id,
                area_trabajo_id: areaTrabajoId,
                titulo,
                orden: nextOrder
            })
            .select()
            .single();

        return { success: !error, data, error };
    },

    async createCustomSubtheme(areaTrabajoId: string, padreId: number, titulo: string): Promise<ServiceResponse<UserContent>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No session' };

        // Get max order
        const { data: maxOrderData } = await supabase
            .from('contenidos_usuario')
            .select('orden')
            .eq('padre_id', padreId)
            .order('orden', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = (maxOrderData?.orden || 0) + 1;
        const nextId = await this.getNextUserContentId();

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                id: nextId,
                propietario_id: session.user.id,
                area_trabajo_id: areaTrabajoId,
                padre_id: padreId,
                titulo,
                orden: nextOrder
            })
            .select()
            .single();

        return { success: !error, data, error };
    },

    async reorderUserContent(id1: number, order1: number, id2: number, order2: number): Promise<boolean> {
        const { error: error1 } = await supabase
            .from('contenidos_usuario')
            .update({ orden: order2 })
            .eq('id', id1);

        const { error: error2 } = await supabase
            .from('contenidos_usuario')
            .update({ orden: order1 })
            .eq('id', id2);

        return !error1 && !error2;
    },

    async copyAllBaseContentsToUser(areaConocimientoId: number, areaTrabajoId: string): Promise<ServiceResponse<any>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No session' };

        // 1. Fetch all base contents
        const { data: baseContents, error: fetchError } = await supabase
            .from('contenidos_base')
            .select('*')
            .eq('area_conocimiento_id', areaConocimientoId)
            // Sort by padre_id (nulls first) and then by the specific order
            .order('padre_id', { nullsFirst: true })
            .order('orden', { ascending: true });

        if (fetchError) return { success: false, data: null, error: fetchError };
        if (!baseContents || baseContents.length === 0) return { success: true, data: [], error: null };

        // 2. Map all base IDs to new user IDs upfront
        let currentNextId = await this.getNextUserContentId();
        const idMap = new Map<string | number, number>();

        baseContents.forEach(c => {
            const newId = currentNextId++;
            idMap.set(c.id, newId);
            idMap.set(c.id.toString(), newId);
        });

        // 3. Prepare objects for batch insert
        const userContentsToInsert = baseContents.map(c => {
            const newId = idMap.get(c.id)!;
            const newPadreId = c.padre_id ? (idMap.get(c.padre_id) || idMap.get(c.padre_id.toString()) || null) : null;

            return {
                id: newId,
                propietario_id: session.user.id,
                area_trabajo_id: areaTrabajoId,
                origen_base_id: c.id,
                padre_id: newPadreId,
                titulo: c.titulo,
                orden: c.orden
            };
        });

        // 4. Batch insert
        try {
            const { error: insertError } = await supabase
                .from('contenidos_usuario')
                .insert(userContentsToInsert);

            if (insertError) {
                console.error('Error in batch insert:', insertError);
                throw insertError;
            }

            return { success: true, data: null, error: null };
        } catch (error: any) {
            console.error('Detailed error in bulk copy:', error);
            return { success: false, data: null, error };
        }
    }
};
