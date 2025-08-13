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
