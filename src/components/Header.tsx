'use client';

import { cn } from '@/utils/common';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Session } from 'next-auth';
import { Button } from './ui/button';
import { signOut } from '@/db/services/auth';
import { useTranslations } from 'next-intl';

export default function Header({ session }: { session?: Session }) {
    const pathname = usePathname();
    const t = useTranslations();
    const navBarList = [];

    return (
        <header className="my-10 flex justify-between gap-5">
            <Link href="/">
                <Image src="/icons/logo.svg" style={{ width: 'auto', height: 'auto' }} width={40} height={40} alt="logo" />
            </Link>
            <ul className="flex flex-row items-center gap-8">
                {navBarList.map(item => (
                    <li key={item.href} className="cursor-pointer text-base capitalize">
                        <Link
                            href={item.href}
                            className={cn('cursor-pointer text-base capitalize', pathname === item.href ? 'text-light-200' : 'text-light-100')}>
                            {item.label}
                        </Link>
                    </li>
                ))}
                <li>
                    <Link href="/myProfile">
                        <Avatar>
                            <AvatarImage />
                            <AvatarFallback className="bg-amber-100">
                                {session?.user?.name?.slice(0, 2).toUpperCase() || t('auth.tourist')}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </li>
                <li>
                    <form action={signOut}>
                        <Button>{t('auth.logout')}</Button>
                    </form>
                </li>
            </ul>
        </header>
    );
}
