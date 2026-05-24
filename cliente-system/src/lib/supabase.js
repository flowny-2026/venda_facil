import { createClient } from '@supabase/supabase-js';
// Estas são as configurações que você vai pegar do painel do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Configurações para evitar auto-login indesejado
        persistSession: true, // Manter sessão, mas com controle melhor
        detectSessionInUrl: true,
        autoRefreshToken: true,
        // Usar sessionStorage ao invés de localStorage para sessões menos persistentes
        storage: {
            getItem: (key) => {
                // Usar sessionStorage para dados de sessão, localStorage para configurações
                if (key.includes('auth-token')) {
                    return sessionStorage.getItem(key);
                }
                return localStorage.getItem(key);
            },
            setItem: (key, value) => {
                // Usar sessionStorage para dados de sessão, localStorage para configurações
                if (key.includes('auth-token')) {
                    sessionStorage.setItem(key, value);
                }
                else {
                    localStorage.setItem(key, value);
                }
            },
            removeItem: (key) => {
                sessionStorage.removeItem(key);
                localStorage.removeItem(key);
            }
        }
    }
});
