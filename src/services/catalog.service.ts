import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

/**
 * Model: CatalogService
 * 
 * Proporciona acceso a catálogos estáticos y dinámicos del sistema,
 * como niveles, grados, áreas, turnos, paralelos y geografía (deptos/distritos).
 */
export const CatalogService = {
    /**
     * Obtiene la lista de niveles educativos.
     */
    async getNiveles(): Promise<any[]> {
        const { data, error } = await supabase
            .from('niveles')
            .select('id, nombre')
            .order('nombre');
        if (error) {
            console.error('Error fetching niveles:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene los grados asociados a un nivel educativo.
     * @param {number} nivelId - ID del nivel.
     */
    async getGrados(nivelId: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('grados')
            .select('id, nombre')
            .eq('nivel_id', nivelId)
            .order('nombre');
        if (error) {
            console.error('Error fetching grados:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene las áreas de conocimiento de un grado específico.
     * @param {number} gradoId - ID del grado.
     */
    async getAreasByGrado(gradoId: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('areas_conocimiento')
            .select('id, nombre')
            .eq('grado_id', gradoId)
            .order('nombre');
        if (error) {
            console.error('Error fetching areas by grado:', error);
            return [];
        }
        return data || [];
    },

    async getTurnos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('turnos')
            .select('id, nombre')
            .order('nombre');
        if (error) {
            console.error('Error fetching turnos:', error);
            return [];
        }
        return data || [];
    },

    async getParalelos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('paralelos')
            .select('id, nombre')
            .order('nombre');
        if (error) {
            console.error('Error fetching paralelos:', error);
            return [];
        }
        return data || [];
    },

    async getDepartamentos(): Promise<any[]> {
        const { data, error } = await supabase
            .from('departamentos')
            .select('id, nombre')
            .order('nombre');
        if (error) {
            console.error('Error fetching departamentos:', error);
            return [];
        }
        return data || [];
    },

    async getDistritos(departamentoId: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('distritos')
            .select('id, nombre')
            .eq('departamento_id', departamentoId)
            .order('nombre');
        if (error) {
            console.error('Error fetching distritos:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene las unidades educativas, opcionalmente filtradas por distrito.
     * @param {number} distritoId - ID del distrito (opcional).
     */
    async getUnidades(distritoId?: number): Promise<any[]> {
        let query = supabase
            .from('unidades_educativas')
            .select('id, nombre')
            .order('nombre');

        if (distritoId) {
            query = query.eq('distrito_id', distritoId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching unidades:', error);
            return [];
        }
        return data || [];
    }
};

