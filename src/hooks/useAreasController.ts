'use client';

/**
 * Controller: useAreasController
 * 
 * Gestiona la lógica de negocio para el Dashboard de un Área específica.
 * Maneja la sincronización entre los contenidos base oficiales y los contenidos editables del usuario.
 */

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AreasService } from '@/services/areas.service';
import { LibraryService } from '@/services/library.service';
import { AreaTrabajo, ContentItem, UserContent } from '@/types';

export function useAreasController(params: Promise<{ id: string }>) {
    const { id } = use(params);
    const router = useRouter();

    // --- Estado: Datos (Models) ---
    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [baseContents, setBaseContents] = useState<ContentItem[]>([]);
    const [userContents, setUserContents] = useState<UserContent[]>([]);

    // --- Estado: UI & Loading ---
    const [loading, setLoading] = useState(true);
    const [copyingId, setCopyingId] = useState<number | null>(null);
    const [isCopyingAll, setIsCopyingAll] = useState(false);
    const [isSaving, setIsSaving] = useState<number | 'new' | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- Estado: Interacción ---
    const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set());
    const [expandedUserThemes, setExpandedUserThemes] = useState<Set<number>>(new Set());
    const [editingContentId, setEditingContentId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    // --- Ciclo de Vida ---
    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (!editingContentId) {
            setEditingTitle('');
        }
    }, [editingContentId]);

    // --- Selectores (Computed State) ---
    const rootBaseThemes = useMemo(() =>
        baseContents.filter((c: ContentItem) => !c.padre_id),
        [baseContents]);

    const getBaseSubthemes = (parentId: number) =>
        baseContents.filter((c: ContentItem) => c.padre_id === parentId);

    const userThemes = useMemo(() =>
        userContents.filter((c: UserContent) => !c.padre_id || !userContents.find((t: UserContent) => t.id === c.padre_id)),
        [userContents]);

    const getUserSubthemes = (parentId: number) =>
        userContents.filter((c: UserContent) => c.padre_id === parentId);

    // --- Acciones de Orquestación ---

    const loadData = async () => {
        setLoading(true);
        try {
            const areaData = await AreasService.getAreaById(id);
            if (areaData) {
                setArea(areaData);
                const [baseData, userData] = await Promise.all([
                    LibraryService.getBaseContentsByArea(areaData.area_conocimiento.id),
                    LibraryService.getUserContents(id)
                ]);
                setBaseContents(baseData);
                setUserContents(userData);
            }
        } catch (err) {
            console.error('Controller Error [loadData]:', err);
            setError('No se pudo cargar la información del área.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyManual = async (baseId: number) => {
        setCopyingId(baseId);
        try {
            const result = await LibraryService.copyContentToUser(baseId, id);
            if (result.success) {
                const userData = await LibraryService.getUserContents(id);
                setUserContents(userData);
            } else {
                alert('Error al copiar contenido');
            }
        } finally {
            setCopyingId(null);
        }
    };

    const handleCopyAllOfficial = async () => {
        if (userContents.length > 0) {
            const confirmed = confirm(
                `Atención: Ya tienes ${userContents.length} contenidos en tu lista. \n\n` +
                'Si continúas, SE BORRARÁN todos tus contenidos actuales de esta área y se reemplazarán por los oficiales del currículo base. \n\n' +
                '¿Estás seguro de que deseas REEMPLAZAR todo?'
            );
            if (!confirmed) return;

            setIsCopyingAll(true);
            const clearResult = await LibraryService.clearUserContents(id);
            if (!clearResult) {
                alert('Error al limpiar los contenidos previos.');
                setIsCopyingAll(false);
                return;
            }
        } else {
            if (!confirm('¿Deseas copiar todos los contenidos base oficiales a tu lista de contenidos editables?')) return;
            setIsCopyingAll(true);
        }

        const result = await LibraryService.copyAllBaseContentsToUser(area!.area_conocimiento.id, id);
        if (result.success) {
            const userData = await LibraryService.getUserContents(id);
            setUserContents(userData);
        } else {
            alert('Error al copiar contenidos base.');
        }
        setIsCopyingAll(false);
    };

    const updateContent = async (contentId: number, shouldClose = true) => {
        if (!editingTitle.trim()) return;
        if (isSaving === contentId) return;

        setIsSaving(contentId);
        setError(null);
        try {
            const result = await LibraryService.updateUserContent(contentId, { titulo: editingTitle });
            if (result.success) {
                setUserContents((prev: UserContent[]) => prev.map((c: UserContent) => c.id === contentId ? {
                    ...c,
                    titulo: editingTitle,
                    updated_at: new Date().toISOString()
                } : c));

                if (shouldClose) {
                    setEditingContentId(null);
                }
            } else {
                setError(result.error?.message || 'Error al guardar cambios.');
            }
        } catch (err) {
            setError('Error de conexión al intentar guardar.');
        } finally {
            setIsSaving(null);
        }
    };

    const createNewTheme = async (titulo: string, shouldClose = true) => {
        if (!titulo.trim()) {
            if (shouldClose) setIsAddingNew(false);
            return;
        }

        setIsSaving('new');
        setError(null);
        try {
            const result = await LibraryService.createCustomContent(id, titulo);
            if (result.success) {
                const userData = await LibraryService.getUserContents(id);
                setUserContents(userData);
                if (shouldClose) {
                    setIsAddingNew(false);
                    setNewTitle('');
                }
            } else {
                setError(result.error?.message || 'Error al crear el tema.');
            }
        } finally {
            setIsSaving(null);
        }
    };

    const createNewSubtheme = async (padreId: number) => {
        const titulo = prompt('Título del subtema:');
        if (!titulo) return;

        setError(null);
        const result = await LibraryService.createCustomSubtheme(id, padreId, titulo);
        if (result.success) {
            const userData = await LibraryService.getUserContents(id);
            setUserContents(userData);
            const nextExpanded = new Set(expandedUserThemes);
            nextExpanded.add(padreId);
            setExpandedUserThemes(nextExpanded);
        } else {
            setError(result.error?.message || 'Error al crear subtema.');
        }
    };

    const reorderContent = async (content: UserContent, direction: 'up' | 'down') => {
        const siblings = userContents
            .filter((c: UserContent) => c.padre_id === content.padre_id)
            .sort((a: UserContent, b: UserContent) => a.orden - b.orden);

        const currentIndex = siblings.findIndex((s: UserContent) => s.id === content.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex >= 0 && targetIndex < siblings.length) {
            const target = siblings[targetIndex];
            const success = await LibraryService.reorderUserContent(content.id, content.orden, target.id, target.orden);
            if (success) {
                const userData = await LibraryService.getUserContents(id);
                setUserContents(userData);
            }
        }
    };

    const deleteContent = async (contentId: number) => {
        if (!confirm('¿Estás seguro de eliminar este contenido personalizado?')) return;
        const success = await LibraryService.deleteUserContent(contentId);
        if (success) {
            setUserContents(userContents.filter((c: UserContent) => c.id !== contentId));
        }
    };

    // --- Helpers de UI ---

    const toggleBaseTheme = (themeId: number) => {
        const next = new Set(expandedThemes);
        if (next.has(themeId)) next.delete(themeId);
        else next.add(themeId);
        setExpandedThemes(next);
    };

    const toggleUserTheme = (themeId: number) => {
        const next = new Set(expandedUserThemes);
        if (next.has(themeId)) next.delete(themeId);
        else next.add(themeId);
        setExpandedUserThemes(next);
    };

    const startEditing = (content: UserContent) => {
        setEditingContentId(content.id);
        setEditingTitle(content.titulo);
        setIsAddingNew(false);
    };

    const cancelEditing = () => {
        setEditingContentId(null);
        setIsAddingNew(false);
        setError(null);
    };

    const goBack = () => router.back();

    return {
        // Data
        area,
        baseContents,
        userContents,
        rootBaseThemes,
        userThemes,

        // UI State
        loading,
        copyingId,
        isCopyingAll,
        isSaving,
        error,
        expandedThemes,
        expandedUserThemes,
        editingContentId,
        editingTitle,
        isAddingNew,
        newTitle,

        // Setters
        setEditingTitle,
        setNewTitle,
        setIsAddingNew,

        // Actions
        getBaseSubthemes,
        getUserSubthemes,
        handleCopyManual,
        handleCopyAllOfficial,
        updateContent,
        createNewTheme,
        createNewSubtheme,
        reorderContent,
        deleteContent,
        toggleBaseTheme,
        toggleUserTheme,
        startEditing,
        cancelEditing,
        goBack
    };
}
