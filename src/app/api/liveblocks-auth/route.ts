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

    console.log(user.id);

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
