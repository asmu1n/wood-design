import { match } from './common';

/**
 * Compute a new bounding box by resizing `initialBounds` from the specified `corner` to the given `point`.
 *
 * @param initialBounds - The starting rectangle expressed as { x, y, width, height }
 * @param corner - The corner or edge being dragged (e.g., 'Left', 'TopRight')
 * @param point - The target point to which the corner/edge is moved
 * @returns A new bounding box `{ x, y, width, height }` updated for the resize. Width and height are clamped to be at least 1
 */
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

/**
 * Convert a pointer event's client coordinates into canvas coordinates using the camera's translation and zoom.
 *
 * @param e - The pointer event containing clientX and clientY
 * @param camera - Camera state with `x` and `y` translation and `zoom` scale
 * @returns A point in canvas space with `x` and `y` rounded to the nearest integer
 */
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

/**
 * Convert a sequence of pen points into a positioned PathLayer with normalized points and bounding box.
 *
 * Computes the axis-aligned bounding box of all valid pen points (ignoring points with missing x or y),
 * normalizes each point's coordinates to the top-left of that box, and produces a PathLayer using `color`
 * for both stroke and fill with opacity 1.
 *
 * @param penPoints - Array of `[x, y, pressure?]` tuples representing pen sample positions; entries missing `x` or `y` are ignored when computing the bounds.
 * @param color - Color used for the path's `stroke` and `fill`.
 * @returns A PathLayer whose `x`/`y` are the bounding box origin, `width`/`height` are the box dimensions, and `points` are the original pen points translated to the box-local coordinates (pressure preserved).
 */
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

/**
 * Map a React PointerEvent's buttons value to a human-readable mouse button label.
 *
 * @param e - The pointer event to inspect
 * @returns `'left'` if the left button is indicated, `'right'` if the right button is indicated, `'middle'` if the middle button is indicated, `'unknown'` otherwise
 */
export function checkPointerButton(e: React.PointerEvent) {
    const config: Record<string, string> = {
        1: 'left',
        2: 'right',
        3: 'middle'
    };
    const button = String(e.buttons);

    return config[button] || 'unknown';
}

/**
 * Create an SVG path data string from a polyline stroke.
 *
 * @param stroke - Array of `[x, y]` points defining the stroke coordinates
 * @returns SVG path data string; empty string if `stroke` is empty
 */
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

/**
 * Finds layer IDs whose axis-aligned rectangles intersect the rectangle defined by two points.
 *
 * @param layerIdList - Ordered list of layer IDs to test
 * @param layerList - Map of layer ID to Layer containing `x`, `y`, `width`, and `height`
 * @param origin - One corner of the selection rectangle
 * @param current - Opposite corner of the selection rectangle
 * @returns Array of layer IDs from `layerIdList` whose bounding rectangles overlap the selection rectangle
 */
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

/**
 * Map a numeric connection identifier to a color from the predefined palette.
 *
 * @param connectionId - Numeric identifier used to select a color
 * @returns A color string from the predefined palette corresponding to `connectionId`
 */
export function connectionIdToColor(connectionId: number): string {
    return COLORS[connectionId % COLORS.length]!;
}