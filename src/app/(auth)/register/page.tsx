'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegisterController } from '@/hooks/useRegisterController';
import { Feedback } from '@/components/ui/feedback';

export default function RegisterPage() {
    const {
        formData,
        loading,
        feedback,
        handleInputChange,
        handleRegister,
        hideFeedback
    } = useRegisterController();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md">
                {feedback.isOpen ? (
                    <Feedback
                        variant={feedback.type}
                        title={feedback.title}
                        description={feedback.description}
                        onClose={hideFeedback}
                        className="shadow-2xl bg-white border border-slate-100"
                    />
                ) : (
                    <div className="glass-card p-10 rounded-[40px] animate-in fade-in zoom-in duration-500 shadow-2xl border-white/20">
                        <div className="text-center mb-8">
                            <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                                <span className="material-symbols-rounded text-3xl">rocket_launch</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Crea tu cuenta</h1>
                            <p className="text-slate-500 text-sm font-medium">Únete a la nueva era de la planificación</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Nombre"
                                    name="nombre"
                                    placeholder="Juan"
                                    required
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="rounded-2xl"
                                />
                                <Input
                                    label="Apellido"
                                    name="apellido"
                                    placeholder="Pérez"
                                    required
                                    value={formData.apellido}
                                    onChange={handleInputChange}
                                    className="rounded-2xl"
                                />
                            </div>

                            <Input
                                label="Correo Electrónico"
                                name="email"
                                type="email"
                                placeholder="profe@ejemplo.com"
                                icon="mail"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="rounded-2xl"
                            />

                            <Input
                                label="Contraseña"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                icon="key"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="rounded-2xl"
                            />

                            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                                <input type="checkbox" id="terms" className="mt-1 w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary/20" required />
                                <label htmlFor="terms" className="text-[11px] leading-tight text-slate-500 font-medium">
                                    Acepto los <Link href="/terms" className="text-primary font-black hover:opacity-80 transition-all uppercase tracking-wider">Términos y Condiciones</Link> y la Política de Privacidad del sistema.
                                </label>
                            </div>

                            <Button type="submit" isLoading={loading} className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                <span className="font-black uppercase tracking-widest text-xs">Comenzar Ahora</span>
                                <span className="material-symbols-rounded text-xl ml-2">check_circle</span>
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                ¿Ya tienes una cuenta? {' '}
                            </p>
                            <Link href="/login" className="inline-block mt-2 text-primary font-black hover:opacity-80 transition-all uppercase tracking-wider text-xs">
                                Inicia sesión aquí
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
