import { supabase } from '@/lib/supabase';

/**
 * Service Layer for Auth.
 * Blind AI Logic: The UI should not know HOW login works, only that it can call this.
 */
export const AuthService = {
    async signUp(email: string, password: string, nombres: string, apellidos: string) {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    nombres,
                    apellidos,
                    full_name: `${nombres} ${apellidos}`, // Useful standard metadata
                },
            },
        });
        return { data, error };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    async signOut() {
        return await supabase.auth.signOut();
    },

    async getSession() {
        return await supabase.auth.getSession();
    },

    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },
};
