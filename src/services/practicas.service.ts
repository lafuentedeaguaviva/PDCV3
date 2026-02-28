import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export interface PracticaLibraryItem {
    id: number;
    proposito: string;
    tipo: string;
    tecnica: string;
    descripcion_concreta: string;
    ejemplo_inicial: string;
    ejemplo_primaria: string;
    ejemplo_secundaria: string;
    ejemplo_multigrado: string;
    preguntas_generales: string;
}

export const PracticasService = {
    /**
     * Obtiene todos los ítems de la biblioteca de prácticas.
     */
    async getLibrary(): Promise<ServiceResponse<PracticaLibraryItem[]>> {
        const { data, error } = await supabase
            .from('biblioteca_practicas')
            .select('*')
            .order('proposito', { ascending: true });

        return { data, error, success: !error };
    }
};
