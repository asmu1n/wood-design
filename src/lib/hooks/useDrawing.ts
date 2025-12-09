import { checkPointerButton } from '@/utils/layer';
import { useMutation } from '@liveblocks/react';

interface UseDrawingProps {
    pencilDraft: DraftPoint[] | null;
    canvasState: CanvasType;
}

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
