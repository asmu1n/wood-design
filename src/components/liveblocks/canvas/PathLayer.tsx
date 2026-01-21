import { colorToCss } from '@/utils/common';
import { getSvgPathFromStroke } from '@/utils/layer';
import { getStroke } from 'perfect-freehand';

interface PathLayerProps {
    id: string;
    layer: Omit<PathLayer, 'width' | 'height' | 'stroke'> & { width?: number; height?: number; stroke?: Color };
    onSelect?: (e: React.PointerEvent) => void;
}

/**
 * Renders an SVG group for a freehand path, including a visible hover border and the main selectable path.
 *
 * @param id - Unique identifier for the layer
 * @param layer - Layer data containing position (`x`, `y`), stroke color, fill color, opacity, and `points` used to compute the path
 * @param onSelect - Optional pointer event handler invoked when the main path is pressed
 * @returns An SVG `<g>` element containing the hover border and the rendered path
 */
export default function PathLayer({ id, layer, onSelect }: PathLayerProps) {
    const { x, y, stroke, fill, opacity, points } = layer;
    const path = getSvgPathFromStroke(
        getStroke(points, {
            size: 16,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5
        })
    );

    return (
        <g style={{ transform: `translate(${x}px, ${y}px)` }} className="group">
            {/* hover border */}
            <path
                d={path}
                fill="none"
                stroke="#0b99ff"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none opacity-0 group-hover:opacity-100"
            />
            {/* main path */}
            <path
                onPointerDown={onSelect}
                d={path}
                fill={colorToCss(fill)}
                stroke={colorToCss(stroke) || '#ccc'}
                strokeWidth={1}
                opacity={opacity}
                className="select-none"
            />
        </g>
    );
}