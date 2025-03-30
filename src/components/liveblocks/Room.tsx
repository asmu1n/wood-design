'use client';

import { ReactNode } from 'react';
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from '@liveblocks/react/suspense';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import logo from '@/assets/figma-logo.svg';
import Image from 'next/image';

export function Room({ children, roomId }: { children: ReactNode; roomId: string }) {
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

    const loadingComp = (
        <div className="flex h-screen flex-col items-center justify-center gap-2">
            <Image src={logo} alt="logo" className="h-12.5 w-12.5 animate-bounce" />
            <h1 className="text-sm font-normal">Loading…</h1>
        </div>
    );

    return (
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
            <RoomProvider {...roomParams}>
                <ClientSideSuspense fallback={loadingComp}>{children}</ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
