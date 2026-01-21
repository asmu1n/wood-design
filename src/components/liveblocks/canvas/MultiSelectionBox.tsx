/**
 * Render an SVG selection rectangle spanning the area defined by two points when visible.
 *
 * @param origin - The first corner point of the selection area, or `null` to indicate no selection.
 * @param current - The opposite corner point of the selection area, or `null` to indicate no selection.
 * @param isShow - Whether the selection rectangle should be rendered.
 * @returns An SVG `<rect>` element covering the area between `origin` and `current`, or `null` if `origin` or `current` is `null` or `isShow` is `false`.
 */
export default function MultiSelectionBox({ origin, current, isShow }: { origin: Point | null; current: Point | null; isShow: boolean }) {
    if (!origin || !current || !isShow) {
        return null;
    }

    return (
        <rect
            className="fill-blue-600/5 stroke-blue-600 stroke-[0.5px]"
            x={Math.min(origin.x, current.x)}
            y={Math.min(origin.y, current.y)}
            width={Math.abs(current.x - origin.x)}
            height={Math.abs(current.y - origin.y)}
        />
    );
}