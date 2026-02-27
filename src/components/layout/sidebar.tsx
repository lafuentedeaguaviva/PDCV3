'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { ProfileService } from '@/services/profile.service';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

// Inline utility for now if not exists
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

const MENU_ITEMS = [
    { icon: 'inbox', label: 'Mi Escritorio', href: '/dashboard' },
    { icon: 'school', label: 'Áreas de Trabajo', href: '/dashboard/areas' },
    { icon: 'library_books', label: 'Banco de Contenidos', href: '/dashboard/library' },
    { icon: 'calendar_month', label: 'Planificación', href: '/dashboard/planning' },
    { icon: 'edit_document', label: 'Mis PDC', href: '/dashboard/pdcs' },
];


export function Sidebar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const { isCollapsed, toggleSidebar } = useSidebar();

    useEffect(() => {
        checkAdminRole();
    }, []);

    const checkAdminRole = async () => {
        try {
            const { data, error } = await AuthService.getSession();
            if (error) throw error;

            if (data.session?.user) {
                const profile = await ProfileService.getProfile(data.session.user.id);
                if (profile?.roles?.includes('Administrador')) {
                    setIsAdmin(true);
                }
            }
        } catch (err) {
            console.error('Sidebar auth check error:', err);
        }
    };

    return (
        <aside className={classNames(
            "fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 hidden md:flex flex-col z-40 transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Brand & Toggle */}
            <div className={classNames(
                "h-16 flex items-center border-b border-slate-800 transition-all duration-300",
                isCollapsed ? "px-4 justify-center" : "px-6 justify-between"
            )}>
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
                        <div className="size-8 bento-gradient-1 rounded-lg flex items-center justify-center text-white shadow-md group-hover:shadow-blue-500/20 transition-all shrink-0">
                            <span className="material-symbols-rounded text-lg">lightbulb</span>
                        </div>
                        <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-200 transition-colors truncate">EduPlan Pro</span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="size-8 bento-gradient-1 rounded-lg flex items-center justify-center text-white shadow-md shrink-0">
                        <span className="material-symbols-rounded text-lg">lightbulb</span>
                    </div>
                )}

                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-rounded text-xl">menu_open</span>
                    </button>
                )}
            </div>

            {isCollapsed && (
                <div className="flex justify-center py-4 border-b border-slate-800/50">
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-rounded text-xl">menu</span>
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={classNames(
                                'flex items-center gap-3 rounded-xl transition-all duration-200 group',
                                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2',
                                isActive
                                    ? 'bg-blue-600/10 text-blue-400 font-bold'
                                    : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <span className={classNames(
                                'material-symbols-rounded text-xl transition-colors shrink-0',
                                isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <>
                        <Link
                            href="/dashboard/admin"
                            title={isCollapsed ? "Panel Admin" : undefined}
                            className={classNames(
                                'flex items-center gap-3 rounded-xl transition-all duration-200 group mt-2',
                                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2',
                                pathname === '/dashboard/admin'
                                    ? 'bg-purple-600/10 text-purple-400 font-bold'
                                    : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <span className={classNames(
                                'material-symbols-rounded text-xl transition-colors shrink-0',
                                pathname === '/dashboard/admin' ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                                admin_panel_settings
                            </span>
                            {!isCollapsed && <span className="text-sm truncate">Panel Admin</span>}
                        </Link>
                        <Link
                            href="/dashboard/admin/schedule"
                            title={isCollapsed ? "Cronograma Global" : undefined}
                            className={classNames(
                                'flex items-center gap-3 rounded-xl transition-all duration-200 group mt-1',
                                isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2',
                                pathname === '/dashboard/admin/schedule'
                                    ? 'bg-orange-600/10 text-orange-400 font-bold'
                                    : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <span className={classNames(
                                'material-symbols-rounded text-xl transition-colors shrink-0',
                                pathname === '/dashboard/admin/schedule' ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                                calendar_view_week
                            </span>
                            {!isCollapsed && <span className="text-sm truncate">Cronograma Global</span>}
                        </Link>
                    </>
                )}
            </nav>

            {/* User Footer - Profile Button */}
            <div className="p-3 border-t border-slate-800">
                <Link href="/dashboard/profile">
                    <div className={classNames(
                        "bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all cursor-pointer group border border-slate-700/50 hover:border-slate-700 flex items-center",
                        isCollapsed ? "p-2 justify-center" : "p-3 gap-3"
                    )}>
                        <div className="size-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Juan" alt="Avatar" className="w-full h-full" />
                        </div>
                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white">Juan Pérez</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-300">Pro Tier</p>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded text-slate-500 group-hover:text-white text-lg">chevron_right</span>
                            </>
                        )}
                    </div>
                </Link>
            </div>
        </aside >
    );
}
