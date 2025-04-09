import { colorToCss } from '@/lib/utils';
import { useMutation } from '@liveblocks/react';
import { useState } from 'react';

interface TextLayerProps {
    id: string;
    layer: TextLayer;
}

//TODO 文本图层
export default function TextLayer({ id, layer }: TextLayerProps) {
    const { x, y, width, height, text, fontSize, fontFamily, fontWeight, lineHeight, textAlign, stroke, fill, opacity } = layer;

    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(text);

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

    function handleBlur() {
        setIsEditing(false);
        updateText(inputValue);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            setIsEditing(false);
            updateText(inputValue);
        }
    }

    function handleDoubleClick() {
        setIsEditing(true);
    }

    return (
        <g className="group" onDoubleClick={handleDoubleClick}>
            {isEditing ? (
                <foreignObject x={x} y={y} width={width || 100} height={height || 100}>
                    <input
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
                <text
                    x={x}
                    y={y + fontSize / 2}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fontWeight={fontWeight}
                    stroke={stroke ? colorToCss(stroke) : '#ccc'}
                    fill={fill ? colorToCss(fill) : '#ccc'}
                    opacity={opacity}>
                    {text}
                </text>
            )}
        </g>
    );
}
