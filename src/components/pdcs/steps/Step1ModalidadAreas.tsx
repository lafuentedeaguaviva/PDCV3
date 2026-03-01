'use client';

import { AreaTrabajo, PDCMaster } from '@/types';

interface Props {
    pdcTypes: { id: number; name: string; icon: string; color: string; shadowColor: string }[];
    selectedType: number | null;
    setSelectedType: (id: number) => void;
    filteredAreas: AreaTrabajo[];
    selectedAreas: string[];
    toggleAreaSelection: (id: string) => void;
    recentPdcs?: PDCMaster[];
    resumePdc?: (pdc: PDCMaster) => void;
}

export function Step1ModalidadAreas({
    pdcTypes,
    selectedType,
    setSelectedType,
    filteredAreas,
    selectedAreas,
    toggleAreaSelection,
    recentPdcs = [],
    resumePdc
}: Props) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
            {/* Left: Modalidad */}
            <div className="xl:col-span-4 space-y-8">
                <div className="space-y-2">
                    <div className="h-1 w-10 bg-blue-600 rounded-full shadow-sm shadow-blue-500/50"></div>
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Modalidad del Plan</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Selecciona el tipo de PDC a generar</p>
                </div>

                <div className="grid gap-6">
                    {pdcTypes.map(type => (
                        <div
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`group p-5 rounded-2xl border-2 transition-all duration-500 cursor-pointer flex items-center gap-5 relative overflow-hidden ${selectedType === type.id
                                ? `border-${type.color} bg-white shadow-xl ${type.shadowColor} scale-[1.02] z-10`
                                : 'border-slate-100 hover:border-slate-300 bg-white hover:shadow-lg hover:scale-[1.01]'
                                }`}
                        >
                            {selectedType === type.id && (
                                <div className={`absolute inset-0 bg-gradient-to-br from-${type.color}/10 via-transparent to-${type.color}/5`}></div>
                            )}

                            <div className={`size-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg group-hover:rotate-3 relative z-10 ${selectedType === type.id ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                }`}>
                                <span className="material-symbols-rounded text-xl font-bold">{type.icon}</span>
                            </div>

                            <div className="relative z-10">
                                <span className={`text-base font-black block tracking-tight leading-none ${selectedType === type.id ? 'text-slate-950' : 'text-slate-500 group-hover:text-slate-900'}`}>
                                    PDC {type.name}
                                </span>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1.5 block opacity-70">
                                    Nivel {type.name} Educativo
                                </span>
                            </div>

                            {selectedType === type.id && (
                                <div className={`ml-auto size-8 bg-${type.color} rounded-xl flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-500 relative z-10`}>
                                    <span className="material-symbols-rounded text-xl font-bold">check</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Areas */}
            <div className="xl:col-span-8 space-y-8">
                <div className="space-y-2">
                    <div className="h-1 w-10 bg-blue-600 rounded-full shadow-sm shadow-blue-500/20"></div>
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Áreas de Trabajo</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Selecciona una o más áreas para planificar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAreas.map(area => (
                        <div
                            key={area.id}
                            onClick={() => toggleAreaSelection(area.id)}
                            className={`p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer relative overflow-hidden group/area ${selectedAreas.includes(area.id)
                                ? 'border-blue-600 bg-white shadow-xl shadow-blue-500/10 scale-[1.02] z-10'
                                : 'border-slate-100 hover:border-slate-300 bg-white hover:shadow-lg hover:scale-[1.01]'
                                }`}
                        >
                            {selectedAreas.includes(area.id) && (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-blue-50/30"></div>
                            )}

                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border transition-colors ${selectedAreas.includes(area.id) ? 'bg-blue-600 text-white border-transparent' : 'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                        {area.unidad_educativa?.nombre}
                                    </span>
                                    {selectedAreas.includes(area.id) && (
                                        <div className="size-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/40 animate-in zoom-in-50 duration-500">
                                            <span className="material-symbols-rounded text-xl font-bold">done_all</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className={`text-lg font-black leading-tight tracking-tight ${selectedAreas.includes(area.id) ? 'text-slate-950' : 'text-slate-700 group-hover/area:text-slate-950'}`}>
                                        {area.area_conocimiento?.nombre}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {(area.area_conocimiento as any).grado?.nombre} <span className="mx-1 text-slate-200">/</span> {area.turno?.nombre}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className={`absolute -right-12 -bottom-12 size-48 rounded-full blur-3xl transition-all duration-1000 ${selectedAreas.includes(area.id) ? 'bg-blue-100/50 opacity-100' : 'bg-slate-100/30 opacity-0 group-hover/area:opacity-100'
                                }`}></div>
                        </div>
                    ))}
                </div>

                {filteredAreas.length === 0 && (
                    <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 animate-in fade-in duration-500">
                        <span className="material-symbols-rounded text-5xl text-slate-200 mb-4 block">search_off</span>
                        <h3 className="text-lg font-bold text-slate-400">No hay clases {selectedType ? 'para este nivel' : ''}</h3>
                        <p className="text-slate-400 text-sm mt-1 max-w-[300px] mx-auto">
                            Primero selecciona una modalidad o revisa tus áreas de trabajo configuradas.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
