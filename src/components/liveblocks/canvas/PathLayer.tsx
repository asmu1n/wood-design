import { colorToCss } from '@/utils/common';
import { getSvgPathFromStroke } from '@/utils/layer';
import { getStroke } from 'perfect-freehand';

interface PathLayerProps {
    id: string;
    layer: Omit<PathLayer, 'width' | 'height'> & { width?: number; height?: number };
    onSelect?: (e: React.PointerEvent) => void;
}

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
