'use server';

import { selectUserByEmail } from '@/db/services/users';
import { triggerUserPermission } from '@/lib/roomPermission';
import { attempt } from '@/utils/common';
import { getTranslations } from 'next-intl/server';

interface UpdateUserPermissionParams {
    roomId: string;
    processedUserEmail: string;
    actionUserId: string;
    accessType?: 'ALL' | 'ONLY_READ';
}

/**
 * Shares access to a room with a user identified by email.
 *
 * Looks up the target user by `processedUserEmail` and grants them the specified `accessType` for `roomId` as performed by `actionUserId`.
 *
 * @param params - Parameters for the update:
 *   - roomId: ID of the room to share
 *   - processedUserEmail: Email of the user to grant access to
 *   - actionUserId: ID of the user performing the share
 *   - accessType: Optional access level to grant; defaults to `'ALL'`
 * @throws Error if no user is found for `processedUserEmail` or if granting permissions fails.
 */
export async function shareRoomAction(params: UpdateUserPermissionParams) {
    const t = await getTranslations('auth');
    const [error] = await attempt(async () => {
        const user = await selectUserByEmail(params.processedUserEmail);

        if (!user) {
            throw new Error(t('user_not_found'));
        }

        await triggerUserPermission(
            {
                roomId: params.roomId,
                processedUserId: user.id,
                actionUserId: params.actionUserId,
                accessType: params.accessType || 'ALL'
            },
            'INVITE'
        );
    });

    if (error) {
        console.error('Failed to share room:', error);
        throw error;
    }
}

/**
 * Removes a user's invitation or permission for a room.
 *
 * @param params - Parameters including `roomId`, `processedUserEmail` (the target user's email), `actionUserId` (the actor performing the removal), and optional `accessType` (defaults to `'ALL'`)
 * @throws Error if the target user cannot be found or if removing the permission fails
 */
export async function deleteInvitationAction(params: UpdateUserPermissionParams) {
    const t = await getTranslations('auth');
    const [error] = await attempt(async () => {
        const user = await selectUserByEmail(params.processedUserEmail);

        if (!user) {
            throw new Error(t('user_not_found'));
        }

        return triggerUserPermission(
            {
                roomId: params.roomId,
                processedUserId: user.id,
                actionUserId: params.actionUserId,
                accessType: params.accessType || 'ALL'
            },
            'REMOVE'
        );
    });

    if (error) {
        console.error('Failed to delete invitation:', error);
        throw error;
    }
}