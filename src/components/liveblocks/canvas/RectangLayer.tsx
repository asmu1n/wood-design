import { colorToCss } from '@/lib/utils';

interface RectangleLayerProps {
    id: string;
    layer: RectangleLayer;
}

export default function RectangleLayer({ id, layer }: RectangleLayerProps) {
    const { x, y, stroke, fill, cornerRadius, width, height, opacity } = layer;

    return (
        <g>
            <rect
                style={{ transform: `translate(${x}px, ${y}px)` }}
                width={width}
                height={height}
                opacity={opacity}
                fill={fill ? colorToCss(fill) : '#ccc'}
                strokeWidth={1}
                stroke={stroke ? colorToCss(stroke) : '#ccc'}
                ry={cornerRadius ?? 0}
                rx={cornerRadius ?? 0}
            />
        </g>
    );
}
