'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminService } from '@/services/admin.service';

interface Unit {
    id: number; // ID es el SIE
    nombre: string;
    direccion: string;
    telefono: string;
    distrito_id: number;
    distrito?: {
        nombre: string;
        departamento?: { nombre: string }
    };
}

interface District {
    id: number;
    nombre: string;
    departamento?: {
        nombre: string
    };
}

export default function AdminUnitsPage() {
    const router = useRouter();
    const [units, setUnits] = useState<Unit[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentUnit, setCurrentUnit] = useState<Partial<Unit>>({});
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [unitsRes, districtsRes] = await Promise.all([
            AdminService.getUnits(),
            AdminService.getDistricts()
        ]);

        if (unitsRes.data) setUnits(unitsRes.data);
        if (districtsRes.data) setDistricts(districtsRes.data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditing && currentUnit.id) {
                await AdminService.updateUnit(currentUnit.id, currentUnit as any);
            } else {
                await AdminService.createUnit(currentUnit as any);
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error saving unit:', error);
            alert('Error al guardar. Revisa la consola.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta unidad? Esta acción no se puede deshacer.')) return;
        await AdminService.deleteUnit(id);
        loadData();
    };

    const openNew = () => {
        setCurrentUnit({});
        setIsEditing(false);
        setShowModal(true);
    };

    const openEdit = (unit: Unit) => {
        setCurrentUnit(unit);
        setIsEditing(true);
        setShowModal(true);
    };

    const filteredUnits = units.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id?.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => router.back()} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Unidades Educativas</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-9">Gestiona el catálogo de escuelas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={openNew}>
                        <span className="material-symbols-rounded mr-2">add</span>
                        Nueva Unidad
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <th className="p-4">Nombre / Código</th>
                                <th className="p-4">Ubicación</th>
                                <th className="p-4">Distrito</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUnits.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                        No se encontraron resultados
                                    </td>
                                </tr>
                            ) : (
                                filteredUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{unit.nombre}</p>
                                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{unit.id}</span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-rounded text-slate-400 text-base">location_on</span>
                                                {unit.direccion || 'Sin dirección'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700">{unit.distrito?.nombre || '-'}</span>
                                                <span className="text-xs text-slate-400">{unit.distrito?.departamento?.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(unit)}
                                                    className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-rounded text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(unit.id)}
                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-rounded text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Manual (Quick Implementation) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEditing ? 'Editar Unidad' : 'Nueva Unidad'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <Input
                                label="Nombre de la Unidad"
                                value={currentUnit.nombre || ''}
                                onChange={e => setCurrentUnit({ ...currentUnit, nombre: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Código SIE</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={currentUnit.id || ''}
                                        onChange={e => setCurrentUnit({ ...currentUnit, id: parseInt(e.target.value) || undefined })}
                                        required={!isEditing}
                                        disabled={isEditing}
                                    />
                                </div>
                                <Input
                                    label="Teléfono"
                                    value={currentUnit.telefono || ''}
                                    onChange={e => setCurrentUnit({ ...currentUnit, telefono: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Dirección"
                                value={currentUnit.direccion || ''}
                                onChange={e => setCurrentUnit({ ...currentUnit, direccion: e.target.value })}
                            />

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Distrito</label>
                                <select
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={currentUnit.distrito_id || ''}
                                    onChange={e => setCurrentUnit({ ...currentUnit, distrito_id: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value="">Selecciona un distrito...</option>
                                    {districts.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.nombre} ({d.departamento?.nombre || 'General'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <Button type="submit" isLoading={saving}>
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
