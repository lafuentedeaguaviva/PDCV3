'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminService } from '@/services/admin.service';

interface User {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    roles: string[];
    created_at: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [allRoles, setAllRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Roles State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([
            AdminService.getUsers(),
            AdminService.getRoles()
        ]);

        if (usersRes.data) setUsers(usersRes.data);
        if (rolesRes.data) setAllRoles(rolesRes.data);
        setLoading(false);
    };

    const openEditRoles = (user: User) => {
        setCurrentUser(user);
        setSelectedRoles([...user.roles]);
        setShowModal(true);
    };

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleSaveRoles = async () => {
        if (!currentUser) return;
        setSaving(true);
        try {
            await AdminService.updateUserRoles(currentUser.id, selectedRoles);
            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Error saving roles:', error);
            alert('Error al guardar roles');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.nombres?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.apellidos?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => router.back()} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-9">Administra accesos y permisos del sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-80"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Roles</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {user.nombres?.[0]}{user.apellidos?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{user.nombres} {user.apellidos}</p>
                                                    <p className="text-xs text-slate-400">Registrado el {new Date(user.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 font-mono">
                                            {user.email}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map(role => (
                                                        <span key={role} className={`text-xs px-2 py-0.5 rounded-full font-bold border ${role === 'Administrador'
                                                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                                            }`}>
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Sin roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditRoles(user)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-rounded text-base mr-1">shield_person</span>
                                                Roles
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Edit Roles */}
            {showModal && currentUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">
                                Gestionar Roles
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 mb-4">
                                Asignando roles para <span className="font-bold text-slate-800">{currentUser.nombres} {currentUser.apellidos}</span>
                            </p>

                            <div className="space-y-2">
                                {allRoles.map(role => {
                                    const isSelected = selectedRoles.includes(role);
                                    return (
                                        <div
                                            key={role}
                                            onClick={() => toggleRole(role)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-5 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                                                    }`}>
                                                    {isSelected && <span className="material-symbols-rounded text-white text-sm font-bold">check</span>}
                                                </div>
                                                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{role}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <Button onClick={handleSaveRoles} isLoading={saving}>
                                    Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
