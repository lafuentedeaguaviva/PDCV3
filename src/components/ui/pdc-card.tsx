import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDC } from '@/types';
import { Card, Badge } from './atoms';
import { Button } from './button';

interface PdcCardProps {
    pdc: PDC;
    onDelete: (id: string) => void;
}

export function PdcCard({ pdc, onDelete }: PdcCardProps) {
    const mainContent = pdc.semana_contenido?.[0];
    const firstContentTitle = mainContent?.contenido_usuario?.titulo || 'Plan Mensual';
    const startDate = new Date(pdc.fecha_inicio_trimestre);

    return (
        <Card className="flex flex-col md:flex-row gap-6 items-center hover:shadow-medium">
            {/* Date Badge */}
            <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 w-20 h-20 rounded-xl shrink-0">
                <span className="text-xs font-bold uppercase">{format(startDate, 'MMM', { locale: es })}</span>
                <span className="text-2xl font-bold">{format(startDate, 'dd', { locale: es })}</span>
                <span className="text-xs opacity-70">{pdc.gestion}</span>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                    <Badge variant="default">
                        {pdc.area_trabajo?.unidad_educativa?.nombre || 'S/UE'}
                    </Badge>
                    <Badge variant="indigo">
                        {pdc.area_trabajo?.area_conocimiento?.nombre || 'S/Área'}
                    </Badge>
                    {mainContent && (
                        <Badge
                            variant={
                                mainContent.estado === 'completado'
                                    ? 'success'
                                    : mainContent.estado === 'planificado'
                                        ? 'indigo'
                                        : 'warning'
                            }
                        >
                            {mainContent.estado}
                        </Badge>
                    )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {firstContentTitle}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-1">
                    {pdc.semana_contenido && pdc.semana_contenido.length > 1
                        ? `Y ${pdc.semana_contenido.length - 1} contenidos más`
                        : 'Sin temas adicionales'}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="size-9 p-0 text-slate-400 hover:text-primary" title="Ver PDF">
                    <span className="material-symbols-rounded">picture_as_pdf</span>
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
