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
    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    for (const point of penPoints) {
        const [x, y] = point;

        if (!x || !y) {
            continue;
        }

        if (left > x) {
            left = x;
        }

        if (top > y) {
            top = y;
        }

        if (right < x) {
            right = x;
        }

        if (bottom < y) {
            bottom = y;
        }
    }

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
