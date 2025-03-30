import { selectUserById } from '@/db/services/users';
import { auth } from '@/lib/config/auth';
import { liveblocksConfig } from '@env';
import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
    secret: liveblocksConfig.secretKey!
});

export async function POST(request: Request) {
    const userSession = await auth();

    const userId = userSession?.user?.id;

    const user = await selectUserById(userId!);

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 获取用户房间，并邀请加入
    const session = liveblocks.prepareSession(user.id, {
        userInfo: {
            name: user.email || '游客'
        }
    });

    session.allow(`room:${'test'}`, session.FULL_ACCESS);
    const { status, body } = await session.authorize();

    return new Response(body, { status });
}
