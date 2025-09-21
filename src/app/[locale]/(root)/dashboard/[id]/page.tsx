import Canvas from '@/components/liveblocks/Canvas';
import { Room } from '@/components/liveblocks/Room';

export default async function DashboardPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // const session = await auth();

    return (
        <Room roomId={id}>
            <Canvas roomName="Test" roomId={id} othersWithAccessToRoom={[]} />
        </Room>
    );
}
