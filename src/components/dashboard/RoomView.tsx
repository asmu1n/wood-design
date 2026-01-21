'use client';

import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { useEffect, useMemo, useState } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { attempt, cn } from '@/utils/common';
import { updateRoomTitleAction, deleteRoomAction } from '@/actions/room';
import { toast } from '@/lib/hooks/useToast';
import { Input } from '../ui/input';
import { useTranslations } from 'next-intl';

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

/**
 * Render a grid of room tiles that support selection, navigation, and per-room editing/deletion when permitted.
 *
 * @param userId - The current user's ID used to determine edit permissions
 * @param displayRooms - Array of rooms to display
 * @returns The rendered rooms view element
 */
export default function RoomsView({ userId, displayRooms }: RoomViewProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();
    const contentDivRef = useRef<HTMLDivElement>(null);
    const t = useTranslations();

    const roomColors = useMemo(() => {
        return displayRooms.map((room, index) => ({
            id: room.id,
            color: PASTEL_COLORS[index % PASTEL_COLORS.length]
        }));
    }, [displayRooms]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (contentDivRef.current && !contentDivRef.current.contains(e.target as Node)) {
                setSelected(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={contentDivRef} className="flex flex-col gap-10">
            <div className="flex flex-wrap gap-4">
                {displayRooms.map(room => {
                    const roomColor = roomColors.find(rc => rc.id === room.id)?.color ?? PASTEL_COLORS[0]!;

                    return (
                        <React.Fragment key={room.id}>
                            <SingleRoom
                                id={room.id}
                                title={room.name}
                                userId={userId}
                                description={t('dashboard.created_at', { date: room.createdAt ? room.createdAt.toLocaleDateString() : '' })}
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

/**
 * Renders a single room card with selection, navigation, inline renaming, and deletion controls.
 *
 * Renders a colorful tile that can be selected or double-clicked to navigate, shows the room title
 * (editable when permitted), a description line, and a confirmation modal for deletion.
 *
 * @param id - The room's unique identifier
 * @param userId - The current user's id used for action requests
 * @param title - The room's current title
 * @param description - Secondary text shown below the title (e.g., creation date)
 * @param color - Background color for the room tile
 * @param selected - Whether this room is currently selected
 * @param select - Callback invoked when the room tile is clicked to select it
 * @param navigateTo - Callback invoked on double-click to navigate into the room
 * @param canEdit - Whether the current user is allowed to rename or delete the room
 * @returns The rendered room card element
 */
function SingleRoom({ id, userId, title, description, color, selected, select, navigateTo, canEdit }: SingleRoomProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const t = useTranslations();

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
                    title: t('dashboard.rename_fail'),
                    description: error.message
                });
            } else {
                toast({
                    variant: 'success',
                    title: t('dashboard.rename_success'),
                    description: t('dashboard.room_renamed')
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
                title: t('dashboard.rename_fail'),
                description: error.message
            });
        } else {
            toast({
                variant: 'success',
                title: t('dashboard.rename_success'),
                description: t('dashboard.room_renamed')
            });
        }
    };

    const confirmDelete = async () => {
        const [error] = await attempt(() => deleteRoomAction({ actionUserId: userId, roomId: id }));

        if (error) {
            toast({
                variant: 'destructive',
                title: t('dashboard.delete_fail'),
                description: error.message
            });
        } else {
            toast({
                variant: 'success',
                title: t('dashboard.delete_success'),
                description: t('dashboard.room_deleted')
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
                <Input
                    type="text"
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    className="h-8"
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
                message={t('dashboard.delete_confirm')}
            />
        </div>
    );
}