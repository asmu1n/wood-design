import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
// import { deleteInvitation, shareRoom } from '~/app/actions/rooms';
import UserAvatar from './UserAvatar';
import { Button } from '../ui/button';

export default function ShareMenu({ roomId, othersWithAccessToRoom }: { roomId: string; othersWithAccessToRoom: User[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);

    const inviteUser = async () => {
        // const error = await shareRoom(roomId, email);

        setError(error);
    };

    return (
        <div>
            <Button onClick={() => setIsOpen(true)} className="h-fit w-fit rounded-md bg-[#0c8ce9] px-4 py-2 text-[11px] text-white">
                Share
            </Button>
            {isOpen && (
                <div className="bg-opacity-50 fixed inset-0 z-10 flex items-center justify-center bg-gray-600">
                    <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between px-3 py-2">
                            <h2 className="text-[13px] font-semibold">Share this file</h2>
                            <IoClose className="h-6 w-6 cursor-pointer" onClick={() => setIsOpen(false)} />
                        </div>
                        <div className="border-b border-gray-200" />
                        <div className="space-y-3 p-4">
                            <div className="flex h-8 items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Invite others by email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="h-full w-full rounded-md border border-gray-300 px-3 text-xs placeholder:text-gray-500 focus:border-black focus:outline-none"
                                />
                                <button onClick={inviteUser} className="h-full rounded-md bg-[#0c8ce9] px-4 py-2 text-[11px] text-white">
                                    Share
                                </button>
                            </div>
                            {error && <p className="text-[11px] text-red-500">{error}</p>}
                            <p className="text-[11px] text-gray-500">Who has access</p>
                            <ul>
                                {othersWithAccessToRoom.map((user, index) => (
                                    <li className="flex items-center justify-between py-1" key={index}>
                                        <div className="flex items-center space-x-2">
                                            <UserAvatar name={user.email ?? 'Anonymous'} className="h-6 w-6" />
                                            <span className="text-[11px]">{user.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[11px] text-gray-500">Full access</span>
                                            {/* <IoClose
                                                onClick={() => deleteInvitation(roomId, user.email)}
                                                className="h-4 w-4 cursor-pointer text-gray-500"
                                            /> */}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
