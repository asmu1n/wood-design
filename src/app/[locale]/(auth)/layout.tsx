import { auth } from '@/lib/config/auth';
import { redirect } from 'next/navigation';

/**
 * Renders the authentication layout for unauthenticated visitors and redirects authenticated users to the dashboard.
 *
 * Redirects to `/dashboard` when a valid session is detected; otherwise renders a centered container that displays `children`.
 *
 * @param children - The content to render inside the authentication layout for unauthenticated users.
 * @returns A React element containing a centered layout wrapper that renders `children`.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (session) {
        redirect('/dashboard');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-[min(100%,468px)] space-y-6">{children}</div>
        </main>
    );
}