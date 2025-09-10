import type { CanvasAction } from '@/components/liveblocks/reducer/canvas';
import { penPointsToPath } from '@/utils/layer';
import { LiveObject } from '@liveblocks/client';
import { useMutation } from '@liveblocks/react';
import { nanoid } from 'nanoid';
import useLayerList from './useLayerList';

const MAX_LAYERS = 100;

export default function useAddLayer(dispatch_canvas: (action: CanvasAction) => void) {
    const { addLayer } = useLayerList();
    // insert layer
    const insertLayer = useMutation(
        ({ storage, setMyPresence }, layerType: LayerType, position: Point) => {
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
                setMyPresence({ selection: [layerId] }, { addToHistory: true });
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
