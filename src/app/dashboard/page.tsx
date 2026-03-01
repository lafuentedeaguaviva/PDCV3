import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <PageHeader
                title={<>Hola, <span className="text-blue-600">Profesor Juan</span> 👋</>}
                subtitle="Aquí está el resumen de tu actividad curricular."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'PDCs Activos', value: '0', icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Créditos Disponibles', value: '---', icon: 'token', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Alertas Pendientes', value: '0', icon: 'notifications', color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <span className="material-symbols-rounded text-2xl">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent PDCs */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Bandeja de Entrada Reciente</h2>
                    <Link href="/dashboard/pdcs" className="text-blue-600 font-bold text-sm hover:underline">Ver todo mi escritorio</Link>
                </div>

                <div className="space-y-4">
                    <div className="py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <span className="material-symbols-rounded text-4xl text-slate-300 mb-2">inbox</span>
                        <p className="text-slate-500 font-medium">No hay actividad reciente en tu bandeja de entrada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
