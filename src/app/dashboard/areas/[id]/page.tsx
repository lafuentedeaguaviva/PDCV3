'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AreasService, AreaTrabajo } from '@/services/areas.service';
import { LibraryService, ContentItem, UserContent } from '@/services/library.service';
import { Button } from '@/components/ui/button';

export default function AreaDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const editRef = useRef<HTMLDivElement>(null);
    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [baseContents, setBaseContents] = useState<ContentItem[]>([]);
    const [userContents, setUserContents] = useState<UserContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [copyingId, setCopyingId] = useState<number | null>(null);
    const [isCopyingAll, setIsCopyingAll] = useState(false);
    const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set());
    const [expandedUserThemes, setExpandedUserThemes] = useState<Set<number>>(new Set());
    const [editingContentId, setEditingContentId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isSavedRecently, setIsSavedRecently] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            // Si el clic no es dentro de un contenedor de edición, cerramos los editores
            if (!target.closest('.editor-container')) {
                setEditingContentId(null);
                setIsAddingNew(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
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
        setLoading(false);
    };

    const handleCopy = async (baseId: number) => {
        setCopyingId(baseId);
        const result = await LibraryService.copyContentToUser(baseId, id);
        if (result.success) {
            const userData = await LibraryService.getUserContents(id);
            setUserContents(userData);
        } else {
            alert('Error al copiar contenido');
        }
        setCopyingId(null);
    };

    const handleCopyAll = async () => {
        // Warning if there are existing contents
        if (userContents.length > 0) {
            const confirmed = confirm(
                `Atención: Ya tienes ${userContents.length} contenidos en tu lista. \n\n` +
                'Si continúas, SE BORRARÁN todos tus contenidos actuales de esta área y se reemplazarán por los oficiales del currículo base. \n\n' +
                '¿Estás seguro de que deseas REEMPLAZAR todo?'
            );
            if (!confirmed) return;

            setIsCopyingAll(true);
            // Clear existing contents first
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
            alert('Error al copiar contenidos base. Asegúrate de haber aplicado las migraciones de base de datos.');
        }
        setIsCopyingAll(false);
    };

    const [isSaving, setIsSaving] = useState<number | 'new' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async (contentId: number, shouldClose = true) => {
        if (!editingTitle.trim()) return;
        if (isSaving === contentId) return;

        setIsSaving(contentId);
        setError(null);
        try {
            const result = await LibraryService.updateUserContent(contentId, {
                titulo: editingTitle
            });

            if (result.success) {
                setUserContents(prev => prev.map(c => Number(c.id) == Number(contentId) ? {
                    ...c,
                    titulo: editingTitle,
                    updated_at: new Date().toISOString()
                } : c));

                if (shouldClose) {
                    setEditingContentId(null);
                    setEditingTitle('');
                }
            } else {
                console.error('Update failed:', result.error);
                setError(result.error?.message || 'Error al guardar cambios. Verifica el ID o permisos.');
                // No cerramos el editor si falla, para que el usuario no pierda lo que escribió
            }
        } catch (error) {
            console.error('Failed to update content:', error);
            setError('Error de conexión al intentar guardar.');
        } finally {
            setIsSaving(null);
        }
    };

    const handleCreateTheme = async (titulo: string, shouldClose = true) => {
        if (!titulo.trim()) {
            if (shouldClose) setIsAddingNew(false);
            return false;
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
                return true;
            } else {
                setError(result.error?.message || 'Error al crear el tema.');
            }
        } catch (error) {
            console.error('Failed to create theme:', error);
            setError('Error de conexión al crear tema.');
        } finally {
            setIsSaving(null);
        }
        return false;
    };

    useEffect(() => {
        if (!editingContentId) {
            setEditingTitle('');
        }
    }, [editingContentId]);

    const handleCreateSubtheme = async (padreId: number) => {
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

    const handleReorder = async (content: UserContent, direction: 'up' | 'down') => {
        const siblings = userContents
            .filter(c => c.padre_id === content.padre_id)
            .sort((a, b) => a.orden - b.orden);

        const currentIndex = siblings.findIndex(s => s.id === content.id);
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

    const handleDelete = async (contentId: number) => {
        if (!confirm('¿Estás seguro de eliminar este contenido personalizado?')) return;
        const success = await LibraryService.deleteUserContent(contentId);
        if (success) {
            setUserContents(userContents.filter(c => Number(c.id) !== Number(contentId)));
        }
    };

    const toggleTheme = (themeId: number) => {
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

    // Organize hierarchy
    const themes = baseContents.filter(c => !c.padre_id);
    const getSubthemes = (parentId: number) => baseContents.filter(c => c.padre_id === parentId);

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-slate-200 rounded"></div>
                    <div className="h-4 w-48 bg-slate-100 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-slate-50 rounded-2xl border border-slate-100"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!area) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Área de trabajo no encontrada</h2>
                <Button variant="ghost" onClick={() => router.push('/dashboard/areas')} className="mt-4">
                    Volver a mis áreas
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => router.back()} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {area.unidad_educativa.nombre}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight ml-1">
                        {area.area_conocimiento.nombre}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm ml-1">
                        <span className="material-symbols-rounded text-base text-slate-400">school</span>
                        <span>{(area.area_conocimiento as any).grado?.nombre} • {(area.area_conocimiento as any).grado?.nivel?.nombre}</span>
                        <span className="mx-1 opacity-30">|</span>
                        <span className="material-symbols-rounded text-base text-slate-400">schedule</span>
                        <span>{area.turno.nombre}</span>
                        <span className="mx-1 opacity-30">|</span>
                        <span className="material-symbols-rounded text-base text-slate-400">group</span>
                        <div className="flex gap-1">
                            {area.paralelos.map(p => (
                                <span key={p.id} className="bg-slate-100 px-1.5 rounded text-slate-800 font-bold">
                                    {p.nombre}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="w-auto px-6 h-11 border-slate-200 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="material-symbols-rounded text-base mr-2">settings</span>
                        Configurar
                    </Button>
                    <Button
                        className="w-auto px-8 h-11 bg-blue-600 shadow-blue-500/20 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="material-symbols-rounded text-base mr-2">auto_awesome</span>
                        Planificar con IA
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
                {/* Contenidos Base Accordion */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-rounded text-blue-500">verified</span>
                            Contenidos Base Oficiales
                        </h2>
                    </div>

                    <Button
                        onClick={handleCopyAll}
                        disabled={isCopyingAll || themes.length === 0}
                        className="lg:hidden w-full h-12 bg-white border border-slate-200 text-blue-600 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-black text-sm"
                    >
                        {isCopyingAll ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">double_arrow</span>
                                COPIAR TODO AL PLANIFICADOR
                            </>
                        )}
                    </Button>

                    <div className="space-y-3">
                        {themes.map(theme => {
                            const isExpanded = expandedThemes.has(theme.id);
                            const subthemes = getSubthemes(theme.id);

                            return (
                                <div key={theme.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100">
                                    <div
                                        onClick={() => toggleTheme(theme.id)}
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <span className="text-xs font-black">{theme.orden}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900">
                                                {theme.titulo}
                                                {theme.trimestre && (
                                                    <span className="ml-2 text-slate-400 text-xs font-normal italic">
                                                        ({theme.trimestre})
                                                    </span>
                                                )}
                                            </h3>
                                        </div>
                                        <span className={`material-symbols-rounded transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-1 space-y-2 border-t border-slate-50 bg-slate-50/30">
                                            {subthemes.length > 0 ? subthemes.map(sub => (
                                                <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-slate-300 w-5">{theme.orden}.{sub.orden}</span>
                                                        <span className="text-sm font-medium text-slate-700">{sub.titulo}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(sub.id)}
                                                        disabled={copyingId === sub.id}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                        title="Copiar a mis contenidos"
                                                    >
                                                        {copyingId === sub.id ? (
                                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <span className="material-symbols-rounded text-xl">content_copy</span>
                                                        )}
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
                                                    <span className="text-sm text-slate-400 italic">No hay subtemas definidos.</span>
                                                    <button
                                                        onClick={() => handleCopy(theme.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Copiar este tema"
                                                    >
                                                        <span className="material-symbols-rounded text-xl">content_copy</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {themes.length === 0 && (
                            <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <span className="material-symbols-rounded text-4xl text-slate-200 mb-3 block">sentiment_dissatisfied</span>
                                <p className="text-slate-400 font-medium">No se encontraron contenidos para esta área.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Action */}
                <div className="hidden lg:flex flex-col items-center justify-center pt-24 sticky top-10">
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                    <button
                        onClick={handleCopyAll}
                        disabled={isCopyingAll || themes.length === 0}
                        className="my-6 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xl shadow-blue-500/10 flex items-center justify-center text-blue-600 hover:scale-110 hover:border-blue-500 transition-all group disabled:opacity-50 disabled:scale-100"
                        title="Copiar todos los contenidos oficiales"
                    >
                        {isCopyingAll ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-rounded text-2xl group-hover:rotate-180 transition-transform duration-500">double_arrow</span>
                        )}
                    </button>
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                </div>

                {/* Mis Contenidos Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-rounded text-blue-500">edit_note</span>
                            Mis Contenidos Editables
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                {userContents.length} PERSONALIZADOS
                            </span>
                            <button
                                onClick={() => {
                                    setIsAddingNew(true);
                                    setNewTitle('');
                                    setEditingContentId(null);
                                }}
                                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                title="Nuevo Tema"
                            >
                                <span className="material-symbols-rounded text-base">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isAddingNew && (
                            <div className="editor-container bg-white rounded-3xl border-2 border-dashed border-blue-200 p-5 animate-in zoom-in-95 duration-200">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Nuevo Tema / Contenido</h4>
                                        <button
                                            onClick={() => setIsAddingNew(false)}
                                            className="text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-base">close</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            className="grow bg-slate-50 border-b-2 border-blue-500 px-3 py-2 rounded-t-xl font-bold text-slate-900 focus:outline-none transition-all"
                                            value={newTitle}
                                            placeholder="Escribe el título aquí..."
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateTheme(newTitle);
                                                if (e.key === 'Escape') setIsAddingNew(false);
                                            }}
                                            onBlur={() => {
                                                if (newTitle.trim()) handleCreateTheme(newTitle, false);
                                                else setIsAddingNew(false);
                                            }}
                                        />
                                        {isSaving === 'new' && (
                                            <span className="material-symbols-rounded animate-spin text-blue-500 text-sm">sync</span>
                                        )}
                                        {error && isAddingNew && (
                                            <span className="material-symbols-rounded text-red-500 text-sm" title={error}>error</span>
                                        )}
                                    </div>
                                    {error && isAddingNew && (
                                        <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-xl mt-2 border border-red-100">
                                            {error}
                                        </p>
                                    )}
                                    {isSaving === 'new' && (
                                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest animate-pulse pl-3 italic">
                                            Guardando cambios...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {(() => {
                            const userThemes = userContents.filter(c => !c.padre_id || !userContents.find(t => t.id == c.padre_id));
                            const getUserSubthemes = (parentId: any) => userContents.filter(c => c.padre_id == parentId);
                            // Orphans are now items whose parent exists in the list but isn't a root theme (for 3+ levels)
                            // or we can just remove the section if we treat them all as themes.
                            const orphanedSubthemes: UserContent[] = [];

                            const renderThemeAccordion = (theme: UserContent, index: number) => {
                                const subthemes = getUserSubthemes(theme.id);
                                const hasSubthemes = subthemes.length > 0;
                                const isExpanded = expandedUserThemes.has(theme.id);

                                return (
                                    <div key={theme.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100 group">
                                        {/* Theme Card / Accordion Header */}
                                        <div
                                            onClick={() => hasSubthemes && toggleUserTheme(theme.id)}
                                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Index Circle aligned with Base Theme */}
                                                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full font-black text-xs transition-all ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    {renderUserContentInner(theme, false, true)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right flex flex-col items-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <div className="text-[8px] font-black text-slate-300 uppercase underline decoration-blue-500/30">ACTUALIZADO</div>
                                                    <div className="text-[10px] font-bold text-slate-400">
                                                        {new Date(theme.updated_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {hasSubthemes && (
                                                    <span className={`material-symbols-rounded transition-transform duration-300 text-slate-400 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}>
                                                        expand_more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nested Subthemes */}
                                        {hasSubthemes && isExpanded && (
                                            <div className="px-5 pb-5 pt-1 space-y-2 border-t border-slate-50 bg-slate-50/30">
                                                {subthemes.map((sub, subIdx) => (
                                                    <div
                                                        key={sub.id}
                                                        className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group/sub"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className="text-[10px] font-black text-slate-300 w-5">{index + 1}.{subIdx + 1}</span>
                                                            <div className="flex-1">
                                                                {renderUserContentInner(sub, true)}
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover/sub:opacity-40 transition-opacity">
                                                            <span className="material-symbols-rounded text-xl text-slate-400">arrow_forward_ios</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            };

                            function renderUserContentInner(content: UserContent, isPotentialSubtheme = false, isHeader = false) {
                                const isSubtheme = isPotentialSubtheme || !!content.padre_id;
                                return editingContentId === content.id ? (
                                    <div className="editor-container py-2 space-y-2 relative" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                className="grow bg-slate-50 border-b-2 border-blue-500 px-0 py-1 font-bold text-slate-900 focus:outline-none transition-all"
                                                value={editingTitle}
                                                placeholder="Título..."
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdate(content.id, true);
                                                    if (e.key === 'Escape') setEditingContentId(null);
                                                }}
                                                onBlur={() => handleUpdate(content.id, false)}
                                            />
                                            {isSaving === content.id && (
                                                <span className="material-symbols-rounded animate-spin text-blue-500 text-xs">sync</span>
                                            )}
                                        </div>
                                        {isSaving === content.id && (
                                            <div className="absolute -bottom-1 left-0 flex items-center gap-1.5 p-1 bg-white/80 rounded-md shadow-sm border border-blue-50/50 z-10">
                                                <span className="material-symbols-rounded text-[10px] text-blue-500 animate-spin">sync</span>
                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Sincronizando...</span>
                                            </div>
                                        )}
                                        {error && editingContentId === content.id && (
                                            <div className="absolute -bottom-1 left-0 flex items-center gap-1.5 p-1 bg-red-50 rounded-md shadow-sm border border-red-100 z-10">
                                                <span className="material-symbols-rounded text-[10px] text-red-500">error</span>
                                                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-none">
                                                    Error: Lo sentimos, no se pudieron guardar los cambios. <br />
                                                    Asegúrate de haber ejecutado la migración de 'subtitulo'.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4 group/inner">
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-0.5">
                                                <h3 className={`${isSubtheme ? 'text-sm font-medium' : 'text-base font-bold'} text-slate-800 transition-colors group-hover:text-blue-700`}>
                                                    {content.titulo}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                                                    {isSubtheme ? 'SUB' : 'TEMA'}
                                                </span>
                                                {content.origen_base_id && (
                                                    <span className="material-symbols-rounded text-base text-slate-300" title="Base oficial">verified</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover/inner:opacity-100 transition-all" onClick={(e) => e.stopPropagation()}>
                                            {/* Reordering */}
                                            <div className="flex border-r border-slate-100 mr-1 pr-1">
                                                <button
                                                    onClick={() => handleReorder(content, 'up')}
                                                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Mover arriba"
                                                >
                                                    <span className="material-symbols-rounded text-base">arrow_upward</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(content, 'down')}
                                                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Mover abajo"
                                                >
                                                    <span className="material-symbols-rounded text-base">arrow_downward</span>
                                                </button>
                                            </div>

                                            {/* Actions */}
                                            {isHeader && (
                                                <button
                                                    onClick={() => handleCreateSubtheme(content.id)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Añadir subtema"
                                                >
                                                    <span className="material-symbols-rounded text-lg">add_box</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setEditingContentId(content.id);
                                                    setEditingTitle(content.titulo);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-rounded text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(content.id)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-rounded text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    {userThemes.map((t, idx) => renderThemeAccordion(t, idx))}

                                    {/* Orphaned Subthemes fallback */}
                                    {orphanedSubthemes.length > 0 && (
                                        <div className="mt-12 space-y-4">
                                            <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 inline-block">
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Contenidos sin categoría</span>
                                            </div>
                                            {orphanedSubthemes.map((sub, idx) => renderThemeAccordion(sub, userThemes.length + idx))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {userContents.length === 0 && (
                            <div className="py-16 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                    <span className="material-symbols-rounded text-3xl text-slate-300">add_task</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">Crea tu primer contenido</h3>
                                <p className="text-slate-400 text-sm max-w-[240px] mx-auto font-medium">
                                    Copia contenidos desde el currículo base para empezar a editarlos y personalizarlos.
                                </p>
                            </div>
                        )}

                        <div className="pt-6 flex flex-col items-center gap-3 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-rounded text-blue-500 text-base">sync</span>
                                Sincronización automática activa
                            </p>
                            <p className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                                Última actualización: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
