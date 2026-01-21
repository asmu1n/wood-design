import { redirect } from 'next/navigation';

/**
 * Redirects to `/dashboard` when this route is rendered.
 */
export default function Page() {
    redirect('/dashboard');
}