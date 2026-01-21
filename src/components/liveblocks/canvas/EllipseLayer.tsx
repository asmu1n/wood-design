import { colorToCss } from '@/utils/common';

interface EllipseLayerProps {
    id: string;
    layer: EllipseLayer;
    onSelect: (e: React.PointerEvent) => void;
}

/**
 * Render an SVG ellipse layer positioned at the layer's coordinates with a hover border and pointer interaction.
 *
 * Renders a <g> translated to the layer's (x, y) that contains a non-interactive hover border ellipse and the main
 * ellipse which uses the layer's width, height, opacity, fill, and stroke. The main ellipse calls `onSelect` on pointer down.
 *
 * @param id - Unique identifier for this layer instance
 * @param layer - Layer data containing geometry and style (x, y, width, height, opacity, fill, stroke)
 * @param onSelect - Pointer event handler invoked when the main ellipse receives a pointer down event
 * @returns An SVG <g> element containing a hover border ellipse and the main interactive ellipse
 */
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