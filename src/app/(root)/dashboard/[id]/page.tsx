import Canvas from '@/components/liveblocks/Canvas';
import { Room } from '@/components/liveblocks/Room';
import { auth } from '@/lib/config/auth';

export default async function DashboardPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const session = await auth();

    return (
        <Room roomId={id}>
            <Canvas></Canvas>
        </Room>
    );
}
