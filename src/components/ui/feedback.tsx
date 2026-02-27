import { Button } from './button';

interface FeedbackProps {
    title: string;
    description: string;
    icon?: string;
    onRetry?: () => void;
    retryLabel?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Feedback({
    title,
    description,
    icon = 'info',
    onRetry,
    retryLabel = 'Reintentar',
    className = '',
    children,
}: FeedbackProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
            <div className="size-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-rounded text-slate-400 text-3xl">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">{description}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="w-auto px-6">
                    {retryLabel}
                </Button>
            )}
            {children}
        </div>
    );
}
