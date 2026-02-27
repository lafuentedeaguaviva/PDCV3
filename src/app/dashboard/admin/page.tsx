'use client';

import { useEffect, useState } from 'react';
import { AdminService, SystemStats } from '@/services/admin.service';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProfileService } from '@/services/profile.service';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAccessAndLoad();
    }, []);

    const checkAccessAndLoad = async () => {
        try {
            // 1. Check Auth & Role
            const { data, error: sessionError } = await AuthService.getSession();

            if (sessionError) {
                console.warn('Session error in admin page:', sessionError);
                router.push('/login');
                return;
            }

            if (!data.session) {
                router.push('/login');
                return;
            }

            const profile = await ProfileService.getProfile(data.session.user.id);
            const isAdmin = profile?.roles?.includes('Administrador');

            if (!isAdmin) {
                router.push('/dashboard'); // Redirect unauthorized
                return;
            }

            // 2. Load Stats
            const { data: stats, error } = await AdminService.getSystemStats();
            if (error) {
                setError(error);
            } else {
                setStats(stats);
            }
        } catch (err) {
            console.error('Admin page error:', err);
            setError('Error de acceso');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Administrador</h1>
                <p className="text-slate-500 font-medium">Visión general del sistema y métricas clave.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Usuarios Registrados"
                    value={stats?.totalUsers || 0}
                    icon="group"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Unidades Educativas"
                    value={stats?.totalUnits || 0}
                    icon="school"
                    color="bg-indigo-500"
                />
                <StatCard
                    title="PDCs Generados"
                    value={stats?.totalPDCs || 0}
                    icon="description"
                    color="bg-purple-500"
                />
            </div>

            {/* Placeholder for future sections */}
            {/* Catalog Management */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Gestión de Catálogos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/dashboard/admin/units" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-rounded text-2xl">school</span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">Unidades Educativas</h3>
                        <p className="text-sm text-slate-500">Gestionar escuelas, códigos SIE y distritos.</p>
                    </Link>

                    <Link href="/dashboard/admin/users" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                        <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-rounded text-2xl">lock_person</span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">Roles y Permisos</h3>
                        <p className="text-sm text-slate-500">Administrar usuarios y asignar roles.</p>
                    </Link>

                    <Link href="/dashboard/admin/schedule" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
                        <div className="size-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-rounded text-2xl">calendar_view_week</span>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1 group-hover:text-orange-600 transition-colors">Cronograma Global</h3>
                        <p className="text-sm text-slate-500">Configurar fechas de trimestres y semanas lectivas.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-5 hover:scale-[1.02] transition-transform">
            <div className={`size-14 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-${color}/30`}>
                <span className="material-symbols-rounded text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}
