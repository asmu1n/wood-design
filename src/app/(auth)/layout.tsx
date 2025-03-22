import { auth } from '@/lib/config/auth';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (session) {
        redirect('/');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="max-w-sm space-y-6">{children}</div>
        </main>
    );
}
