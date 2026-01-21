import Canvas from '@/components/liveblocks/Canvas';
import { Room } from '@/components/liveblocks/Room';
import { getRoomById } from '@/db/services/room';
import { selectUserById, selectUsersByIds } from '@/db/services/users';
import { auth } from '@/lib/config/auth';
import { redirect } from 'next/navigation';

/**
 * Render the dashboard page for the room specified by the route `id`.
 *
 * Authenticates the request, loads the room and current user, fetches users allowed to access the room, and returns a Room component that contains the Canvas. Redirects to `/login` if there is no authenticated session or the user cannot be loaded.
 *
 * @param params - A promise resolving to an object with the route parameter `id`
 * @returns A JSX element rendering the room dashboard containing the Canvas component
 */
export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const room = await getRoomById(id);

    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await selectUserById(session.user.id);

    if (!user) {
        redirect('/login');
    }

    const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        avatar: user.image
    };

    const allowedUserList = await selectUsersByIds(room.allowedUserIds);

    return (
        <Room roomId={room.id} userInfo={userInfo}>
            <Canvas roomName={room.name} roomId={room.id} othersWithAccessToRoom={allowedUserList} />
        </Room>
    );
}