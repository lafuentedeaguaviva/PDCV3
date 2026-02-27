'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LibraryService, ContentItem } from '@/services/library.service';
import { AreasService, AreaTrabajo } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LibraryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlAreaId = searchParams.get('areaId');

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ContentItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(urlAreaId);

    useEffect(() => {
        loadUserAreas();
        if (urlAreaId) {
            handleSearch(undefined, urlAreaId);
        }
    }, [urlAreaId]);

    const loadUserAreas = async () => {
        const { data: { session } } = await AuthService.getSession();
        if (session?.user) {
            const userAreas = await AreasService.getAreas(session.user.id);
            setAreas(userAreas);
        }
    };

    const handleSearch = async (e?: React.FormEvent, areaId: string | null = selectedAreaId) => {
        if (e) e.preventDefault();
        setIsSearching(true);
        try {
            const data = await LibraryService.searchContents(query, areaId ? parseInt(areaId) : undefined);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAreaClick = (areaConocimientoId: string) => {
        const newAreaId = selectedAreaId === areaConocimientoId ? null : areaConocimientoId;
        setSelectedAreaId(newAreaId);
        handleSearch(undefined, newAreaId);
    };

    const handleUseContent = async (baseContentId: number) => {
        if (!selectedAreaId) {
            alert('Por favor, selecciona una clase (contexto activo) primero para usar este contenido.');
            // Scroll to top to show area selection
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const activeArea = areas.find(a => String(a.area_conocimiento.id) === String(selectedAreaId));
        if (!activeArea) return;

        setIsSearching(true); // Re-use loading state for copy
        try {
            const result = await LibraryService.copyContentToUser(baseContentId, activeArea.id);
            if (result.success) {
                router.push(`/dashboard/areas/${activeArea.id}`);
            } else {
                alert('Error al copiar contenido: ' + (result.error?.message || result.error));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <span className="material-symbols-rounded text-3xl">library_books</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mis Contenidos Editables</h1>
                    </div>
                </div>
                {results.length > 0 && (
                    <div className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                        {results.length} PERSONALIZADOS
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 relative">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <span className="material-symbols-rounded text-slate-400 group-focus-within:text-blue-500 transition-colors">search</span>
                    </div>
                    <input
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-32 shadow-sm text-lg placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        placeholder="Buscar temas, contenidos o áreas..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-2 right-2">
                        <Button
                            type="submit"
                            className="h-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 px-6"
                            isLoading={isSearching}
                        >
                            Buscar
                        </Button>
                    </div>
                </div>
            </form>

            {/* Work Areas Selection (Contextual Cards) */}
            <div className="space-y-4 mb-12">
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Selecciona tu Clase</p>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">CONTEXTO ACTIVO</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {areas.map(area => {
                        const areaId = area.area_conocimiento.id;
                        const isSelected = String(selectedAreaId) === String(areaId);
                        return (
                            <button
                                key={area.id}
                                onClick={() => router.push(`/dashboard/areas/${area.id}`)}
                                className={`text-left p-5 rounded-[2rem] border transition-all relative group ${isSelected
                                    ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 text-white transform scale-[1.02]'
                                    : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                                    }`}
                            >
                                <div className="space-y-3">
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {area.unidad_educativa.nombre}
                                    </span>

                                    <div>
                                        <h3 className={`font-black text-lg leading-tight mb-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                            {area.area_conocimiento.nombre}
                                        </h3>
                                        <p className={`text-[11px] font-bold opacity-70 ${isSelected ? 'text-blue-50' : 'text-slate-400'}`}>
                                            {(area.area_conocimiento as any).grado?.nombre} • {(area.area_conocimiento as any).grado?.nivel?.nombre}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="flex items-center gap-1.5 grayscale opacity-70">
                                            <span className="material-symbols-rounded text-base">schedule</span>
                                            <span className="text-[11px] font-black uppercase tracking-tighter">{area.turno.nombre}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-rounded text-base grayscale opacity-70">group</span>
                                            <div className="flex gap-1">
                                                {area.paralelos.map(p => (
                                                    <span key={p.id} className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-500'
                                                        }`}>
                                                        {p.nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="absolute top-4 right-4 bg-white/20 p-1 rounded-full">
                                        <span className="material-symbols-rounded text-white text-base">check_circle</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-500">search_insights</span>
                        {selectedAreaId ? 'Sugerencias para tu Clase' : 'Todos los Contenidos'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {results.length > 0 ? (
                        results.map(item => {
                            const activeArea = areas.find(a => String(a.area_conocimiento.id) === String(selectedAreaId));

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleUseContent(item.id)}
                                    className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100/50 shadow-xl shadow-slate-200/20 hover:shadow-blue-500/10 hover:border-blue-200 transition-all group flex flex-col h-full ring-4 ring-transparent hover:ring-blue-50 active:scale-[0.98] cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-700 transition-colors leading-tight">
                                            {item.titulo}
                                            {item.trimestre && (
                                                <span className="ml-2 text-slate-400 text-sm font-normal">
                                                    ({item.trimestre})
                                                </span>
                                            )}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-3 mb-8">
                                            <span className={`${item.is_base ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' : 'bg-blue-50 text-blue-600 border-blue-100/50'} px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                                                {item.is_base ? 'Base oficial' : 'Personalizado'}
                                            </span>
                                            {item.is_base && (
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] tracking-tight ml-1">
                                                    <span className="material-symbols-rounded text-lg opacity-60">verified</span>
                                                    Base oficial
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-full h-px bg-slate-100 mb-8"></div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ACTUALIZADO:</div>
                                            <div className="text-sm font-bold text-slate-400">
                                                {new Date().toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            Planificar
                                            <span className="material-symbols-rounded text-xl">rocket_launch</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !isSearching && (
                            <div className="col-span-full text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200/60">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                    <span className="material-symbols-rounded text-4xl text-slate-300">library_books</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Empieza a explorar</h3>
                                <p className="text-slate-400 font-medium max-w-xs mx-auto">Busca temas, contenidos o áreas oficiales para potenciar tu planificación curricular.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LibraryPage() {
    return (
        <Suspense fallback={
            <div className="p-8 max-w-6xl mx-auto animate-pulse space-y-8">
                <div className="h-10 w-64 bg-slate-100 rounded-xl"></div>
                <div className="h-16 w-full bg-slate-50 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 4].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2rem]"></div>)}
                </div>
            </div>
        }>
            <LibraryContent />
        </Suspense>
    );
}
