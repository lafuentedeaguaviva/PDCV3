import { supabase } from '@/lib/supabase';

/**
 * Model: AuthService
 * 
 * Gestiona la autenticación y el manejo de perfiles de usuario.
 * Actúa como una interfaz limpia sobre Supabase Auth.
 */
export const AuthService = {
    /**
     * Registra un nuevo profesor en el sistema.
     * @param {string} email - Correo electrónico.
     * @param {string} password - Contraseña.
     * @param {string} nombres - Nombres del profesor.
     * @param {string} apellidos - Apellidos del profesor.
     * @returns {Promise<{data: any, error: any}>} Resultado del registro.
     */
    async signUp(email: string, password: string, nombres: string, apellidos: string) {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    nombres,
                    apellidos,
                    full_name: `${nombres} ${apellidos}`,
                },
            },
        });
        return { data, error };
    },

    /**
     * Inicia sesión con credenciales tradicionales.
     * @param {string} email - Correo electrónico.
     * @param {string} password - Contraseña.
     * @returns {Promise<{data: any, error: any}>} Sesión activa o error.
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    /**
     * Cierra la sesión activa del usuario.
     */
    async signOut() {
        return await supabase.auth.signOut();
    },

    /**
     * Obtiene la sesión actual desde el cliente de Supabase.
     */
    async getSession() {
        return await supabase.auth.getSession();
    },

    /**
     * Recupera el perfil extendido del profesor desde la tabla 'perfiles'.
     * @param {string} userId - UUID del usuario.
     * @returns {Promise<{data: any, error: any}>} Datos del perfil.
     */
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },
};
