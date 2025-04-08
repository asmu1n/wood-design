import IconButton from './IconButton';
import { useEffect, useRef, useState } from 'react';
import { IoEllipseOutline, IoSquareOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface ShapeSelectionButtonProps {
    isActive: boolean;
    CanvasState: CanvasType;
    setCanvasState: (state: CanvasType) => void;
}

const toolList: { shape: 'Rectangle' | 'Ellipse'; text: string }[] = [
    { shape: 'Rectangle', text: '矩形' },
    { shape: 'Ellipse', text: '圆' }
];

export default function ShapeSelectionButton({ isActive, CanvasState, setCanvasState }: ShapeSelectionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const shape = (CanvasState as { mode: 'Inserting'; layerType: 'Rectangle' | 'Ellipse' })?.layerType;

    const iconConfig = {
        Rectangle: <IoSquareOutline className="h-5 w-5 pr-1" />,
        Ellipse: <IoEllipseOutline className="h-5 w-5 pr-1" />
    };

    function handleClick(layerType: 'Rectangle' | 'Ellipse') {
        setCanvasState({ mode: 'Inserting', layerType });
    }

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

    return (
        <div className="relative flex" ref={menuRef}>
            <IconButton onClick={() => handleClick('Rectangle')} isActive={isActive}>
                {iconConfig[shape] || <IoSquareOutline className="h-5 w-5 pr-1" />}
            </IconButton>
            <button title="changeToolTip" onClick={() => setIsOpen(prev => !prev)} className={cn('ml-1', isOpen && 'rotate-180')}>
                <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                    <path d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z" fill="currentColor" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute -top-22 -right-32 mt-1 min-w-37.5 rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
                    {toolList.map(item => (
                        <button
                            key={item.shape}
                            className={cn(
                                'flex w-full items-center rounded-md p-1 text-white',
                                item.shape === shape ? 'bg-blue-500' : 'hover:text-blue-500'
                            )}
                            onClick={() => {
                                handleClick(item.shape);
                            }}>
                            <span className="w-5 text-sm">{item.shape === shape && '✓'}</span>
                            {iconConfig[item.shape]}
                            <span className="text-xs">{item.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
