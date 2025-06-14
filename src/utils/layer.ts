import { match } from './common';

export function resizeBounds(initialBounds: XYHW, corner: Side, point: Point): XYHW {
    const result = { ...initialBounds };

    match(corner)
        .on('Left', () => {
            result.width = initialBounds.width + (initialBounds.x - point.x);
            result.x = point.x;
        })
        .on('Right', () => {
            result.width = initialBounds.width + (point.x - initialBounds.x);
        })
        .on('Top', () => {
            result.height = initialBounds.height + (point.y - initialBounds.y);
        })
        .on('Bottom', () => {
            result.height = initialBounds.height + (initialBounds.y - point.y);
            result.y = point.y;
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
