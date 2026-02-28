'use client';

/**
 * Controller: useLibraryController
 * 
 * Este hook actúa como el Controlador para la Biblioteca.
 * Centraliza la lógica de negocio, manejo de estado y comunicación con los Modelos (servicios).
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LibraryService } from '@/services/library.service';
import { AreasService } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { ContentItem, AreaTrabajo } from '@/types';

export function useLibraryController() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlAreaId = searchParams.get('areaId');

    // --- Estado (State) ---
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ContentItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(urlAreaId);

    // --- Ciclo de Vida (Life Cycle) ---
    useEffect(() => {
        loadUserContext();
        if (urlAreaId) {
            executeSearch(query, urlAreaId);
        }
    }, [urlAreaId]);

    // --- Acciones de Negocio (Business Actions) ---

    /**
     * Carga las áreas de trabajo disponibles para el usuario actual.
     */
    const loadUserContext = async () => {
        try {
            const { data: { session } } = await AuthService.getSession();
            if (session?.user) {
                const userAreas = await AreasService.getAreas(session.user.id);
                setAreas(userAreas as any); // Cast temporal mientras se alinean tipos
            }
        } catch (error) {
            console.error('Controller Error [loadUserContext]:', error);
        }
    };

    /**
     * Ejecuta la búsqueda de contenidos basada en query y área opcional.
     */
    const executeSearch = async (searchQuery: string = query, areaId: string | null = selectedAreaId) => {
        setIsSearching(true);
        try {
            const data = await LibraryService.searchContents(
                searchQuery,
                areaId ? parseInt(areaId) : undefined
            );
            setResults(data);
        } catch (error) {
            console.error('Controller Error [executeSearch]:', error);
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Maneja el cambio en el input de búsqueda.
     */
    const handleQueryChange = (value: string) => {
        setQuery(value);
    };

    /**
     * Maneja el envío del formulario de búsqueda.
     */
    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        executeSearch();
    };

    /**
     * Selecciona o deselecciona un área de trabajo.
     */
    const toggleAreaSelection = (areaConocimientoId: string) => {
        const newAreaId = selectedAreaId === areaConocimientoId ? null : areaConocimientoId;
        setSelectedAreaId(newAreaId);
        executeSearch(query, newAreaId);
    };

    /**
     * Copia un contenido de la biblioteca al contexto de trabajo seleccionado.
     */
    const useContentInWorkArea = async (baseContentId: number) => {
        if (!selectedAreaId) {
            alert('Por favor, selecciona una clase (contexto activo) primero para usar este contenido.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const activeArea = areas.find(a => String(a.area_conocimiento.id) === String(selectedAreaId));
        if (!activeArea) return;

        setIsSearching(true);
        try {
            const result = await LibraryService.copyContentToUser(baseContentId, activeArea.id);
            if (result.success) {
                router.push(`/dashboard/areas/${activeArea.id}`);
            } else {
                alert('Error al copiar contenido: ' + (result.error?.message || result.error));
            }
        } catch (error) {
            console.error('Controller Error [useContentInWorkArea]:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const navigateToArea = (areaId: string) => {
        router.push(`/dashboard/areas/${areaId}`);
    };

    return {
        // Estado
        query,
        results,
        isSearching,
        areas,
        selectedAreaId,

        // Handlers
        handleQueryChange,
        handleSearchSubmit,
        toggleAreaSelection,
        useContentInWorkArea,
        navigateToArea
    };
}
