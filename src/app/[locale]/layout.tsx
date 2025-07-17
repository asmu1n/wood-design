import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import '../globals.css';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const ibmPlexSans = localFont({
    src: [
        {
            path: '../fonts/IBMPlexSans-Regular.ttf',
            weight: '400',
            style: 'normal'
        },
        {
            path: '../fonts/IBMPlexSans-Medium.ttf',
            weight: '500',
            style: 'normal'
        },
        {
            path: '../fonts/IBMPlexSans-SemiBold.ttf',
            weight: '600',
            style: 'normal'
        },
        {
            path: '../fonts/IBMPlexSans-Bold.ttf',
            weight: '700',
            style: 'normal'
        }
    ]
});
const bebasNeue = localFont({
    src: [
        {
            path: '../fonts/BebasNeue-Regular.ttf',
            weight: '400',
            style: 'normal'
        }
    ],
    variable: '--bebas-neue'
});

export const metadata: Metadata = {
    title: 'WoodBook',
    description: 'WoodBook is a book lending platform that connects readers with book lovers.'
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale}>
            <head>{process.env.NODE_ENV === 'development' && <Script src="https://unpkg.com/react-scan/dist/auto.global.js"></Script>}</head>
            <body className={`${ibmPlexSans.className} ${bebasNeue.variable} antialiased`}>
                <NextIntlClientProvider>{children}</NextIntlClientProvider>
                <Toaster />
            </body>
        </html>
    );
}
