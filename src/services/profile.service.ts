import { supabase } from '@/lib/supabase';

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

export const ProfileService = {
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
