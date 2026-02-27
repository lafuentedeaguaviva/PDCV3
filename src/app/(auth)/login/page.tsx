'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/services/auth.service';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await AuthService.signIn(formData.email, formData.password);

            if (error) {
                setError('Credenciales incorrectas o error de conexión.');
                console.error(error);
            } else if (data.user) {
                // Check profile completion
                const { data: profile } = await AuthService.getProfile(data.user.id);

                // If profile is missing OR incomplete, redirect to profile page
                if (!profile || !profile.estado_completitud) {
                    router.push('/dashboard/profile');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            setError('Ocurrió un error inesperado.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8 rounded-[2rem] animate-in fade-in zoom-in duration-500 max-w-sm w-full mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-slate-800 mb-2">Bienvenido de nuevo</h1>
                <p className="text-slate-500 text-sm font-medium">Ingresa para continuar planificando</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    icon="mail"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />

                <div className="space-y-1.5">
                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        icon="lock"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                <Button type="submit" isLoading={loading} className="w-full mt-2">
                    <span>Iniciar Sesión</span>
                    <span className="material-symbols-rounded text-lg ml-2">arrow_forward</span>
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm font-medium text-slate-500">
                    ¿No tienes una cuenta? {' '}
                    <Link href="/register" className="text-blue-600 font-bold hover:underline">
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}
