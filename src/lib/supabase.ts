import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Make sure to set them in .env.local');
}

/**
 * Clean Code: We wrap the external dependency client here.
 * If we ever switch to another DB/Auth provider, we only touch this layer.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
