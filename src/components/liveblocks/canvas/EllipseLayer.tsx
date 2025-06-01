import { colorToCss } from '@/lib/utils';

interface EllipseLayerProps {
    id: string;
    layer: EllipseLayer;
    onSelect: (e: React.PointerEvent) => void;
}

export default function EllipseLayer({ id, layer, onSelect }: EllipseLayerProps) {
    const { x, y, stroke, fill, width, height, opacity } = layer;

    return (
        <g>
            <ellipse
                onPointerDown={onSelect}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                cx={width / 2}
                cy={height / 2}
                rx={width / 2}
                ry={height / 2}
                opacity={opacity}
                fill={fill ? colorToCss(fill) : '#ccc'}
                strokeWidth={1}
                stroke={stroke ? colorToCss(stroke) : '#ccc'}
            />
        </g>
    );
}
