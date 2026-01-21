import IconButton from './IconButton';
import { useEffect, useRef, useState } from 'react';
import { IoEllipseOutline, IoSquareOutline } from 'react-icons/io5';
import { cn } from '@/utils/common';
import { CanvasAction } from '../reducer/canvas';

interface ShapeSelectionButtonProps {
    isActive: boolean;
    canvasState: CanvasType;
    dispatch_canvas: (action: CanvasAction) => void;
}

const toolList: { shape: 'Rectangle' | 'Ellipse'; text: string }[] = [
    { shape: 'Rectangle', text: '矩形' },
    { shape: 'Ellipse', text: '圆' }
];

/**
 * Render a shape selection control that shows the current shape icon and a dropdown to choose between Rectangle and Ellipse.
 *
 * The control displays an icon button for the active insert shape and a toggle to open a small menu of shape options.
 * Selecting an option dispatches a `SET_INSERT_MODE` action with the chosen `layerType`. The dropdown closes when clicking outside the control.
 *
 * @param isActive - Whether the shape tool is currently active (affects primary button styling)
 * @param canvasState - Current canvas state; used to derive the active insert mode and its `layerType`
 * @param dispatch_canvas - Dispatcher for canvas actions; called with `{ type: 'SET_INSERT_MODE', payload: { layerType } }` when a shape is chosen
 * @returns A JSX element containing the shape selection button and dropdown menu
 */
export default function ShapeSelectionButton({ isActive, canvasState, dispatch_canvas }: ShapeSelectionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const shape = (canvasState as { mode: 'Inserting'; layerType: 'Rectangle' | 'Ellipse' })?.layerType;

    const iconConfig = {
        Rectangle: <IoSquareOutline className="h-5 w-5 pr-1" />,
        Ellipse: <IoEllipseOutline className="h-5 w-5 pr-1" />
    };

    function handleClick(layerType: 'Rectangle' | 'Ellipse') {
        dispatch_canvas({ type: 'SET_INSERT_MODE', payload: { layerType } });
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