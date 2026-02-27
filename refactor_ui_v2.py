
import os
import re

file_path = r"d:\PDC\PDCV3\src\app\dashboard\areas\[id]\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update handleUpdate to support subtitle and fix lint
old_handle_update = r'''    const handleUpdate = async (id: number) => {
        if (!editingTitle.trim()) return;
        const success = await LibraryService.updateUserContent(id, editingTitle);
        if (success) {
            setUserContents(userContents.map(c => c.id === id ? { ...c, titulo: editingTitle } : c));
            setEditingContentId(null);
            setEditingTitle('');
        }
    };'''

new_handle_update = r'''    const handleUpdate = async (id: number) => {
        if (!editingTitle.trim()) return;
        const success = await LibraryService.updateUserContent(id, { 
            titulo: editingTitle,
            subtitulo: editingSubtitle 
        });
        if (success) {
            setUserContents(userContents.map(c => c.id === id ? { ...c, titulo: editingTitle, subtitulo: editingSubtitle } : c));
            setEditingContentId(null);
            setEditingTitle('');
            setEditingSubtitle('');
        }
    };'''

# 2. Update renderThemeAccordion structure to match base themes (Alignment)
theme_pattern = r'const renderThemeAccordion = \(theme: UserContent, index: number\) => \{.*?return \(.*?\);\n                            \};'
new_theme_accordion = r'''const renderThemeAccordion = (theme: UserContent, index: number) => {
                                const subthemes = getUserSubthemes(theme.id);
                                const hasSubthemes = subthemes.length > 0;
                                const isExpanded = expandedUserThemes.has(theme.id);

                                return (
                                    <div key={theme.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-blue-100 group">
                                        {/* Theme Card / Accordion Header */}
                                        <div
                                            onClick={() => hasSubthemes ? toggleUserTheme(theme.id) : router.push(`/dashboard/pdc-design?areaId=${id}&contentId=${theme.id}`)}
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
                                                        onClick={() => router.push(`/dashboard/pdc-design?areaId=${id}&contentId=${sub.id}`)}
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
                            };'''

# 3. Update renderUserContentInner for Subtitles
inner_pattern = r'function renderUserContentInner\(content: UserContent, isPotentialSubtheme = false, isHeader = false\) \{.*?return \(.*?\);\n                            \}'
new_inner_content = r'''function renderUserContentInner(content: UserContent, isPotentialSubtheme = false, isHeader = false) {
                                const isSubtheme = isPotentialSubtheme || !!content.padre_id;
                                return editingContentId === content.id ? (
                                    <div className="py-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            className="w-full bg-slate-50 border-b-2 border-blue-500 px-0 py-1 font-bold text-slate-900 focus:outline-none transition-all"
                                            value={editingTitle}
                                            placeholder="Título..."
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(content.id)}
                                        />
                                        <input
                                            className="w-full bg-slate-50 border-b border-slate-200 px-0 py-0.5 text-xs font-medium text-slate-500 focus:outline-none transition-all"
                                            value={editingSubtitle || ''}
                                            placeholder="Añadir subtítulo..."
                                            onChange={(e) => setEditingSubtitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(content.id)}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4 group/inner">
                                        <div className="flex items-center gap-4">
                                            <div className="space-y-0.5">
                                                <h3 className={`${isSubtheme ? 'text-sm font-medium' : 'text-base font-bold'} text-slate-800 transition-colors group-hover:text-blue-700`}>
                                                    {content.titulo}
                                                </h3>
                                                {content.subtitulo && (
                                                    <p className="text-[10px] text-slate-400 font-medium leading-tight italic">
                                                        {content.subtitulo}
                                                    </p>
                                                )}
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
                                            <button
                                                onClick={() => { 
                                                    setEditingContentId(content.id); 
                                                    setEditingTitle(content.titulo);
                                                    setEditingSubtitle(content.subtitulo || '');
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <span className="material-symbols-rounded text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(content.id)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <span className="material-symbols-rounded text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }'''

# 4. Update fallback mapping (Alignment)
orphaned_pattern = r'\{orphanedSubthemes.map\(\(sub, idx\) => renderThemeAccordion\(sub, userThemes.length \+ idx\)\)\}'
new_orphaned = r'''{orphanedSubthemes.map((sub, idx) => renderThemeAccordion(sub, userThemes.length + idx))}'''

# Apply replacements
updated_content = content.replace(old_handle_update, new_handle_update)
updated_content = re.sub(theme_pattern, new_theme_accordion, updated_content, flags=re.DOTALL)
updated_content = re.sub(inner_pattern, new_inner_content, updated_content, flags=re.DOTALL)
# No need to change the map line as it's already correct in the file based on the view, but good to be safe.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Refactoring complete.")
