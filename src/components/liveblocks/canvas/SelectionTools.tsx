import useSelectionBounds from '@/lib/hooks/useSelectionBounds';
import { BsArrowDown, BsArrowUp } from 'react-icons/bs';

// todo add handleButton event
export default function SelectionTools({ camera, visible }: { camera: Camera; visible: boolean }) {
    const selectionBound = useSelectionBounds();

    console.log(selectionBound);

    if (!selectionBound || !visible) {
        return null;
    }

    const x = (selectionBound.width / 2 + selectionBound.x) * camera.zoom + camera.x;
    const y = selectionBound.y * camera.zoom + camera.y;

    return (
        <div
            style={{ transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))` }}
            className="absolute flex min-w-[150px] flex-col rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
            <button className="flex w-full items-center justify-between rounded-md px-1 py-1 text-white hover:bg-blue-500">
                <span className="text-xs">
                    Bring to front <BsArrowDown className="me-2 h-4 w-4" />
                </span>
            </button>
            <button className="flex w-full items-center justify-between rounded-md px-1 py-1 text-white hover:bg-blue-500">
                <span className="text-xs">
                    Send to back <BsArrowUp className="me-2 h-4 w-4" />
                </span>
            </button>
        </div>
    );
}
