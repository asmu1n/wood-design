'use server';

import { updateRoomTitle, deleteRoom } from '@/db/services/room';
import { attempt } from '@/utils/common';
import { revalidatePath } from 'next/cache';
import { createRoom } from '@/lib/roomPermission';

/**
 * Update a room's title and revalidate the '/dashboard' path.
 *
 * @param params - Parameters for updating the room's title (contains the room identifier and the new title)
 * @throws The underlying error if the update operation fails.
 */
export async function updateRoomTitleAction(params: Parameters<typeof updateRoomTitle>[0]) {
    const [error] = await attempt(async () => updateRoomTitle(params));

    if (error) {
        console.error('Failed to update room title:', error);
        throw error;
    }

    revalidatePath('/dashboard');
}

/**
 * Delete a room and revalidate the '/dashboard' path.
 *
 * @throws The underlying error if room deletion fails.
 */
export async function deleteRoomAction(params: Parameters<typeof deleteRoom>[0]) {
    const [error] = await attempt(async () => deleteRoom(params));

    if (error) {
        console.error('Failed to delete room:', error);
        throw error;
    }

    revalidatePath('/dashboard');
}

/**
 * Creates a room using the provided input and revalidates the dashboard cache.
 *
 * Calls `createRoom` with `params`; on success, triggers revalidation of the '/dashboard' path. If creation fails, logs the error and rethrows it.
 *
 * @param params - The input object passed to `createRoom` containing the room creation data
 */
export async function createRoomAction(params: Parameters<typeof createRoom>[0]) {
    const [error] = await attempt(async () => createRoom(params));

    if (error) {
        console.error('Failed to create room:', error);
        throw error;
    }

    revalidatePath('/dashboard');
}