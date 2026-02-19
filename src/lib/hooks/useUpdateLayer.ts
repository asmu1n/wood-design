import { resizeBounds } from '@/utils/layer';
import { useMutation } from '@liveblocks/react';

interface UseSelectedLayerProps {
    canvasState: CanvasType;
}

export default function useUpdateLayer({ canvasState }: UseSelectedLayerProps) {
    // translate selected layer
    const translateSelectedLayer = useMutation(
        ({ storage, self }, offset: { x: number; y: number }) => {
            if (canvasState.mode !== 'Translating') {
                return;
            }

            for (const selectedId of self.presence.selection) {
                const selectedLayer = storage.get('layers').get(selectedId);

                if (selectedLayer) {
                    selectedLayer.update({ x: selectedLayer.get('x') + offset.x, y: selectedLayer.get('y') + offset.y });
                }
            }
        },
        [canvasState]
    );

    // select layer to resize
    const resizeSelectedLayer = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== 'Resizing') {
                return;
            }

            const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);
            // update layers to set the new  width and height of the layer
            const selectedLayer = storage.get('layers').get(self.presence.selection[0]);

            if (selectedLayer) {
                selectedLayer.update(bounds);
            }
        },
        [canvasState]
    );

    return {
        translateSelectedLayer,
        resizeSelectedLayer
    };
}
