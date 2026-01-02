import Canvas from '@/components/liveblocks/Canvas';
import { Room } from '@/components/liveblocks/Room';
import { getRoomById } from '@/db/services/room';
import { selectUsersByIds } from '@/db/services/users';

export default async function DashboardPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const room = await getRoomById(id);

    const allowedUserList = await selectUsersByIds(room.allowedUserIds);

    return (
        <Room roomId={room.id}>
            <Canvas roomName={room.name} roomId={room.id} othersWithAccessToRoom={allowedUserList} />
        </Room>
    );
}
