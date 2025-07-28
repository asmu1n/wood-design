'use client';

import { ReactNode } from 'react';
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from '@liveblocks/react/suspense';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import DefaultLoading from '../DefaultLoading';

interface RoomProps {
    children: ReactNode;
    roomId: string;
}

export function Room({ children, roomId }: RoomProps) {
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
            <RoomProvider {...roomParams}>
                <ClientSideSuspense fallback={<DefaultLoading />}>{children}</ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
