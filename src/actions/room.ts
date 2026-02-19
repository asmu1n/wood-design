'use server';

import { updateRoomTitle, deleteRoom } from '@/db/services/room';
import { attempt } from '@/utils/common';
import { revalidatePath } from 'next/cache';
import { createRoom } from '@/lib/roomPermission';

export async function updateRoomTitleAction(params: Parameters<typeof updateRoomTitle>[0]) {
    const [error] = await attempt(async () => updateRoomTitle(params));

    if (error) {
        console.error('Failed to update room title:', error);
        throw error;
    }

    revalidatePath('/dashboard');
}

export async function deleteRoomAction(params: Parameters<typeof deleteRoom>[0]) {
    const [error] = await attempt(async () => deleteRoom(params));

    if (error) {
        console.error('Failed to delete room:', error);
        throw error;
    }

    revalidatePath('/dashboard');
}

export async function createRoomAction(params: Parameters<typeof createRoom>[0]) {
    const [error] = await attempt(async () => createRoom(params));

    if (error) {
        console.error('Failed to create room:', error);
        throw error;
    }

    revalidatePath('/dashboard');
}
