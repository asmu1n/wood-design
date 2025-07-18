'use client';

import { useTranslations } from 'next-intl';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

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
