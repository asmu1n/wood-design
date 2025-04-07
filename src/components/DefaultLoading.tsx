import Image from 'next/image';
import logo from '@/assets/figma-logo.svg';

export default function DefaultLoading() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-2">
            <Image src={logo} alt="logo" className="h-12.5 w-12.5 animate-bounce" />
            <h1 className="text-sm font-normal">Loading…</h1>
        </div>
    );
}
