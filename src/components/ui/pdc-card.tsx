import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDC } from '@/types';
import { Card, Badge } from './atoms';
import { Button } from './button';

interface PdcCardProps {
    pdc: PDC;
    onDelete: (id: string) => void;
    onResume?: (id: string) => void;
}

export function PdcCard({ pdc, onDelete, onResume }: PdcCardProps) {
    // Usar fecha_inicio del PDC maestro, con fallback a created_at o fecha actual
    const rawDate = pdc.fecha_inicio || pdc.created_at || new Date().toISOString();
    const startDate = new Date(rawDate);

    // Validar si la fecha es válida para evitar RangeError
    const isValidDate = !isNaN(startDate.getTime());

    const areas = pdc.areas_trabajo || [];
    const firstArea = areas[0];
    const displayTitle = `PDC ${pdc.trimestre}° Trimestre - Mes ${pdc.mes}`;

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
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {displayTitle}
                </h3>
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
