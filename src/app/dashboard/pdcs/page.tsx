'use client';

import { useEffect, useState, useCallback } from 'react';
import { PdcService } from '@/services/pdc.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { PdcCard } from '@/components/ui/pdc-card';
import { Skeleton } from '@/components/ui/atoms';
import { Feedback } from '@/components/ui/feedback';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PDC } from '@/types';
import { PageHeader } from '@/components/ui/page-header';

export default function PDCsPage() {
    const router = useRouter();
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

    const handleResume = (id: string) => {
        router.push(`/dashboard/pdcs/new?id=${id}`);
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
            <PageHeader
                title="Mis PDC (Historial)"
                subtitle="Consulta y gestiona todos tus planes de desarrollo curricular creados."
                icon="history_edu"
                actions={
                    <Link href="/dashboard/pdcs/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-2xl shadow-lg shadow-blue-500/20 gap-2">
                            <span className="material-symbols-rounded text-xl">add</span>
                            <span className="font-bold">Nuevo PDC</span>
                        </Button>
                    </Link>
                }
            />

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
                        <PdcCard
                            key={pdc.id}
                            pdc={pdc}
                            onDelete={handleDelete}
                            onResume={handleResume}
                        />
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

