import { cn } from '@/utils/common';
import { useHistory, useSelf, useStorage } from '@liveblocks/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { CanvasAction } from '../reducer/canvas';
import useSelectionBounds from '@/lib/hooks/useSelectionBounds';

const textPadding = 16;
const handleWidth = 10;

interface HandleConfig extends Point {
    cursor: string;
    side: Side;
}

interface SelectionBoxProps {
    dispatch_canvas: (action: CanvasAction) => void;
    isShow: boolean;
}

function SelectionBox({ dispatch_canvas, isShow }: SelectionBoxProps) {
    const selectLayerId = useSelf(me => (me.presence.selection.length === 1 ? me.presence.selection[0] : null));
    const isShowingHandle = useStorage(root => selectLayerId && root.layers.get(selectLayerId)?.type !== 'Path');
    const bounds = useSelectionBounds();
    const textRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const history = useHistory();

    const onResizeHandlePointerDown = useCallback(
        (corner: Side, initialBounds: XYHW, e: React.PointerEvent) => {
            // avoid trigger onPointerDown and onLayerPointerDown
            e.stopPropagation();
            history.pause();
            dispatch_canvas({ type: 'SET_RESIZING_MODE', payload: { initialBounds, corner } });
        },
        [dispatch_canvas, history]
    );
    const { width, height, x, y } = bounds || { width: 100, height: 100, x: 0, y: 0 };
    const labelTextConfig = {
        x: (x || 0) + (width || 100) / 2,
        y: (y || 0) + (height || 100) + 25,
        label: `${Math.round(width)} x ${Math.round(height)}`
    };

    const handleListConfig: HandleConfig[] = [
        {
            x: x - handleWidth / 2,
            y: y - handleWidth / 2,
            cursor: 'cursor-nwse-resize',
            side: 'TopLeft'
        },
        {
            x: x + width - handleWidth / 2,
            y: y - handleWidth / 2,
            cursor: 'cursor-nesw-resize',
            side: 'TopRight'
        },
        {
            x: x - handleWidth / 2,
            y: y + height - handleWidth / 2,
            cursor: 'cursor-nesw-resize',
            side: 'BottomLeft'
        },
        {
            x: x + width - handleWidth / 2,
            y: y + height - handleWidth / 2,
            cursor: 'cursor-nwse-resize',
            side: 'BottomRight'
        },
        {
            x: x + (width - handleWidth) / 2,
            y: y + height - handleWidth / 2,
            cursor: 'cursor-ns-resize',
            side: 'Bottom'
        },
        {
            x: x + width - handleWidth / 2,
            y: y + (height - handleWidth) / 2,
            cursor: 'cursor-ew-resize',
            side: 'Right'
        },
        {
            x: x - handleWidth / 2,
            y: y + (height - handleWidth) / 2,
            cursor: 'cursor-ew-resize',
            side: 'Left'
        },
        {
            x: x + (width - handleWidth) / 2,
            y: y - handleWidth / 2,
            cursor: 'cursor-ns-resize',
            side: 'Top'
        }
    ];

    useEffect(() => {
        const text = textRef.current;

        if (text) {
            const width = text.getBBox().width;

            setTextWidth(width);
        }
    }, [bounds]);

    if (!isShow) {
        return null;
    }

    return (
        <>
            <rect
                style={{ transform: `translate(${x}px, ${y}px)` }}
                width={width}
                height={height}
                className="stroke-0.25 pointer-events-none fill-transparent stroke-[#0b99ff]"
            />
            <rect
                className="fill-[#0b99ff]"
                x={x + width / 2 - (textWidth + textPadding) / 2}
                y={y + height + 10}
                width={textWidth + textPadding}
                height={20}
                rx={4}
            />
            <text
                style={{ transform: `translate(${labelTextConfig.x}px, ${labelTextConfig.y}px)` }}
                textAnchor="middle"
                className="text-0.25 pointer-events-none fill-white select-none">
                {labelTextConfig.label}
            </text>
            {isShowingHandle && (
                <>
                    {handleListConfig.map((handle, index) => (
                        <rect
                            key={index}
                            style={{
                                width: handleWidth,
                                height: handleWidth,
                                transform: `translate(${handle.x}px, ${handle.y}px)`
                            }}
                            className={cn('stroke-0.25 fill-white stroke-[#0b99ff] select-none', handle.cursor)}
                            onPointerDown={e => onResizeHandlePointerDown(handle.side, { x, y, width, height }, e)}
                        />
                    ))}
                </>
            )}
        </>
    );
}

export default memo(SelectionBox);
