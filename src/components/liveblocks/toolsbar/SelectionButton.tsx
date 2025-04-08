import { useEffect, useRef, useState } from 'react';
import IconButton from './IconButton';
import { BiPlus, BiPointer } from 'react-icons/bi';
import { RiHand } from 'react-icons/ri';
import { cn } from '@/lib/utils';

interface SelectionButtonProps {
    isActive: boolean;
    canvasMode: CanvasMode;
    setCanvasState: (state: CanvasType) => void;
}

export default function SelectionButton({ isActive, canvasMode, setCanvasState }: SelectionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const iconConfig = {
        None: <BiPointer className="h-5 w-5 pr-1" />,
        Inserting: <BiPlus className="h-5 w-5 pr-1" />,
        Dragging: <RiHand className="h-5 w-5 pr-1" />
    };

    const toolList: { text: string; mode: CanvasMode }[] = [
        {
            text: '移动',
            mode: 'None'
        },
        {
            text: '插入',
            mode: 'Inserting'
        },
        {
            text: '拖动',
            mode: 'Dragging'
        }
    ];

    function handleClick(mode: CanvasMode) {
        if (mode === 'None') {
            setCanvasState({ mode });
        } else if (mode === 'Dragging') {
            setCanvasState({ mode, origin: null });
        }

        setIsOpen(false);
    }

    return (
        <div className="relative flex" ref={menuRef}>
            <IconButton onClick={() => handleClick('None')} isActive={isActive}>
                {iconConfig[canvasMode] || <BiPointer className="h-5 w-5" />}
            </IconButton>
            <button title="changeToolTip" onClick={() => setIsOpen(prev => !prev)} className={cn('ml-1', isOpen && 'rotate-180')}>
                <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                    <path d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z" fill="currentColor" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute -top-30 -right-32 mt-1 min-w-37.5 rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
                    {toolList.map(item => (
                        <button
                            key={item.mode}
                            className={cn(
                                'flex w-full items-center rounded-md p-1 text-white',
                                item.mode === canvasMode ? 'bg-blue-500' : 'hover:text-blue-500'
                            )}
                            onClick={() => {
                                handleClick(item.mode);
                            }}>
                            <span className="w-5 text-sm">{item.mode === canvasMode && '✓'}</span>
                            {iconConfig[item.mode]}
                            <span className="text-xs">{item.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
