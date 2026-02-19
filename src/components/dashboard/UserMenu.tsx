'use client';

import UserAvatar from '../sidebars/UserAvatar';
import { BiChevronDown } from 'react-icons/bi';
import { GoSignOut } from 'react-icons/go';
import { signOut } from '@/db/services/auth';
import { Button } from '../ui/button';
import PopoverConfirm from '../PopoverConfirm';
import { useTranslations } from 'next-intl';

export default function UserMenu({ email }: { email: string | null }) {
    const t = useTranslations();

    return (
        <PopoverConfirm
            trigger={
                <div className="flex w-fit cursor-pointer items-center gap-2 rounded-md p-1 hover:bg-gray-100">
                    <UserAvatar name={email ?? 'Anonymous'} />
                    <h2 className="scroll-m-20 text-[13px] font-medium">{email}</h2>
                    <BiChevronDown className="h-4 w-4" />
                </div>
            }>
            <Button onClick={signOut}>
                <span className="text-xs">{t('auth.logout')}</span>
                <GoSignOut className="mr-2 h-4 w-4" />
            </Button>
        </PopoverConfirm>
    );
}
