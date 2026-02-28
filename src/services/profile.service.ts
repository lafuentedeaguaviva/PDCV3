import { supabase } from '@/lib/supabase';

/**
 * Representa el perfil completo de un profesor en el sistema.
 */
export interface UserProfile {
    id: string;
    email: string;
    nombres: string;
    apellidos: string;
    titulo?: string;
    celular?: string;
    foto_url?: string;
    creditos: number;
    roles?: string[];
    estado_completitud?: boolean;
}

/**
 * Model: ProfileService
 * 
 * Gestiona los datos del perfil del profesor y sus roles asociados.
 */
export const ProfileService = {
    /**
     * Recupera el perfil completo del usuario, incluyendo sus roles.
     * @param {string} userId - UUID del usuario.
     * @returns {Promise<UserProfile | null>} Objeto de perfil o null si no se encuentra.
     */
    async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            // 1. Get Profile Data from 'public' schema
            const { data: profile, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            // If profile is null, it means no user was found, so return null early.
            if (!profile) {
                return null;
            }

            // 2. Get Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('perfil_roles')
                .select('rol_nombre')
                .eq('perfil_id', userId);

            if (rolesError) {
                console.error('Error fetching roles:', rolesError);
            }

            const roles = rolesData?.map((r: any) => r.rol_nombre) || [];

            return {
                ...profile,
                roles
            } as UserProfile;

        } catch (error) {
            console.error('Unexpected error in getProfile:', error);
            return null;
        }
    },

    /**
     * Actualiza el perfil del usuario. Realiza un 'upsert' basado en el ID.
     * @param {string} userId - UUID del usuario.
     * @param {Partial<UserProfile>} updates - Campos a actualizar.
     * @returns {Promise<{ success: boolean; error?: string }>} Resultado de la operación.
     */
    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('perfiles')
                .upsert({
                    id: userId, // Required for upsert
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error('Error updating profile:', error);
                return { success: false, error: error.message || 'Error de base de datos' };
            }
            return { success: true };
        } catch (error: any) {
            console.error('Unexpected error in updateProfile:', error);
            return { success: false, error: error.message || 'Error inesperado' };
        }
    }
};
