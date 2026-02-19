import { cn } from '@/utils/common';

interface IconButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    isActive?: boolean;
    disabled?: boolean;
}

export default function IconButton({ onClick, children, isActive, disabled }: IconButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex min-h-7 min-w-7 items-center justify-center rounded-md text-gray-500 duration-300 hover:scale-120 hover:enabled:text-gray-700 focus:enabled:text-gray-700 active:enabled:text-gray-900 disabled:cursor-default disabled:opacity-50',
                isActive && 'text-blue-600 hover:enabled:text-blue-600 focus:enabled:text-blue-600 active:enabled:text-blue-600'
            )}>
            {children}
        </button>
    );
}
