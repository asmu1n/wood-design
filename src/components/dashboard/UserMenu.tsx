'use client';

import { useEffect, useRef, useState } from 'react';
import UserAvatar from '../sidebars/UserAvatar';
import { BiChevronDown } from 'react-icons/bi';
import { GoSignOut } from 'react-icons/go';
import { signOut } from '@/db/services/auth';
import { cn } from '@/utils/common';

export default function UserMenu({ email }: { email: string | null }) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative">
            <div onClick={() => setIsOpen(true)} className="flex w-fit cursor-pointer items-center gap-2 rounded-md p-1 hover:bg-gray-100">
                <UserAvatar name={email ?? 'Anonymous'} />
                <h2 className="scroll-m-20 text-[13px] font-medium">{email}</h2>
                <BiChevronDown className="h-4 w-4" />
            </div>
            <div
                className={cn(
                    'absolute top-0 left-0 flex min-w-[150px] translate-y-full flex-col rounded-xl bg-[#1e1e1e] p-2 shadow-lg',
                    !isOpen && 'hidden'
                )}
                // {`${isOpen ? '' : 'hidden'} absolute top-0 left-0 flex min-w-[150px] translate-y-full flex-col rounded-xl bg-[#1e1e1e] p-2 shadow-lg`}
                ref={menuRef}>
                <button onClick={signOut} className="flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500">
                    <span className="text-xs">Sign out</span>
                    <GoSignOut className="mr-2 h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
