'use client';

import { useState, useEffect, useCallback } from 'react';
import { AreasService } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { AreaTrabajo } from '@/types';

/**
 * Controller: usePlanningDeskController
 * 
 * Gestiona el estado de la bandeja de entrada del Escritorio de Planificación.
 * Maneja la carga de áreas de trabajo disponibles para el docente.
 */
export function usePlanningDeskController() {
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [gestion] = useState(new Date().getFullYear());

    const loadAreas = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await AuthService.getSession();
            if (session?.user) {
                const data = await AreasService.getAreas(session.user.id);
                setAreas(data);
            }
        } catch (error) {
            console.error('Controller Error [loadAreas]:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAreas();
    }, [loadAreas]);

    return {
        areas,
        loading,
        gestion,
        refresh: loadAreas
    };
}
