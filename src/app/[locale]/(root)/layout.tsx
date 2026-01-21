import { auth } from '@/lib/config/auth';
import { redirect } from 'next/navigation';

/**
 * Gates access to its children by ensuring an authenticated session and redirects unauthenticated users to `/login`.
 *
 * @param children - Content to render when the user is authenticated
 * @returns The layout element that wraps `children`
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    return <main className="min-h-screen bg-white">{children}</main>;
}