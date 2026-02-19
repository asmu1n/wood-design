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
