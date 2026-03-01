'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginController } from '@/hooks/useLoginController';
import { Feedback } from '@/components/ui/feedback';

export default function LoginPage() {
    const {
        formData,
        loading,
        feedback,
        handleInputChange,
        handleLogin,
        hideFeedback
    } = useLoginController();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-sm">
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
                        <div className="text-center mb-10">
                            <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                                <span className="material-symbols-rounded text-3xl">lock_open</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Bienvenido</h1>
                            <p className="text-slate-500 text-sm font-medium">Ingresa para continuar planificando</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <Input
                                label="Correo Electrónico"
                                name="email"
                                type="email"
                                icon="mail"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="rounded-2xl"
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Contraseña"
                                    name="password"
                                    type="password"
                                    icon="key"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="rounded-2xl"
                                />
                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            </div>

                            <Button type="submit" isLoading={loading} className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                <span className="font-black uppercase tracking-widest text-xs">Entrar al Sistema</span>
                                <span className="material-symbols-rounded text-xl ml-2">arrow_forward</span>
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm font-medium text-slate-500 mb-2">
                                ¿No tienes una cuenta?
                            </p>
                            <Link href="/register" className="text-primary font-black hover:opacity-80 transition-all uppercase tracking-wider text-xs">
                                Regístrate gratis aquí
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
