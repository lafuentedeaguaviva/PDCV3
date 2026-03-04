import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';
import { PDC } from '@/types';
import { Card, Badge } from './atoms';
import { Button } from './button';
import { PdcService } from '@/services/pdc.service';

interface PdcCardProps {
    pdc: PDC;
    onDelete: (id: string) => void;
    onResume?: (id: string) => void;
}

export function PdcCard({ pdc, onDelete, onResume }: PdcCardProps) {
    const rawDate = pdc.updated_at || pdc.fecha_inicio || pdc.created_at || new Date().toISOString();
    const startDate = new Date(rawDate);
    const isValidDate = !isNaN(startDate.getTime());

    const areas = pdc.areas_trabajo || [];
    const firstArea = areas[0];
    const fallbackTitle = `PDC ${pdc.trimestre}° Trimestre - Mes ${pdc.mes}`;

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(pdc.nombre_pdc || fallbackTitle);
    const [displayName, setDisplayName] = useState(pdc.nombre_pdc || fallbackTitle);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleSave = async () => {
        if (!editedName.trim()) return;
        setSaving(true);
        try {
            await PdcService.updatePdcMaster(pdc.id, { nombre_pdc: editedName.trim() });
            setDisplayName(editedName.trim());
            setIsEditing(false);
        } catch (e) {
            console.error('Error updating nombre_pdc:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedName(displayName);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    return (
        <Card className="flex flex-col md:flex-row gap-6 items-center hover:shadow-medium">
            {/* Date Badge */}
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl shrink-0 ${isValidDate ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                {isValidDate ? (
                    <>
                        <span className="text-xs font-bold uppercase">{format(startDate, 'MMM', { locale: es })}</span>
                        <span className="text-2xl font-bold">{format(startDate, 'dd', { locale: es })}</span>
                    </>
                ) : (
                    <span className="material-symbols-rounded text-2xl">event_busy</span>
                )}
                <span className="text-[10px] font-black opacity-70 mt-1">{pdc.gestion}</span>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                    <Badge variant="default">
                        {firstArea?.unidad_educativa?.nombre || 'Verificando...'}
                    </Badge>
                    <Badge variant="accent">
                        {firstArea?.area_conocimiento?.nombre || 'Verificando...'}
                    </Badge>
                    <Badge
                        variant={
                            pdc.estado === 'Verificado'
                                ? 'success'
                                : pdc.estado === 'Pendiente'
                                    ? 'warning'
                                    : 'error'
                        }
                    >
                        {pdc.estado}
                    </Badge>
                </div>

                {/* Inline editable title */}
                {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            ref={inputRef}
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 text-lg font-bold text-slate-900 border-b-2 border-blue-500 bg-transparent outline-none px-1 py-0.5 rounded-sm"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                            title="Guardar nombre"
                        >
                            <span className="material-symbols-rounded text-xl">{saving ? 'hourglass_empty' : 'check_circle'}</span>
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="text-slate-400 hover:text-slate-600"
                            title="Cancelar"
                        >
                            <span className="material-symbols-rounded text-xl">cancel</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group/title">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {displayName}
                        </h3>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="opacity-0 group-hover/title:opacity-100 text-slate-300 hover:text-blue-500 transition-opacity"
                            title="Editar nombre del PDC"
                        >
                            <span className="material-symbols-rounded text-base">edit</span>
                        </button>
                    </div>
                )}

                <p className="text-sm text-slate-500 line-clamp-1">
                    {areas.length > 1
                        ? `Afecta a ${areas.length} áreas vinculadas`
                        : `${firstArea?.turno?.nombre || 'Turno no especificado'}`}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="size-9 p-0 text-slate-400 hover:text-primary" title="Ver PDF">
                    <span className="material-symbols-rounded">picture_as_pdf</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="size-9 p-0 text-slate-400 hover:text-indigo-600"
                    title="Editar / Continuar"
                    onClick={() => onResume?.(pdc.id)}
                >
                    <span className="material-symbols-rounded">edit_square</span>
                </Button>
                <Button variant="ghost" size="sm" className="size-9 p-0 text-slate-400 hover:text-indigo-600" title="Duplicar">
                    <span className="material-symbols-rounded">content_copy</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="size-9 p-0 text-slate-400 hover:text-danger"
                    onClick={() => onDelete(pdc.id)}
                    title="Eliminar"
                >
                    <span className="material-symbols-rounded">delete</span>
                </Button>
            </div>
        </Card>
    );
}


