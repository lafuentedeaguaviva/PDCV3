'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService, Unit, District } from '@/services/admin.service';
import { AuthService } from '@/services/auth.service';
import { ProfileService } from '@/services/profile.service';

export function useAdminController() {
    const router = useRouter();
    const [units, setUnits] = useState<Unit[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAccess = async () => {
        try {
            const { data, error: sessionError } = await AuthService.getSession();
            if (sessionError || !data.session) {
                router.push('/login');
                return false;
            }

            const profile = await ProfileService.getProfile(data.session.user.id);
            const isAdmin = profile?.roles?.includes('Administrador');

            if (!isAdmin) {
                router.push('/dashboard');
                return false;
            }
            return true;
        } catch (err) {
            console.error('Access check failed:', err);
            router.push('/login');
            return false;
        }
    };

    const loadUnitsData = async () => {
        setLoading(true);
        try {
            const [unitsRes, districtsRes] = await Promise.all([
                AdminService.getUnits(),
                AdminService.getDistricts()
            ]);
            if (unitsRes.data) setUnits(unitsRes.data);
            if (districtsRes.data) setDistricts(districtsRes.data);
        } finally {
            setLoading(false);
        }
    };

    const loadUsersData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                AdminService.getUsers(),
                AdminService.getRoles()
            ]);
            if (usersRes.data) setUsers(usersRes.data);
            if (rolesRes.data) setRoles(rolesRes.data);
        } finally {
            setLoading(false);
        }
    };

    const saveUnit = async (unit: Partial<Unit>, isEditing: boolean) => {
        setSaving(true);
        setError(null);
        try {
            let res;
            if (isEditing && unit.id) {
                res = await AdminService.updateUnit(unit.id, unit as any);
            } else {
                res = await AdminService.createUnit(unit as any);
            }
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar la unidad');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteUnit = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta unidad?')) return false;
        const res = await AdminService.deleteUnit(id);
        return res.success;
    };

    const saveUserRoles = async (userId: string, newRoles: string[]) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.updateUserRoles(userId, newRoles);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al actualizar roles');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        units,
        districts,
        users,
        roles,
        loading,
        saving,
        error,
        checkAccess,
        loadUnitsData,
        loadUsersData,
        saveUnit,
        deleteUnit,
        saveUserRoles
    };
}
