import { liveblocksConfig } from '@env';
import { Liveblocks, RoomAccesses, RoomPermission } from '@liveblocks/node';
import db from './config/database';
import rooms, { roomInsertSchema, roomUpdateSchema } from '@/db/schema/rooms';
import { selectUserById } from '@/db/services/users';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

const liveblocks = new Liveblocks({
    secret: liveblocksConfig.secretKey!
});

type TAccess = 'ALL' | 'ONLY_READ';

function getAccess(type: TAccess) {
    const permissions: ['room:write'] | ['room:read', 'room:presence:write'] = type === 'ALL' ? ['room:write'] : ['room:read', 'room:presence:write'];

    return permissions;
}

interface createRoomParams {
    createUserId: string;
    name: string;
    groupAccess?: RoomAccesses;
    userAccess?: RoomAccesses;
    defaultAccess?: RoomPermission;
}

async function createRoom({
    createUserId,
    groupAccess = {},
    userAccess,
    defaultAccess = ['room:read', 'room:presence:write'],
    name
}: createRoomParams) {
    const user = await selectUserById(createUserId);

    if (!user) {
        throw new Error('用户不存在');
    }

    const accessConfig = {
        defaultAccesses: defaultAccess,
        groupsAccesses: groupAccess,
        usersAccesses: userAccess || {
            [createUserId]: ['room:write']
        }
    };

    const roomId = uuid();
    const room = await liveblocks.createRoom(roomId, accessConfig);
    const parseData = roomInsertSchema.parse({
        id: roomId,
        name,
        createUserId,
        allowedUserIds: [createUserId] // 默认添加创建者到可访问用户列表
    });

    await db.insert(rooms).values(parseData);

    return room.id;
}

interface addAllowedUserParams {
    roomId: string;
    userId: string;
}

async function addAllowedUser({ roomId, userId }: addAllowedUserParams) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId));

    if (!room.length) {
        throw new Error('房间不存在');
    }

    const currentAllowedUsers = room[0].allowedUserIds || [];

    if (currentAllowedUsers.includes(userId)) {
        return;
    }

    const parseData = roomUpdateSchema.parse({
        allowedUserIds: [...currentAllowedUsers, userId],
        lastUpdateAt: Date.now()
    });

    await db.update(rooms).set(parseData).where(eq(rooms.id, roomId));
}

interface removeAllowedUserParams {
    roomId: string;
    userId: string;
}

async function removeAllowedUser({ roomId, userId }: removeAllowedUserParams) {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId));

    if (!room.length) {
        throw new Error('房间不存在');
    }

    if (room[0].createUserId === userId) {
        throw new Error('不能删除创建者');
    }

    const currentAllowedUsers = room[0].allowedUserIds || [];

    if (!currentAllowedUsers.includes(userId)) {
        return;
    }

    const updatedAllowedUsers = currentAllowedUsers.filter(id => id !== userId);

    const parsedData = roomUpdateSchema.parse({
        allowedUserIds: updatedAllowedUsers,
        lastUpdateAt: Date.now()
    });

    await db.update(rooms).set(parsedData).where(eq(rooms.id, roomId));
}

interface validateUserPermissionParams {
    roomId: string;
    checkUserId: string;
    checkPermissionType?: TAccess | 'ANY';
}

async function validateUserPermission({ roomId, checkUserId, checkPermissionType = 'ALL' }: validateUserPermissionParams) {
    const room = await liveblocks.getRoom(roomId);
    const targetUser = room.usersAccesses[checkUserId];

    switch (checkPermissionType) {
        case 'ALL': {
            return targetUser[0] === 'room:write';
        }

        case 'ONLY_READ': {
            return targetUser[0] === 'room:read' && targetUser[1] === 'room:presence:write';
        }

        case 'ANY': {
            return targetUser.length > 0;
        }

        default: {
            return false;
        }
    }
}

interface updateUserPermissionParams {
    roomId: string;
    processedUserId: string;
    accessType: 'ALL' | 'ONLY_READ';
}
interface triggerUserPermissionParams extends updateUserPermissionParams {
    actionUserId: string;
}

async function _updateUserPermission({ roomId, processedUserId, accessType = 'ONLY_READ' }: updateUserPermissionParams) {
    const permissions = getAccess(accessType);

    return liveblocks.updateRoom(roomId, {
        usersAccesses: {
            [processedUserId]: permissions
        }
    });
}

async function _invitedUserToRoom({ roomId, processedUserId, accessType = 'ONLY_READ' }: updateUserPermissionParams) {
    const targetUserPermission = await validateUserPermission({
        roomId,
        checkUserId: processedUserId,
        checkPermissionType: 'ANY'
    });

    if (targetUserPermission) {
        throw new Error('该用户已经存在');
    } else {
        const permissions = getAccess(accessType);

        await liveblocks.updateRoom(roomId, {
            usersAccesses: {
                [processedUserId]: permissions
            }
        });

        return addAllowedUser({ roomId, userId: processedUserId });
    }
}

async function _removeUserFromRoom({ roomId, userId }: { roomId: string; userId: string }) {
    await removeAllowedUser({ roomId, userId });
    return liveblocks.updateRoom(roomId, {
        usersAccesses: {
            [userId]: [] as any // 空数组表示移除所有权限
        }
    });
}

async function triggerUserPermission(
    { roomId, processedUserId, actionUserId, accessType }: triggerUserPermissionParams,
    type: 'UPDATE'
): Promise<void>;
async function triggerUserPermission(
    { roomId, processedUserId, actionUserId, accessType }: triggerUserPermissionParams,
    type: 'INVITE'
): Promise<void>;
async function triggerUserPermission({ roomId, actionUserId, accessType }: triggerUserPermissionParams, type: 'REMOVE'): Promise<void>;
async function triggerUserPermission(
    { roomId, processedUserId: processedUserId, actionUserId, accessType = 'ONLY_READ' }: triggerUserPermissionParams,
    type: 'UPDATE' | 'INVITE' | 'REMOVE'
) {
    const checkPermission = await validateUserPermission({
        roomId,
        checkUserId: actionUserId,
        checkPermissionType: 'ALL'
    });

    if (!checkPermission) {
        throw new Error('用户没有权限');
    }

    switch (type) {
        case 'INVITE': {
            return _invitedUserToRoom({ roomId, processedUserId, accessType });
        }

        case 'UPDATE': {
            return _updateUserPermission({ roomId, processedUserId, accessType });
        }

        case 'REMOVE': {
            if (processedUserId === actionUserId) {
                throw new Error('不能删除自己');
            }

            return _removeUserFromRoom({ roomId, userId: processedUserId });
        }
    }
}

export { createRoom, validateUserPermission, triggerUserPermission };
