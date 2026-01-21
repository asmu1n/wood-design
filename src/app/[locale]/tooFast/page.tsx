import { useTranslations } from 'next-intl';

/**
 * Renders the "Too Fast" page using the 'too_fast' translation namespace.
 *
 * @returns The page JSX containing a localized title and description.
 */
export default function TooFastPage() {
    const t = useTranslations('too_fast');

    return (
        <main className="root-container flex flex-col items-center justify-center">
            <h1 className="font-bebas-neue text-light-100 text-5xl font-bold">{t('title')}</h1>
            <p className="text-light-400 mt-3 max-w-xl text-center">{t('description')}</p>
        </main>
    );
}