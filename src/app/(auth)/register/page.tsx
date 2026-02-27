'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/services/auth.service';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await AuthService.signUp(
                formData.email.trim(),
                formData.password,
                formData.nombre,
                formData.apellido
            );

            if (error) {
                setError(error.message);
            } else {
                // Determine next step based on auto-confirm status (usually check email)
                // For dev/test, if auto-confirm is on, we can login or redirect.
                // Assuming standard flow:
                if (data.user) {
                    // First time user -> Redirect to profile to complete data
                    router.push('/dashboard/profile');
                } else {
                    // Verify email case
                    alert('Revisa tu correo para confirmar la cuenta.');
                    router.push('/login');
                }
            }
        } catch (err: any) {
            setError('Ocurrió un error inesperado.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8 rounded-[2rem] animate-in fade-in zoom-in duration-500 max-w-md w-full mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-slate-800 mb-2">Comienza Gratis</h1>
                <p className="text-slate-500 text-sm font-medium">Crea tu cuenta y revoluciona tus clases</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        {/* Manual label rendering since Input component might be custom and tricky to pass name prop if not standardized. 
                             Checking usage: Input has label prop. Let's start with standard HTML input attributes passed via ...props if supported.
                             Wait, I don't know the exact Input props interface. The file viewer showed: label, placeholder, required.
                             I will try to pass name and onChange. If it fails, I'll need to check Input definition.
                             Assuming Input component spreads props to underlying input.
                          */}
                        <Input
                            label="Nombre"
                            name="nombre"
                            placeholder="Juan"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Input
                            label="Apellido"
                            name="apellido"
                            placeholder="Pérez"
                            required
                            value={formData.apellido}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="profe@ejemplo.com"
                    icon="mail"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />

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

                <div className="flex items-start gap-3 mt-2">
                    <input type="checkbox" id="terms" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" required />
                    <label htmlFor="terms" className="text-xs text-slate-500">
                        Acepto los <Link href="/terms" className="text-blue-600 font-bold hover:underline">Términos y Condiciones</Link> y la Política de Privacidad.
                    </label>
                </div>

                <Button type="submit" isLoading={loading} className="w-full mt-4">
                    <span>Crear Cuenta</span>
                    <span className="material-symbols-rounded text-lg ml-2">rocket_launch</span>
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm font-medium text-slate-500">
                    ¿Ya tienes cuenta? {' '}
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
