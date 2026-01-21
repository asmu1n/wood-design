'use server';

import RoomsView from '@/components/dashboard/RoomView';
import UserMenu from '@/components/dashboard/UserMenu';
import { getAllowedRoomByUserId, getRoomList } from '@/db/services/room';
import { selectUserById } from '@/db/services/users';
import { auth } from '@/lib/config/auth';
import Link from 'next/link';
import { cn } from '@/utils/common';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import CreateRoom from '@/components/dashboard/CreateRoom';
import { getTranslations } from 'next-intl/server';

interface QueryParams {
    pageIndex?: string | number;
    visibleMode?: 'ALL' | 'OWNED';
}

/**
 * Render the dashboard page displaying the user's menu, a room creation form, a list of rooms, and pagination controls.
 *
 * @param searchParams - A promise that resolves to query parameters. Expected keys: `pageIndex` (defaults to 1) and `visibleMode` (`'ALL'` or `'OWNED'`, defaults to `'ALL'`); these control pagination and which rooms are shown.
 * @returns A React element representing the dashboard, or `null` when there is no authenticated user or the user cannot be found.
 */
export default async function Page({ searchParams }: { searchParams: Promise<QueryParams> }) {
    const session = await auth();
    const { pageIndex: rawPageIndex = 1, visibleMode = 'ALL' } = await searchParams;
    const t = await getTranslations();

    const pageIndex = Number(rawPageIndex);

    if (!session?.user?.id) {
        return null;
    }

    const user = await selectUserById(session.user.id);

    if (!user) {
        return null;
    }

    const { data: rooms, total } =
        visibleMode === 'ALL' ? await getAllowedRoomByUserId({ userId: user.id, pageIndex }) : await getRoomList({ ownerUserId: user.id, pageIndex });

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="flex h-screen w-full">
            <div className="flex h-screen min-w-[264px] flex-col border-r border-gray-200 bg-white p-2">
                <UserMenu email={user.email} />
            </div>
            <div className="flex h-screen w-full flex-col">
                <div className="flex min-h-[50px] items-center justify-between border-b border-gray-200 bg-white pr-8 pl-8">
                    <div className="flex items-center gap-8">
                        <div className="flex gap-1">
                            <Link
                                href={`?visibleMode=ALL&pageIndex=1`}
                                className={cn(
                                    'rounded-md px-3 py-1 text-[12px] font-medium transition-colors',
                                    visibleMode === 'ALL' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'
                                )}>
                                {t('dashboard.all')}
                            </Link>
                            <Link
                                href={`?visibleMode=OWNED&pageIndex=1`}
                                className={cn(
                                    'rounded-md px-3 py-1 text-[12px] font-medium transition-colors',
                                    visibleMode === 'OWNED' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'
                                )}>
                                {t('dashboard.owned')}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex h-full flex-col gap-10 overflow-y-auto p-8">
                    <CreateRoom userId={user.id} />

                    <RoomsView userId={user.id} displayRooms={rooms} />

                    {totalPages > 1 && (
                        <div className="flex justify-center py-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={`?visibleMode=${visibleMode}&pageIndex=${pageIndex - 1}`}
                                            className={pageIndex <= 1 ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                        if (page === 1 || page === totalPages || (page >= pageIndex - 1 && page <= pageIndex + 1)) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href={`?visibleMode=${visibleMode}&pageIndex=${page}`}
                                                        isActive={pageIndex === page}>
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        } else if (page === pageIndex - 2 || page === pageIndex + 2) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        return null;
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={`?visibleMode=${visibleMode}&pageIndex=${pageIndex + 1}`}
                                            className={pageIndex >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}