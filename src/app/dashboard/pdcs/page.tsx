'use client';

import { useEffect, useState, useCallback } from 'react';
import { PdcService } from '@/services/pdc.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { PdcCard } from '@/components/ui/pdc-card';
import { Skeleton } from '@/components/ui/atoms';
import { Feedback } from '@/components/ui/feedback';
import Link from 'next/link';
import { PDC } from '@/types';

export default function PDCsPage() {
    const [pdcs, setPdcs] = useState<PDC[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: sessionData } = await AuthService.getSession();
            const userId = sessionData.session?.user?.id;

            if (!userId) {
                setError('No se pudo encontrar la sesión del usuario.');
                return;
            }

            const results = await PdcService.getPDCs(userId);
            setPdcs(results);
        } catch (err) {
            console.error('Error loading PDCs:', err);
            setError('Hubo un problema al cargar tus planes. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este PDC permanentemente?')) return;

        try {
            const { error: deleteError } = await PdcService.deletePDC(id);
            if (deleteError) throw deleteError;

            setPdcs(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting PDC:', err);
            alert('No se pudo eliminar el plan. Intenta de nuevo.');
        }
    };

    // Early Return Pattern for Loading State
    if (isLoading) return <PdcSkeletonList />;

    // Early Return Pattern for Error State
    if (error) return (
        <Feedback
            title="Error al cargar"
            description={error}
            icon="error"
            onRetry={loadData}
        />
    );

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="p-2 bg-slate-100 text-slate-600 rounded-lg material-symbols-rounded">history_edu</span>
                        Mis PDC (Historial)
                    </h1>
                    <p className="text-slate-500 mt-1">Consulta y gestiona todos tus planes de desarrollo curricular creados.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/pdcs/new">
                        <Button className="gap-2 px-6">
                            <span className="material-symbols-rounded">add</span>
                            Nuevo PDC
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Empty State vs Content */}
            {pdcs.length === 0 ? (
                <Feedback
                    title="Aún no tienes PDCs"
                    description="Comienza tu primera planificación ahora y organiza tus clases de forma eficiente."
                    icon="note_stack"
                >
                    <Link href="/dashboard" className="mt-4">
                        <Button variant="outline" className="w-auto px-10">Crear Plan</Button>
                    </Link>
                </Feedback>
            ) : (
                <div className="grid gap-4">
                    {pdcs.map(pdc => (
                        <PdcCard key={pdc.id} pdc={pdc} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Sub-component for Loading State to keep main component clean
function PdcSkeletonList() {
    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}

