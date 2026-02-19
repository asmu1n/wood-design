'use client';

import { useState, useTransition } from 'react';
import { SlPencil } from 'react-icons/sl';
import { createRoomAction } from '@/actions/room';
import { attempt, cn } from '@/utils/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Dialog from '../Dialog';
import { toast } from '@/lib/hooks/useToast';
import { useTranslations } from 'next-intl';

interface CreateRoomProps {
    userId: string;
}

export default function CreateRoom({ userId }: CreateRoomProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [isPending, startTransition] = useTransition();
    const t = useTranslations();

    const handleCreateRoom = () => {
        if (!roomName.trim() || isPending) {
            return;
        }

        startTransition(async () => {
            const [error] = await attempt(() =>
                createRoomAction({
                    createUserId: userId,
                    name: roomName
                })
            );

            if (error) {
                toast({
                    variant: 'destructive',
                    title: t('dashboard.create_fail'), // Added manually or used common.fail
                    description: error.message
                });
            } else {
                toast({
                    variant: 'success',
                    title: t('common.success'),
                    description: t('dashboard.room_created')
                });
                setIsOpen(false);
                setRoomName('');
            }
        });
    };

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className="group flex h-fit w-fit cursor-pointer items-center gap-3 rounded-xl bg-gray-100 px-6 py-5 transition-all select-none hover:bg-blue-500">
                <div className="flex h-fit w-fit items-center justify-center rounded-full bg-blue-600 p-2">
                    <SlPencil className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col gap-0.5 text-[11px]">
                    <p className={cn('font-semibold text-black group-hover:text-white')}>{t('dashboard.new_file')}</p>
                    <p className={cn('text-black group-hover:text-white')}>{t('dashboard.create_new')}</p>
                </div>
            </div>

            <Dialog
                open={isOpen}
                onUpdateOpenState={setIsOpen}
                title={t('dashboard.create_room')}
                footer={
                    <div className="flex w-full justify-end gap-2">
                        <Button type="outline" onClick={() => setIsOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleCreateRoom} disabled={isPending || !roomName.trim()}>
                            {isPending ? t('common.loading') : t('common.confirm')}
                        </Button>
                    </div>
                }>
                <div className="py-4">
                    <Input
                        placeholder={t('dashboard.room_name_placeholder')}
                        value={roomName}
                        onChange={e => setRoomName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleCreateRoom();
                            }
                        }}
                        autoFocus
                    />
                </div>
            </Dialog>
        </>
    );
}
