import { colorToCss, getSvgPathFromStroke } from '@/lib/utils';
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
        <path
            onPointerDown={onSelect}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            d={path}
            fill={colorToCss(fill)}
            stroke={colorToCss(stroke) || '#ccc'}
            strokeWidth={1}
            opacity={opacity}
        />
    );
}
