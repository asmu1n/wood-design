'use client';

import { useTranslations } from 'next-intl';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Render a full-page error UI that displays the provided error message and a retry control.
 *
 * Shows the error's message inside a styled card and renders a button that invokes `reset` when clicked.
 *
 * @param error - The Error object (optionally extended) whose `message` will be displayed to the user
 * @param reset - Callback invoked to retry or reset the error state when the user clicks the retry button
 * @returns The rendered error page element
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const t = useTranslations('error');

    return (
        <div className="flex h-full flex-col items-center justify-center bg-linear-to-br from-purple-500 to-indigo-600 text-white">
            <div className="text-center">
                <h1 className="mb-4 animate-bounce text-6xl font-bold">{t('title')}</h1>
                <p className="mb-8 text-2xl">{t('description')}</p>
                <p className="mb-8 rounded-lg bg-white p-4 text-xl text-gray-800 shadow-lg">{error.message}</p>
                <button
                    onClick={reset}
                    className="transform rounded-lg bg-white px-6 py-3 font-semibold text-purple-600 shadow-md transition-all duration-300 hover:scale-105 hover:bg-purple-100">
                    {t('try_again')}
                </button>
            </div>
            <div className="mt-12 text-sm text-gray-200">
                <p>{t('contact')}</p>
            </div>
        </div>
    );
}