'use client';

import useLayerList from '@/lib/hooks/useLayerList';
import { cn, hexToRgb } from '@/utils/common';
import { useMutation, useOthers, useSelf, useStorage } from '@liveblocks/react';
import { PiSidebarSimpleThin } from 'react-icons/pi';
import { useState } from 'react';
import Link from 'next/link';
import LayerButton from './LayerButton';
import UserAvatar from './UserAvatar';
import Image from 'next/image';
import type { UpdateLayerParams } from '../../../types';
import { connectionIdToColor } from '@/utils/layer';
import ShareMenu from './ShareMenu';
import LayerInfo, { SectionTemplate } from './LayerInfo';

interface SideBarProps {
    roomName: string;
    roomId: string;
    othersWithAccessToRoom: User[];
}

export default function SideBars({ roomName, roomId, othersWithAccessToRoom }: SideBarProps) {
    const [visible, setVisible] = useState(false);

    return (
        <>
            {/* Left Sidebar */}
            <LeftSidebar visible={visible} roomId={roomId} roomName={roomName} setVisible={setVisible} />

            {/* Right Sidebar */}
            <RightSidebar visible={visible} roomId={roomId} othersWithAccessToRoom={othersWithAccessToRoom} />
        </>
    );
}

interface UserAvatarsProps {
    className?: string;
}

function UserAvatars({ className }: UserAvatarsProps) {
    const me = useSelf();
    const others = useOthers();

    return (
        <div className={cn('flex gap-2 overflow-x-scroll text-xs', className)}>
            {me && <UserAvatar color={connectionIdToColor(me.connectionId)} name={me.info.name} />}
            {others.map(other => (
                <UserAvatar key={other.connectionId} color={connectionIdToColor(other.connectionId)} name={other.info.name} />
            ))}
        </div>
    );
}

interface RightSidebarProps {
    visible: boolean;
    roomId: string;
    othersWithAccessToRoom: User[];
}

function RightSidebar({ visible, roomId, othersWithAccessToRoom }: RightSidebarProps) {
    const selection = useSelf(me => me.presence.selection);
    const selectedLayer = selection?.length === 1 ? selection[0] : null;
    const updateLayer = useMutation(
        ({ storage }, update: UpdateLayerParams) => {
            if (!selectedLayer) {
                return;
            }

            const updateParams = {
                ...update,
                stroke: update.stroke ? hexToRgb(update.stroke) : undefined,
                fill: update.fill ? hexToRgb(update.fill) : undefined
            };

            const layer = storage.get('layers').get(selectedLayer);

            layer?.update(updateParams);
        },
        [selectedLayer]
    );
    const layer = useStorage(root => (selectedLayer ? root.layers.get(selectedLayer) || null : null));

    return (
        <>
            {!visible || layer ? (
                <div
                    className={cn(
                        'fixed right-0 flex w-[240px] flex-col border-l border-gray-200 bg-white',
                        visible && layer && 'top-3 right-3 bottom-3 rounded-xl',
                        !visible && !layer && 'h-screen',
                        !visible && layer && 'top-0 bottom-0 h-screen'
                    )}>
                    <div className="flex items-center justify-between pr-2">
                        <UserAvatars className="max-w-36 p-3" />
                        <ShareMenu roomId={roomId} othersWithAccessToRoom={othersWithAccessToRoom} />
                    </div>
                    <div className="border-b border-gray-200"></div>
                    <LayerInfo layer={layer} updateLayer={updateLayer} />
                </div>
            ) : (
                <div className="fixed top-3 right-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white pr-2">
                    <UserAvatars className="max-w-36 p-3" />
                    <ShareMenu roomId={roomId} othersWithAccessToRoom={othersWithAccessToRoom} />
                </div>
            )}
        </>
    );
}

interface LeftSidebarProps {
    roomName: string;
    roomId: string;
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

function LeftSidebar({ roomName, visible, setVisible }: LeftSidebarProps) {
    const { layers, layerIds } = useLayerList();
    const selection = useSelf(me => me.presence.selection);
    const reversedLayerIds = [...(layerIds || [])].reverse();

    return (
        <>
            {!visible ? (
                <div className="fixed left-0 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white">
                    <div className="p-4">
                        <div className="flex justify-between">
                            <Link href="/dashboard">
                                <Image src="/figma-logo.svg" alt="Figma logo" width={18} height={18} />
                            </Link>
                            <PiSidebarSimpleThin onClick={() => setVisible(true)} className="h-5 w-5 cursor-pointer" />
                        </div>
                        <h2 className="mt-2 scroll-m-20 text-[13px] font-medium">{roomName}</h2>
                    </div>
                    <SectionTemplate title="Layers">
                        {layerIds &&
                            reversedLayerIds.map(id => (
                                <LayerButton key={id} layerId={id} type={layers?.get(id)?.type} isSelected={selection?.includes(id) || false} />
                            ))}
                    </SectionTemplate>
                </div>
            ) : (
                <div className="fixed start-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white p-4">
                    <Link href="/dashboard">
                        <Image src="/figma-logo.svg" alt="Figma logo" className="h-[18px w-[18px]" />
                    </Link>
                    <h2 className="scroll-m-20 text-[13px] font-medium">{roomName}</h2>
                    <PiSidebarSimpleThin onClick={() => setVisible(false)} className="h-5 w-5 cursor-pointer" />
                </div>
            )}
        </>
    );
}
