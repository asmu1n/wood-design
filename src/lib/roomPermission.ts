import { liveblocksConfig } from '@env';
import { Liveblocks, RoomAccesses, RoomPermission } from '@liveblocks/node';
import db from './config/database';
import rooms, { roomInsertSchema } from '@/db/schema/rooms';
import { selectUserById } from '@/db/services/users';

const liveblocks = new Liveblocks({
    secret: liveblocksConfig.secretKey!
});

interface createRoomParams {
    createUserId: string;
    name: string;
    groupAccess?: RoomAccesses;
    userAccess?: RoomAccesses;
    defaultAccess?: RoomPermission;
}

async function createRoom({ createUserId, groupAccess, userAccess, defaultAccess, name }: createRoomParams) {
    const user = await selectUserById(createUserId);

    if (!user) {
        throw new Error('用户不存在');
    }

    const accessConfig = {
        defaultAccesses: defaultAccess || ['room:read', 'room:presence:write'],
        groupsAccesses: groupAccess || {},
        usersAccesses: userAccess || {
            [createUserId]: ['room:write']
        }
    };
    //todo 后续换成 nanoid
    const room = await liveblocks.createRoom('test', accessConfig);
    const parseData = roomInsertSchema.parse({
        name,
        createUserId
    });

    await db.insert(rooms).values(parseData);

    return room.id;
}

export { createRoom };
