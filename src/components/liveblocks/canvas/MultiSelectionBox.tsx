export default function MultiSelectionBox({ origin, current, isShow }: { origin: Point | null; current: Point | null; isShow: boolean }) {
    if (!origin || !current || !isShow) {
        return null;
    }

    return (
        <rect
            className="fill-blue-600/5 stroke-blue-600 stroke-[0.5px]"
            x={origin.x}
            y={origin.y}
            width={Math.abs(current.x - origin.x)}
            height={Math.abs(current.y - origin.y)}
        />
    );
}
