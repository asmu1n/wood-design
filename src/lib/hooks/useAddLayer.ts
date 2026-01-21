import type { CanvasAction } from '@/components/liveblocks/reducer/canvas';
import { penPointsToPath } from '@/utils/layer';
import { LiveObject } from '@liveblocks/client';
import { useMutation } from '@liveblocks/react';
import { nanoid } from 'nanoid';
import useLayerList from './useLayerList';
import useSelectLayer from './useSelectLayer';

const MAX_LAYERS = 100;

/**
 * Provides Liveblocks mutation handlers to create and insert canvas layers.
 *
 * @param dispatch_canvas - Callback to dispatch canvas-level actions (e.g., mode changes).
 * @returns An object with two mutation handlers:
 *  - `insertLayer`: creates and inserts a new Rectangle, Ellipse, or Text layer at a given position (no-op if the total layers reach the MAX_LAYERS limit), selects the new layer, and resets the canvas mode.
 *  - `insertPath`: converts the current `pencilDraft` from presence into a path layer if it contains more than one point and there is capacity, adds the new path layer, and clears `pencilDraft` from presence (clears `pencilDraft` regardless of creation).
 */
export default function useAddLayer(dispatch_canvas: (action: CanvasAction) => void) {
    const { addLayer } = useLayerList();
    const { selectLayer } = useSelectLayer();
    // insert layer
    const insertLayer = useMutation(
        ({ storage }, layerType: LayerType, position: Point) => {
            const liveLayers = storage.get('layers');

            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }

            const layerId = nanoid();
            let layer: LiveObject<Layer> | null = null;

            switch (layerType) {
                case 'Rectangle': {
                    layer = new LiveObject<Layer>({
                        type: 'Rectangle',
                        x: position.x,
                        y: position.y,
                        height: 100,
                        width: 100,
                        stroke: { r: 217, g: 217, b: 217 },
                        fill: { r: 217, g: 217, b: 217 },
                        opacity: 1
                    });
                    break;
                }

                case 'Ellipse': {
                    layer = new LiveObject<Layer>({
                        type: 'Ellipse',
                        x: position.x,
                        y: position.y,
                        height: 100,
                        width: 100,
                        stroke: { r: 217, g: 217, b: 217 },
                        fill: { r: 217, g: 217, b: 217 },
                        opacity: 1
                    });
                    break;
                }

                case 'Text': {
                    layer = new LiveObject<Layer>({
                        type: 'Text',
                        x: position.x,
                        y: position.y,
                        text: 'Test',
                        fontSize: 16,
                        width: 100,
                        height: 100,
                        fontFamily: 'Arial',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        textAlign: 'left',
                        stroke: { r: 217, g: 217, b: 217 },
                        fill: { r: 217, g: 217, b: 217 },
                        opacity: 1
                    });
                    break;
                }
            }

            if (layer) {
                addLayer(layer, layerId);
                selectLayer(layerId);
                dispatch_canvas({ type: 'SET_NONE_MODE' });
            }
        },
        [addLayer]
    );
    const insertPath = useMutation(
        ({ storage, self, setMyPresence }) => {
            const liveLayers = storage.get('layers');
            const { pencilDraft } = self.presence;

            if (pencilDraft && pencilDraft.length > 1 && liveLayers.size < MAX_LAYERS) {
                const layerId = nanoid();

                addLayer(new LiveObject(penPointsToPath(pencilDraft, { r: 217, g: 217, b: 217 })), layerId);
                // dispatch_canvas({ type: 'SET_PENCIL_DRAFT', payload: null });
                setMyPresence({ pencilDraft: null }, { addToHistory: true });
            } else {
                // dispatch_canvas({ type: 'SET_PENCIL_DRAFT', payload: null });
                setMyPresence({ pencilDraft: null }, { addToHistory: true });
            }
        },
        [addLayer]
    );

    return {
        insertLayer,
        insertPath
    };
}