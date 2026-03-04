'use client';

import { useEffect, useState } from 'react';
import { ProfileService, UserProfile } from '@/services/profile.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { useProfile } from '@/contexts/ProfileContext';

export default function ProfilePage() {
    const { profile: globalProfile, refetchProfile, loading: globalLoading } = useProfile();
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

    // Form States
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        titulo: '',
        celular: ''
    });

    useEffect(() => {
        if (globalProfile) {
            setFormData({
                nombres: globalProfile.nombres || '',
                apellidos: globalProfile.apellidos || '',
                titulo: globalProfile.titulo || '',
                celular: globalProfile.celular || ''
            });
            setIsLoading(false);
        }
    }, [globalProfile]);

    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = async () => {
        if (!globalProfile) return;
        setSaveStatus('saving');
        setErrorMessage('');

        try {
            // Determine if profile is complete
            const isComplete = Boolean(
                formData.nombres?.trim() &&
                formData.apellidos?.trim() &&
                formData.titulo?.trim() &&
                formData.celular?.trim()
            );

            const { success, error } = await ProfileService.updateProfile(globalProfile.id, {
                ...formData,
                email: globalProfile.email,
                estado_completitud: isComplete
            });

            if (success) {
                // Sync with global context immediately
                await refetchProfile();

                setSaveStatus('success');
                // If complete, redirect to dashboard main view after a short delay
                if (isComplete) {
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    setTimeout(() => setSaveStatus('idle'), 2000);
                }
            } else {
                setSaveStatus('idle');
                setErrorMessage(error || 'Error desconocido al guardar');
            }
        } catch (error: any) {
            console.error('Error saving:', error);
            setSaveStatus('idle');
            setErrorMessage(error.message || 'Error crítico en el cliente');
        }
    };

    if (isLoading || globalLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title="Mi Perfil"
                subtitle="Personaliza tu información para tus documentos."
                icon="account_circle"
                className="mb-10"
            />

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                {/* Hero / Cover */}
                <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>

                <div className="px-10 pb-10 relative">
                    {/* Avatar Container */}
                    <div className="flex flex-col items-center -mt-16 mb-8">
                        <div className="relative group cursor-pointer">
                            <div className="h-32 w-32 rounded-full border-[6px] border-white bg-slate-100 shadow-lg overflow-hidden transition-transform transform group-hover:scale-105">
                                <img
                                    src={globalProfile?.foto_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.nombres || 'User'}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-slate-900 text-white p-2 rounded-full shadow-md border-2 border-white group-hover:bg-blue-600 transition-colors">
                                <span className="material-symbols-rounded text-sm block">edit</span>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {formData.nombres || 'Usuario'} {formData.apellidos}
                            </h2>

                            <div className="flex gap-2 justify-center mt-3">
                                {globalProfile?.roles?.map((role: string) => (
                                    <span key={role} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-100">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="col-span-full mb-2">
                            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 border-b border-slate-100 pb-2">
                                <span className="material-symbols-rounded text-blue-600">badge</span>
                                <span>Información Personal</span>
                            </div>
                        </div>

                        <div className="space-y-2 col-span-full">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email (No editable)</label>
                            <Input
                                value={globalProfile?.email || ''}
                                readOnly
                                disabled
                                className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Nombres</label>
                            <Input
                                value={formData.nombres}
                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                className="bg-slate-50 border-slate-200 focus:bg-white h-11"
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Apellidos</label>
                            <Input
                                value={formData.apellidos}
                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                className="bg-slate-50 border-slate-200 focus:bg-white h-11"
                                placeholder="Tu apellido"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Título Profesional</label>
                            <Input
                                placeholder="Ej: Lic., Prof., Ing."
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                className="bg-slate-50 border-slate-200 focus:bg-white h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Celular</label>
                            <Input
                                placeholder="+591 ..."
                                value={formData.celular}
                                onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                                className="bg-slate-50 border-slate-200 focus:bg-white h-11"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-bottom-2">
                            <span className="material-symbols-rounded mt-0.5">error</span>
                            <div>
                                <p className="font-bold text-sm">No se pudo guardar</p>
                                <p className="text-xs">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            disabled={saveStatus !== 'idle'}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className={`min-w-[160px] h-11 text-base transition-all duration-300 ${saveStatus === 'success'
                                ? 'bg-green-500 hover:bg-green-600 ring-4 ring-green-100'
                                : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                                }`}
                            onClick={handleSave}
                            isLoading={saveStatus === 'saving'}
                            disabled={saveStatus !== 'idle'}
                        >
                            {saveStatus === 'saving' ? 'Guardando...' :
                                saveStatus === 'success' ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-rounded">check</span>
                                        ¡Guardado!
                                    </span>
                                ) : 'Guardar Cambios'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
