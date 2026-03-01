import { useState, useCallback } from 'react';

export type FeedbackType = 'error' | 'success' | 'info' | 'warning';

export interface FeedbackState {
    type: FeedbackType;
    title: string;
    description: string;
    isOpen: boolean;
}

export function useFeedback() {
    const [feedback, setFeedback] = useState<FeedbackState>({
        type: 'info',
        title: '',
        description: '',
        isOpen: false
    });

    const showError = useCallback((title: string, error?: unknown) => {
        const description = error instanceof Error ? error.message : String(error || '');
        setFeedback({
            type: 'error',
            title,
            description,
            isOpen: true
        });
    }, []);

    const showSuccess = useCallback((title: string, message?: unknown) => {
        const description = typeof message === 'string' ? message : String(message || '');
        setFeedback({
            type: 'success',
            title,
            description,
            isOpen: true
        });
    }, []);

    const showInfo = useCallback((title: string, message?: unknown) => {
        const description = typeof message === 'string' ? message : String(message || '');
        setFeedback({
            type: 'info',
            title,
            description,
            isOpen: true
        });
    }, []);

    const hideFeedback = useCallback(() => {
        setFeedback(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        feedback,
        showError,
        showSuccess,
        showInfo,
        hideFeedback
    };
}
