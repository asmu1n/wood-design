import { selectUserById } from '@/db/services/users';
import { auth } from '@/lib/config/auth';
import { liveblocksConfig } from '@env';
import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
    secret: liveblocksConfig.secretKey!
});

/**
 * Handle POST requests to authenticate the caller, map them to a user, and identify that user with Liveblocks.
 *
 * Authenticates the current session, looks up the corresponding user record, and calls Liveblocks' identifyUser
 * with the user's id and basic profile (name or "游客", avatar or empty string). If no user is found, returns
 * a 401 Unauthorized response.
 *
 * @param request - The incoming HTTP request for this API route
 * @returns A Response containing Liveblocks' identifyUser body and its HTTP status, or a 401 response with body "Unauthorized" when the user is not found
 */
export async function POST(request: Request) {
    const userSession = await auth();

    const userId = userSession?.user?.id;

    const user = await selectUserById(userId!);

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 获取用户房间，并邀请加入
    const { status, body } = await liveblocks.identifyUser(
        {
            userId: user.id,
            groupIds: []
        },
        { userInfo: { name: user.name || '游客', avatar: user.image || '' } }
    );

    return new Response(body, { status });
}