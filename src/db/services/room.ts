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

/**
 * Update a room's name and lastUpdateAt after verifying the actor has ALL permission.
 *
 * @param actionUserId - ID of the user performing the update
 * @param roomId - ID of the room to update
 * @param updateName - New name to set on the room
 * @returns The updated room record
 * @throws Error - when the acting user lacks permission to update the room
 */
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

/**
 * Deletes a room by ID after verifying the acting user has ALL permissions on the room.
 *
 * @param actionUserId - ID of the user performing the deletion
 * @param roomId - ID of the room to delete
 * @returns The result of the delete operation
 * @throws Error if the acting user does not have permission to delete the room (message is localized)
 */
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

/**
 * Fetches rooms that include the specified user in their allowedUserIds with pagination.
 *
 * @param userId - The user ID to filter rooms by
 * @param pageIndex - 1-based page index for pagination (default: 1)
 * @param limit - Maximum number of items per page (default: 10)
 * @returns An object with `data` — the matching room records ordered by `lastUpdateAt` descending — and `total` — the count of matching rooms
 */
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

/**
 * Fetches a paginated list of rooms, optionally filtering by the owner's user ID.
 *
 * @param ownerUserId - If provided, only rooms created by this user are returned
 * @param pageIndex - 1-based page index to return
 * @param limit - Maximum number of items per page
 * @returns An object with `data` as an array of matching room records ordered by `lastUpdateAt` (descending) and `total` as the total count of matching rooms
 */
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

/**
 * Fetches a room record by its ID.
 *
 * @param roomId - The ID of the room to retrieve
 * @returns The room record if found, `undefined` otherwise
 */
async function getRoomById(roomId: string) {
    const result = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);

    return result[0];
}

export { updateRoomTitle, deleteRoom, getAllowedRoomByUserId, getRoomList, getRoomById };