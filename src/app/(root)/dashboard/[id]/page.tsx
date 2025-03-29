import { Room } from '@/components/liveblocks/Room';
import { auth } from '@/lib/config/auth';

export default async function DashboardPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();

    return <Room roomId={id}></Room>;
}
