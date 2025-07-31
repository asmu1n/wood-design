import { colorToCss } from '@/utils/common';

interface RectangleLayerProps {
    id: string;
    layer: RectangleLayer;
    onSelect: (e: React.PointerEvent) => void;
}

export default function RectangleLayer({ id, layer, onSelect }: RectangleLayerProps) {
    const { x, y, stroke, fill, cornerRadius, width, height, opacity } = layer;

    return (
        <g style={{ transform: `translate(${x}px, ${y}px)` }} className="group">
            {/* hover border */}
            <rect
                width={width}
                height={height}
                fill="none"
                stroke="#0b99ff"
                strokeWidth={4}
                className="pointer-events-none opacity-0 group-hover:opacity-100"
            />
            {/* main rect */}
            <rect
                onPointerDown={onSelect}
                width={width}
                height={height}
                opacity={opacity}
                fill={fill ? colorToCss(fill) : '#ccc'}
                strokeWidth={1}
                stroke={stroke ? colorToCss(stroke) : '#ccc'}
                ry={cornerRadius ?? 0}
                rx={cornerRadius ?? 0}
                className="select-none"
            />
        </g>
    );
}
