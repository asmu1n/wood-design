'use client';

import { ReactNode } from 'react';
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from '@liveblocks/react/suspense';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import { UserInfoProvider, type UserInfo } from '@/store/userInfo';
import DefaultLoading from '../DefaultLoading';

interface RoomProps {
    children: ReactNode;
    userInfo: UserInfo;
    roomId: string;
}

/**
 * Provides a configured Liveblocks room context and renders `children` inside the composed providers.
 *
 * Initializes presence and storage for the room and nests LiveblocksProvider, UserInfoProvider,
 * RoomProvider, and a client-side suspense boundary around the component's children.
 *
 * @param children - React nodes to render inside the room context
 * @param userInfo - User information passed into the UserInfoProvider as custom state
 * @param roomId - Identifier for the Liveblocks room to join
 * @returns A JSX element that wraps `children` with Liveblocks providers and a suspense fallback
 */
export function Room({ children, userInfo, roomId }: RoomProps) {
    const roomParams = {
        id: roomId,
        initialPresence: {
            selection: [],
            cursor: null,
            penColor: null,
            pencilDraft: null
        } as Liveblocks['Presence'],
        initialStorage: {
            roomColor: { r: 30, g: 30, b: 30 },
            layers: new LiveMap<string, LiveObject<Layer>>(),
            layerIds: new LiveList<string>([])
        } as Liveblocks['Storage']
    };

    return (
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
            <UserInfoProvider CustomState={userInfo}>
                <RoomProvider {...roomParams}>
                    <ClientSideSuspense fallback={<DefaultLoading />}>{children}</ClientSideSuspense>
                </RoomProvider>
            </UserInfoProvider>
        </LiveblocksProvider>
    );
}