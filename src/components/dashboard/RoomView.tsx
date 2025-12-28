'use client';

import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { useEffect, useMemo, useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { attempt, cn } from '@/utils/common';
import { updateRoomTitleAction, deleteRoomAction, createRoomAction } from '@/actions/room';
import { Button } from '../ui/button';
import { toast } from '@/lib/hooks/useToast';

const PASTEL_COLORS = [
    'rgb(255, 182, 193)', // pink
    'rgb(176, 224, 230)', // powder blue
    'rgb(221, 160, 221)', // plum
    'rgb(188, 143, 143)', // rosy brown
    'rgb(152, 251, 152)', // pale green
    'rgb(238, 232, 170)', // pale goldenrod
    'rgb(230, 230, 250)', // lavender
    'rgb(255, 218, 185)' // peach
];

interface RoomViewProps {
    userId: string;
    displayRooms: Room[];
}

export default function RoomsView({ userId, displayRooms }: RoomViewProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();
    const outerDivRef = useRef<HTMLDivElement>(null);

    const roomColors = useMemo(() => {
        return displayRooms.map((room, index) => ({
            id: room.id,
            color: PASTEL_COLORS[index % PASTEL_COLORS.length]
        }));
    }, [displayRooms]);

    async function handleCreateRoom() {
        try {
            await createRoomAction({ createUserId: userId, name: 'Test233' });
            toast({
                variant: 'success',
                title: '创建成功',
                description: '房间已成功创建'
            });
        } catch {
            toast({
                variant: 'destructive',
                title: '创建失败',
                description: '请稍后重试'
            });
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (outerDivRef.current && !outerDivRef.current.contains(e.target as Node)) {
                setSelected(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={outerDivRef} className="flex flex-col gap-10">
            <div className="flex flex-wrap gap-4">
                {displayRooms.map(room => {
                    const roomColor = roomColors.find(rc => rc.id === room.id)?.color ?? PASTEL_COLORS[0]!;

                    return (
                        <React.Fragment key={room.id}>
                            <SingleRoom
                                id={room.id}
                                title={room.name}
                                userId={userId}
                                description={`创建于 ${room.createdAt?.toLocaleDateString()}`}
                                color={roomColor}
                                selected={selected === room.id}
                                select={() => setSelected(room.id)}
                                navigateTo={() => router.push('/dashboard/' + room.id)}
                                canEdit={room.createUserId === userId}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
            <Button onClick={handleCreateRoom}>Create Room</Button>
        </div>
    );
}

interface SingleRoomProps {
    id: string;
    userId: string;
    title: string;
    description: string;
    color: string;
    selected: boolean;
    select: () => void;
    navigateTo: () => void;
    canEdit: boolean;
}

function SingleRoom({ id, userId, title, description, color, selected, select, navigateTo, canEdit }: SingleRoomProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setIsEditing(false);

            if (editedTitle === title) {
                return;
            }

            const [error] = await attempt(() => updateRoomTitleAction({ actionUserId: userId, roomId: id, updateName: editedTitle }));

            if (error) {
                toast({
                    variant: 'destructive',
                    title: '更名失败',
                    description: '请稍后重试'
                });
            } else {
                toast({
                    variant: 'success',
                    title: '更名成功',
                    description: '房间名称已更新'
                });
            }
        }
    };

    const handleBlur = async () => {
        setIsEditing(false);

        if (editedTitle === title) {
            return;
        }

        const [error] = await attempt(() => updateRoomTitleAction({ actionUserId: userId, roomId: id, updateName: editedTitle }));

        if (error) {
            toast({
                variant: 'destructive',
                title: '更名失败',
                description: '请稍后重试'
            });
        } else {
            toast({
                variant: 'success',
                title: '更名成功',
                description: '房间名称已更新'
            });
        }
    };

    const confirmDelete = async () => {
        const [error] = await attempt(() => deleteRoomAction({ actionUserId: userId, roomId: id }));

        if (error) {
            toast({
                variant: 'destructive',
                title: '删除失败',
                description: '只有创建者可以删除房间'
            });
        } else {
            toast({
                variant: 'success',
                title: '删除成功',
                description: '房间已从列表中移除'
            });
        }

        setShowConfirmationModal(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Backspace' && selected && !isEditing) {
                e.preventDefault();
                setShowConfirmationModal(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selected, id, isEditing]);

    return (
        <div className="flex flex-col gap-0.5">
            <div
                onDoubleClick={navigateTo}
                onClick={select}
                style={{ backgroundColor: color }}
                className={cn(
                    'flex h-56 w-96 cursor-pointer items-center justify-center rounded-md',
                    selected ? 'border-2 border-blue-500' : 'border border-[#e8e8e8]'
                )}>
                <p className="text-md font-medium select-none">{title}</p>
            </div>
            {isEditing && canEdit ? (
                <input
                    type="text"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    className="mt-2 rounded-md border border-gray-200 px-2 py-0.5 text-[13px] outline-none"
                />
            ) : (
                <p onClick={() => setIsEditing(true)} className="mt-2 cursor-pointer text-[13px] font-medium select-none hover:text-blue-500">
                    {title}
                </p>
            )}
            <p className="text-[10px] text-gray-400 select-none">{description}</p>
            <ConfirmationModal
                isOpen={showConfirmationModal}
                onSetOpen={setShowConfirmationModal}
                onConfirm={confirmDelete}
                message="确定要删除这个房间吗？"
            />
        </div>
    );
}
