'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useAreasController } from '@/hooks/useAreasController';
import { Button } from '@/components/ui/button';
import { ContentItem, UserContent } from '@/types';

export default function AreaDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const {
        area,
        baseContents,
        userContents,
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
        setEditingTitle,
        setNewTitle,
        setIsAddingNew,
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
    } = useAreasController(params);

    const editRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.editor-container')) {
                cancelEditing();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [cancelEditing]);

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
                <Button variant="ghost" onClick={goBack} className="mt-4">
                    Volver
                </Button>
            </div>
        );
    }

    // Organization helpers for the view
    const rootBaseThemes = baseContents.filter(c => !c.padre_id);
    const getBaseSubthemes = (parentId: number) => baseContents.filter(c => c.padre_id === parentId);

    const userThemes = userContents.filter(c => !c.padre_id || !userContents.find(t => t.id == c.padre_id));
    const getUserSubthemes = (parentId: number) => userContents.filter(c => c.padre_id == parentId);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={goBack} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
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
                        <span>{area.area_conocimiento.grado?.nombre} • {area.area_conocimiento.grado?.nivel?.nombre}</span>
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
                    <Button variant="outline" className="w-auto px-6 h-11 border-slate-200 cursor-default">
                        <span className="material-symbols-rounded text-base mr-2">settings</span>
                        Configurar
                    </Button>
                    <Button className="w-auto px-8 h-11 bg-blue-600 shadow-blue-500/20 cursor-default">
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
                        onClick={handleCopyAllOfficial}
                        disabled={isCopyingAll || rootBaseThemes.length === 0}
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
                        {rootBaseThemes.map(theme => {
                            const isExpanded = expandedThemes.has(theme.id);
                            const subthemes = getBaseSubthemes(theme.id);

                            return (
                                <div key={theme.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100">
                                    <div
                                        onClick={() => toggleBaseTheme(theme.id)}
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
                                                        onClick={() => handleCopyManual(sub.id)}
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
                                                        onClick={() => handleCopyManual(theme.id)}
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
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-center justify-center pt-24 sticky top-10">
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                    <button
                        onClick={handleCopyAllOfficial}
                        disabled={isCopyingAll || rootBaseThemes.length === 0}
                        className="my-6 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xl shadow-blue-500/10 flex items-center justify-center text-blue-600 hover:scale-110 hover:border-blue-500 transition-all group disabled:opacity-50 disabled:scale-100"
                    >
                        {isCopyingAll ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-rounded text-2xl group-hover:rotate-180 transition-transform duration-500">double_arrow</span>
                        )}
                    </button>
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                </div>

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
                                onClick={() => setIsAddingNew(true)}
                                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
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
                                        <button onClick={() => setIsAddingNew(false)} className="text-slate-300 hover:text-slate-500">
                                            <span className="material-symbols-rounded text-base">close</span>
                                        </button>
                                    </div>
                                    <input
                                        autoFocus
                                        className="w-full bg-slate-50 border-b-2 border-blue-500 px-3 py-2 rounded-t-xl font-bold text-slate-900 focus:outline-none"
                                        value={newTitle}
                                        placeholder="Escribe el título aquí..."
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && createNewTheme(newTitle)}
                                        onBlur={() => !newTitle.trim() && setIsAddingNew(false)}
                                    />
                                    {isSaving === 'new' && <p className="text-[10px] text-blue-500 font-bold uppercase animate-pulse">Guardando...</p>}
                                </div>
                            </div>
                        )}

                        {userThemes.map((theme, idx) => {
                            const subthemes = getUserSubthemes(theme.id);
                            const hasSubthemes = subthemes.length > 0;
                            const isExpanded = expandedUserThemes.has(theme.id);

                            return (
                                <div key={theme.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100 group">
                                    <div
                                        onClick={() => hasSubthemes && toggleUserTheme(theme.id)}
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full font-black text-xs ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                {renderContentItem(theme, false, true)}
                                            </div>
                                        </div>
                                        {hasSubthemes && <span className={`material-symbols-rounded transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>}
                                    </div>

                                    {hasSubthemes && isExpanded && (
                                        <div className="px-5 pb-5 pt-1 space-y-2 border-t border-slate-50 bg-slate-50/30">
                                            {subthemes.map((sub, sidx) => (
                                                <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-300 w-5">{idx + 1}.{sidx + 1}</span>
                                                    <div className="flex-1">{renderContentItem(sub, true)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    function renderContentItem(content: UserContent, isSub = false, isHeader = false) {
        const isEditing = editingContentId === content.id;
        return (
            <div className="flex items-center justify-between gap-4 group/item">
                {isEditing ? (
                    <div className="editor-container flex-1" onClick={e => e.stopPropagation()}>
                        <input
                            autoFocus
                            className="w-full bg-slate-50 border-b-2 border-blue-500 px-0 py-1 font-bold text-slate-900 focus:outline-none"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateContent(content.id)}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-4 flex-1">
                        <h3 className={`${isSub ? 'text-sm font-medium' : 'text-base font-bold'} text-slate-800`}>
                            {content.titulo}
                        </h3>
                    </div>
                )}

                {!isEditing && (
                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                        <button onClick={() => reorderContent(content, 'up')} className="p-1.5 text-slate-300 hover:text-blue-500"><span className="material-symbols-rounded text-base">arrow_upward</span></button>
                        <button onClick={() => reorderContent(content, 'down')} className="p-1.5 text-slate-300 hover:text-blue-500"><span className="material-symbols-rounded text-base">arrow_downward</span></button>
                        {isHeader && <button onClick={() => createNewSubtheme(content.id)} className="p-1.5 text-slate-300 hover:text-green-600"><span className="material-symbols-rounded text-lg">add_box</span></button>}
                        <button onClick={() => startEditing(content)} className="p-1.5 text-slate-300 hover:text-blue-600"><span className="material-symbols-rounded text-lg">edit</span></button>
                        <button onClick={() => deleteContent(content.id)} className="p-1.5 text-slate-300 hover:text-red-500"><span className="material-symbols-rounded text-lg">delete</span></button>
                    </div>
                )}
            </div>
        );
    }
}
