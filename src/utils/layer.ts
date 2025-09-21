import { match } from './common';

export function resizeBounds(initialBounds: XYHW, corner: Side, point: Point): XYHW {
    const result = { ...initialBounds };

    match(corner)
        .on('Left', () => {
            const newWidth = initialBounds.width + (initialBounds.x - point.x);

            result.width = Math.max(newWidth, 1);
            result.x = point.x;
        })
        .on('Right', () => {
            result.width = Math.max(point.x - initialBounds.x, 1);
        })
        .on('Top', () => {
            const newHeight = initialBounds.height + (initialBounds.y - point.y);

            result.height = Math.max(newHeight, 1);
            result.y = point.y;
        })
        .on('Bottom', () => {
            result.height = Math.max(point.y - initialBounds.y, 1);
        })
        .on('TopLeft', () => {
            const newWidth = initialBounds.width + (initialBounds.x - point.x);
            const newHeight = initialBounds.height + (initialBounds.y - point.y);

            result.width = Math.max(newWidth, 1);
            result.x = point.x;
            result.height = Math.max(newHeight, 1);
            result.y = point.y;
        })
        .on('TopRight', () => {
            const newWidth = point.x - initialBounds.x;
            const newHeight = initialBounds.height + (initialBounds.y - point.y);

            result.width = Math.max(newWidth, 1);
            result.height = Math.max(newHeight, 1);
            result.y = point.y;
        })
        .on('BottomLeft', () => {
            const newHeight = point.y - initialBounds.y;

            result.x = point.x;
            result.height = Math.max(newHeight, 1);
        })
        .on('BottomRight', () => {
            const newWidth = point.x - initialBounds.x;
            const newHeight = point.y - initialBounds.y;

            result.width = Math.max(newWidth, 1);
            result.height = Math.max(newHeight, 1);
        });

    return result;
}

export function pointerEventToCanvasPoint(e: React.PointerEvent, camera: Camera): Point {
    // 需要考虑到缩放和位移
    const { clientX, clientY } = e;
    const { x, y, zoom } = camera;

    // 考虑缩放的影响
    return {
        x: Math.round((clientX - x) / zoom),
        y: Math.round((clientY - y) / zoom)
    };
}

export function penPointsToPath(penPoints: DraftPoint[], color: Color): PathLayer {
    const { left, top, right, bottom } = penPoints.reduce(
        (acc, [x, y]) => {
            if (!x || !y) {
                return acc;
            }

            return {
                left: Math.min(acc.left, x),
                top: Math.min(acc.top, y),
                right: Math.max(acc.right, x),
                bottom: Math.max(acc.bottom, y)
            };
        },
        { left: Number.POSITIVE_INFINITY, top: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY }
    );

    return {
        type: 'Path',
        points: penPoints.map(([x, y, pressure]) => [x - left, y - top, pressure]),
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        stroke: color,
        fill: color,
        opacity: 1
    };
}

export function checkPointerButton(e: React.PointerEvent) {
    const config: Record<string, string> = {
        1: 'left',
        2: 'right',
        3: 'middle'
    };
    const button = String(e.buttons);

    return config[button] || 'unknown';
}

export function getSvgPathFromStroke(stroke: number[][]): string {
    if (!stroke.length) return '';

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];

            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);

            return acc;
        },
        ['M', ...stroke[0], 'Q']
    );

    d.push('Z');

    return d.join(' ');
}

export function findIntersectionLayerListWithRectangle(
    layerIdList: readonly string[],
    layerList: ReadonlyMap<string, Layer>,
    origin: Point,
    current: Point
) {
    const rect = {
        minX: Math.min(origin.x, current.x),
        minY: Math.min(origin.y, current.y),
        maxX: Math.max(origin.x, current.x),
        maxY: Math.max(origin.y, current.y)
    };
    const idList = layerIdList.reduce((acc, cur) => {
        const layer = layerList.get(cur);

        if (layer) {
            const { x, y, width, height } = layer;

            if (x < rect.maxX && x + width > rect.minX && y < rect.maxY && y + height > rect.minY) {
                acc.push(cur);
            }
        }

        return acc;
    }, [] as string[]);

    return idList;
}

const COLORS = ['#DC2626', '#D97706', '#059669', '#7C3AED', '#DB2777'];

export function connectionIdToColor(connectionId: number): string {
    return COLORS[connectionId % COLORS.length]!;
}
