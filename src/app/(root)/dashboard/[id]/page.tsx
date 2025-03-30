import { Room } from '@/components/liveblocks/Room';
import { auth } from '@/lib/config/auth';

export default async function DashboardPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();

    return (
        <Room roomId={'room:' + id}>
            <h1>Room {id}</h1>
        </Room>
    );
}
