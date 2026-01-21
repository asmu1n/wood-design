import { checkPointerButton } from '@/utils/layer';
import { useMutation } from '@liveblocks/react';

interface UseDrawingProps {
    pencilDraft: DraftPoint[] | null;
    canvasState: CanvasType;
}

/**
 * Provides drawing mutations for initializing and extending a pencil path on the canvas.
 *
 * @param param0 - Hook inputs.
 * @param param0.pencilDraft - The current draft point array or `null` if no draft exists.
 * @param param0.canvasState - Current canvas state (used to determine whether continuing a path is allowed).
 * @returns An object with two mutation functions:
 *  - `startDrawing`: begins a new pencil path from a given point and pressure.
 *  - `continueDrawing`: appends points (with pressure) to an existing pencil path when the canvas is in the appropriate mode and layer and the left pointer button is used.
 */
export default function useDrawing({ pencilDraft, canvasState }: UseDrawingProps) {
    // start drawing path
    const startDrawing = useMutation(({ setMyPresence }, point: Point, pressure: number) => {
        setMyPresence({ pencilDraft: [[point.x, point.y, pressure]], penColor: { r: 217, g: 217, b: 217 } }, { addToHistory: true });
    }, []);

    // continue drawing path
    const continueDrawing = useMutation(
        ({ setMyPresence, self }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;

            if (canvasState.mode === 'Inserting' && canvasState.layerType === 'Path' && pencilDraft && checkPointerButton(e) === 'left') {
                setMyPresence({
                    cursor: point,
                    pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
                    penColor: { r: 217, g: 217, b: 217 }
                });
            }
        },
        [pencilDraft, canvasState]
    );

    return {
        startDrawing,
        continueDrawing
    };
}