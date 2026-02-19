import { colorToCss } from '@/utils/common';

interface EllipseLayerProps {
    id: string;
    layer: EllipseLayer;
    onSelect: (e: React.PointerEvent) => void;
}

export default function EllipseLayer({ id, layer, onSelect }: EllipseLayerProps) {
    const { x, y, stroke, fill, width, height, opacity } = layer;

    return (
        <g style={{ transform: `translate(${x}px, ${y}px)` }} className="group">
            {/* hover border */}
            <ellipse
                cx={width / 2}
                cy={height / 2}
                rx={width / 2}
                ry={height / 2}
                fill="none"
                stroke="#0b99ff"
                strokeWidth={4}
                className="pointer-events-none opacity-0 group-hover:opacity-100"
            />
            {/* main ellipse */}
            <ellipse
                onPointerDown={onSelect}
                cx={width / 2}
                cy={height / 2}
                rx={width / 2}
                ry={height / 2}
                opacity={opacity}
                fill={fill ? colorToCss(fill) : '#ccc'}
                strokeWidth={1}
                stroke={stroke ? colorToCss(stroke) : '#ccc'}
                className="select-none"
            />
        </g>
    );
}
