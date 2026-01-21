import { useEffect, useRef, useState } from 'react';
import IconButton from './IconButton';
import { BiPlus, BiPointer } from 'react-icons/bi';
import { RiHand } from 'react-icons/ri';
import { cn } from '@/utils/common';
import { CanvasAction } from '../reducer/canvas';

interface SelectionButtonProps {
    isActive: boolean;
    canvasState: CanvasType;
    dispatch_canvas: (action: CanvasAction) => void;
}

/**
 * Renders a tool-selection control that displays the current canvas mode, provides a toggleable tool menu, and dispatches actions to change modes.
 *
 * @param isActive - Whether the main action button appears active.
 * @param canvasState - The current canvas state; its `mode` field determines the selected tool.
 * @param dispatch_canvas - Function to dispatch canvas-related actions (e.g., set none, dragging, or insert modes).
 * @returns The JSX element containing the main action button, toggle button, and dropdown tool list.
 */
export default function SelectionButton({ isActive, canvasState, dispatch_canvas }: SelectionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const canvasMode = canvasState.mode;

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
        Dragging: <RiHand className="h-5 w-5 pr-1" />,
        Resizing: <BiPointer className="h-5 w-5 pr-1" />,
        Translating: <BiPointer className="h-5 w-5 pr-1" />
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
            dispatch_canvas({ type: 'SET_NONE_MODE' });
        } else if (mode === 'Dragging') {
            dispatch_canvas({ type: 'SET_DRAGGING_MODE', payload: { disabled: true } });
        } else if (mode === 'Inserting') {
            dispatch_canvas({ type: 'SET_INSERT_MODE', payload: { layerType: 'Rectangle' } });
        }

        setIsOpen(false);
    }

    return (
        <div className="relative flex" ref={menuRef}>
            <IconButton onClick={() => handleClick('None')} isActive={isActive}>
                {iconConfig[canvasMode] || <BiPointer className="h-5 w-5 pr-1" />}
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