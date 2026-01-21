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

/**
 * Map an access level to the corresponding Liveblocks room permission set.
 *
 * @param type - Access level: `'ALL'` grants full write permission; `'ONLY_READ'` grants read and presence-write permissions
 * @returns `['room:write']` when `type` is `'ALL'`, `['room:read', 'room:presence:write']` when `type` is `'ONLY_READ'`
 */
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

/**
 * Creates a new room with the given name and access configuration, persists the room record, and returns its ID.
 *
 * @param createUserId - ID of the user who creates the room
 * @param groupAccess - Optional mapping of group IDs to permission arrays for group-level access
 * @param userAccess - Optional mapping of user IDs to permission arrays for user-level access; when omitted the creator is granted `room:write`
 * @param defaultAccess - Default permission array applied to unspecified users/groups
 * @param name - Display name of the room
 * @returns The newly created room's ID
 * @throws Error - `"用户不存在"` if the creator user ID does not exist
 */
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

/**
 * Adds a user to a room's allowed user list if they are not already present.
 *
 * Throws an error if the room does not exist.
 *
 * @param roomId - The identifier of the room to update
 * @param userId - The identifier of the user to add to the room's allowed list
 */
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

/**
 * Removes a user from the room's allowedUserIds list.
 *
 * If the user is not in the list the function returns without making changes.
 *
 * @param roomId - The ID of the room to update
 * @param userId - The ID of the user to remove from allowed users
 * @throws Error '房间不存在' if the room does not exist
 * @throws Error '不能删除创建者' if attempting to remove the room creator
 */
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

/**
 * Checks whether a specific user holds the requested permission level for a room.
 *
 * @param roomId - The identifier of the room to check
 * @param checkUserId - The identifier of the user whose permissions are being checked
 * @param checkPermissionType - The permission level to verify:
 *   - `'ALL'`: user must have `room:write`
 *   - `'ONLY_READ'`: user must have `room:read` and `room:presence:write`
 *   - `'ANY'`: user must have any permission entry
 * @returns `true` if the user meets the requested permission type, `false` otherwise
 */
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

/**
 * Set the specified user's permissions for a Liveblocks room.
 *
 * @param roomId - The ID of the room to update
 * @param processedUserId - The ID of the user whose permissions will be changed
 * @param accessType - Permission scope to apply; `'ALL'` grants full write access, `'ONLY_READ'` grants read and presence write
 * @returns The Liveblocks room update result
 */
async function _updateUserPermission({ roomId, processedUserId, accessType = 'ONLY_READ' }: updateUserPermissionParams) {
    const permissions = getAccess(accessType);

    return liveblocks.updateRoom(roomId, {
        usersAccesses: {
            [processedUserId]: permissions
        }
    });
}

/**
 * Adds the specified user to a Liveblocks room's permissions and persists them in the room's allowed-user list.
 *
 * @param roomId - The identifier of the room to modify
 * @param processedUserId - The user id to invite into the room
 * @param accessType - Permission scope to grant: `'ALL'` grants full write access; `'ONLY_READ'` grants read and presence-write access
 * @returns The result of persisting the user to the room's allowed-user list
 * @throws Error - `'该用户已经存在'` if the user already has any permission in the room
 */
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

/**
 * Remove a user's allowed status and clear their Liveblocks permissions for a room.
 *
 * @param roomId - The identifier of the room to modify
 * @param userId - The identifier of the user to remove from the room
 * @returns The Liveblocks update result for the room
 */
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
/**
 * Perform an authorized permission operation (invite, update, or remove) for a user in a room.
 *
 * Verifies that `actionUserId` holds `ALL` permission in the room before performing the requested action.
 *
 * @param roomId - The id of the room to modify
 * @param processedUserId - The id of the user whose permissions will be changed
 * @param actionUserId - The id of the user initiating the action; must have `ALL` permission
 * @param accessType - Permission level to apply when inviting or updating (`'ALL'` or `'ONLY_READ'`). Defaults to `'ONLY_READ'`
 * @param type - The operation to perform: `'INVITE'` to add a user, `'UPDATE'` to change a user's permissions, `'REMOVE'` to remove a user
 * @returns void
 * @throws Error('用户没有权限') if `actionUserId` does not have `ALL` permission in the room
 * @throws Error('不能删除自己') if `type` is `'REMOVE'` and `processedUserId` equals `actionUserId`
 */
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