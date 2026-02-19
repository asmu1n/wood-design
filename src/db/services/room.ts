import db from '@/lib/config/database';
import rooms, { roomUpdateSchema } from '@/db/schema/rooms';
import { eq, arrayContains, and, desc, count } from 'drizzle-orm';
import { validateUserPermission } from '@/lib/roomPermission';
import { queryFilter } from '@/utils/common';
import { getTranslations } from 'next-intl/server';

interface UpdateRoomTitleParams {
    actionUserId: string;
    roomId: string;
    updateName: string;
}

async function updateRoomTitle({ actionUserId, roomId, updateName }: UpdateRoomTitleParams) {
    const t = await getTranslations('auth');
    const validResult = validateUserPermission({
        roomId,
        checkUserId: actionUserId,
        checkPermissionType: 'ALL'
    });

    if (!validResult) {
        throw new Error(t('no_permission'));
    }

    const saferParams = roomUpdateSchema.parse({
        name: updateName,
        lastUpdateAt: new Date()
    });

    await db.update(rooms).set(saferParams).where(eq(rooms.id, roomId));

    return db.select().from(rooms).where(eq(rooms.id, roomId));
}

interface DeleteRoomParams {
    actionUserId: string;
    roomId: string;
}

async function deleteRoom({ actionUserId, roomId }: DeleteRoomParams) {
    const t = await getTranslations('auth');
    const validResult = validateUserPermission({
        roomId,
        checkUserId: actionUserId,
        checkPermissionType: 'ALL'
    });

    if (!validResult) {
        throw new Error(t('no_permission'));
    }

    return db.delete(rooms).where(eq(rooms.id, roomId));
}

interface GetAllowedRoomByUserIdParams {
    userId: string;
}

async function getAllowedRoomByUserId({ userId, pageIndex = 1, limit = 10 }: QueryParams<GetAllowedRoomByUserIdParams>) {
    const filter = arrayContains(rooms.allowedUserIds, [userId]);

    const items = await db
        .select()
        .from(rooms)
        .where(filter)
        .orderBy(desc(rooms.lastUpdateAt))
        .limit(limit)
        .offset((pageIndex - 1) * limit);

    const [{ value: total }] = await db.select({ value: count() }).from(rooms).where(filter);

    return { data: items, total };
}

interface GetRoomListParams {
    ownerUserId?: string;
}

async function getRoomList({ ownerUserId, pageIndex = 1, limit = 10 }: QueryParams<GetRoomListParams>) {
    const filterConfigMap = {
        ownerUserId: (value: string) => eq(rooms.createUserId, value)
    };

    const filterList = queryFilter(filterConfigMap, { ownerUserId });
    const filter = and(...filterList);

    const items = await db
        .select()
        .from(rooms)
        .where(filter)
        .orderBy(desc(rooms.lastUpdateAt))
        .limit(limit)
        .offset((pageIndex - 1) * limit);

    const [{ value: total }] = await db.select({ value: count() }).from(rooms).where(filter);

    return { data: items, total };
}

async function getRoomById(roomId: string) {
    const result = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

    return result[0];
}

export { updateRoomTitle, deleteRoom, getAllowedRoomByUserId, getRoomList, getRoomById };
