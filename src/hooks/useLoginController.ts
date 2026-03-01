import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useFeedback } from './useFeedback';

/**
 * Controller: useLoginController
 * 
 * Gestiona la lógica de negocio para la página de inicio de sesión.
 */
export function useLoginController() {
    const router = useRouter();
    const { feedback, showError, hideFeedback } = useFeedback();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            showError('Campos Requeridos', 'Por favor complete todos los campos.');
            return;
        }

        setLoading(true);
        hideFeedback();

        try {
            const result = await AuthService.signIn(formData.email, formData.password);

            if (!result.error && result.data?.user) {
                const { data: profile } = await AuthService.getProfile(result.data.user.id);

                if (!profile) {
                    router.push('/auth/complete-profile');
                } else {
                    router.push('/dashboard');
                }
            } else {
                showError('Error de Acceso', result.error?.message || 'Email o contraseña incorrectos.');
            }
        } catch (error) {
            showError('Error de Sistema', 'No se pudo conectar con el servidor de autenticación.');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        feedback,
        handleInputChange,
        handleLogin,
        hideFeedback
    };
}
