import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import UserAvatar from './UserAvatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Dialog from '../Dialog';
import { deleteInvitationAction, shareRoomAction } from '@/actions/roomPermission';
import { useUserInfo } from '@/store/userInfo';
import { attempt } from '@/utils/common';
import { useRouter } from 'next/navigation';

interface ShareMenuProps {
    roomId: string;

    othersWithAccessToRoom: User[];
}

interface UserAccessInfo {
    userId: string;
    email: string;

    permission: 'ALL' | 'ONLY_READ';

    errorMessage?: string;
}

export default function ShareMenu({ roomId, othersWithAccessToRoom }: ShareMenuProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const router = useRouter();
    const { id: userId } = useUserInfo();
    const [userAccessInfoList, setUserAccessInfoList] = useState<UserAccessInfo[]>(
        othersWithAccessToRoom.map(user => ({
            userId: user.id,
            email: user.email,
            permission: 'ALL'
        }))
    );

    async function inviteUser() {
        const [error] = await attempt(() => shareRoomAction({ roomId, processedUserEmail: email, actionUserId: userId }));

        if (error) {
            setError(error ? error.message : 'Something went wrong');
        } else {
            router.refresh();
        }
    }

    async function deleteInvitation(email: string) {
        const [error] = await attempt(() => deleteInvitationAction({ roomId, processedUserEmail: email, actionUserId: userId }));

        if (error) {
            const targetUserInfo = userAccessInfoList.find(user => user.email === email);

            setUserAccessInfoList(prev => {
                if (targetUserInfo) {
                    return prev.map(user => {
                        if (user.email === email) {
                            return {
                                ...user,
                                errorMessage: error.message
                            };
                        }

                        return user;
                    });
                }

                return prev;
            });
        } else {
            router.refresh();
        }
    }

    return (
        <Dialog trigger={<Button>Share</Button>} title="Share this file">
            <div className="flex h-8 items-center space-x-2">
                <Input type="email" placeholder="Invite others by email" value={email} onChange={e => setEmail(e.target.value)} />
                <Button onClick={inviteUser}>Share</Button>
            </div>
            {error && <p className="px-2 text-xs text-red-500">{error}</p>}
            <p className="text-xs text-gray-500">Who has access</p>
            <ul>
                {userAccessInfoList.map((user, index) => (
                    <li className="flex items-center justify-between py-1" key={index}>
                        <div className="flex items-center space-x-2">
                            <UserAvatar name={user.email ?? 'Anonymous'} className="h-6 w-6" />
                            <span className="text-xs">{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            {user?.errorMessage && <p className="px-2 text-xs text-red-500">{user.errorMessage}</p>}
                            <span className="text-xs text-gray-500">Full access</span>
                            <IoClose onClick={() => deleteInvitation(user.email)} className="h-4 w-4 cursor-pointer text-gray-500" />
                        </div>
                    </li>
                ))}
            </ul>
        </Dialog>
    );
}
