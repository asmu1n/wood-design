import { colorToCss } from '@/utils/common';
import { useMutation } from '@liveblocks/react';
import { useEffect, useRef, useState } from 'react';

interface TextLayerProps {
    id: string;
    layer: TextLayer;
    onSelect: (e: React.PointerEvent) => void;
}

/**
 * Renders a text layer that toggles between a styled SVG text display and an inline editable input.
 *
 * When edited, committed changes are persisted to collaborative storage and the user's selection is recorded.
 *
 * @param id - Unique identifier of the layer
 * @param layer - Data for the text layer (position, dimensions, content, and styling)
 * @param onSelect - Pointer event handler invoked when the text is selected
 */
export default function TextLayer({ id, layer, onSelect }: TextLayerProps) {
    const { x, y, width, height, text, fontSize, fontFamily, fontWeight, lineHeight, textAlign, stroke, fill, opacity } = layer;

    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(text);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateText = useMutation(
        ({ storage, setMyPresence }, newText: string) => {
            const liveLayers = storage.get('layers');
            const layer = liveLayers.get(id);

            if (layer) {
                layer.update({ text: newText });
                setMyPresence({ selection: [id] }, { addToHistory: true });
            }
        },
        [id]
    );

    /**
     * Exit edit mode and persist the current input value to the layer.
     *
     * Stops local editing and updates the layer's text with the current `inputValue`.
     */
    function handleBlur() {
        setIsEditing(false);
        updateText(inputValue);
    }

    /**
     * Commits the current input value and exits editing mode when the Enter key is pressed.
     *
     * @param e - Keyboard event to check for the Enter key
     */
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            setIsEditing(false);
            updateText(inputValue);
        }
    }

    /**
     * Enter edit mode for the text layer.
     */
    function handleDoubleClick() {
        setIsEditing(true);
    }

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <g className="group" onDoubleClick={handleDoubleClick}>
            {isEditing ? (
                <foreignObject x={x} y={y} width={width || 100} height={height || 100}>
                    <input
                        placeholder={text}
                        ref={inputRef}
                        style={{
                            fontSize: fontSize + 'px',
                            color: colorToCss(fill) || '#ccc'
                        }}
                        className="border-0 outline-0"
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                    />
                </foreignObject>
            ) : (
                <>
                    <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill="none"
                        stroke="#0b99ff"
                        strokeWidth={4}
                        className="pointer-events-none opacity-0 group-hover:opacity-100"
                    />
                    <text
                        onPointerDown={onSelect}
                        x={x}
                        y={y + fontSize}
                        fontSize={fontSize}
                        fontFamily={fontFamily}
                        fontWeight={fontWeight}
                        stroke={stroke ? colorToCss(stroke) : '#ccc'}
                        fill={fill ? colorToCss(fill) : '#ccc'}
                        opacity={opacity}>
                        {text}
                    </text>
                </>
            )}
        </g>
    );
}