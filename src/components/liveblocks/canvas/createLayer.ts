import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import { nanoid } from 'nanoid';

export const MAX_LAYERS = 100;

export default function createLayer(
    {
        storage,
        setMyPresence
    }: {
        storage: LiveObject<{
            roomColor: Color | null;
            layers: LiveMap<string, LiveObject<Layer>>;
            layerIds: LiveList<string>;
        }>;
        setMyPresence: (
            patch: Partial<{
                selection: string[];
                cursor: Point | null;
                penColor: Color | null;
                pencilDraft: [x: number, y: number, pressure: number][] | null;
            }>,
            options?: {
                addToHistory: boolean;
            }
        ) => void;
    },
    layerType: LayerType,
    position: Point
) {
    const liveLayers = storage.get('layers');

    if (liveLayers.size >= MAX_LAYERS) {
        return;
    }

    const liveLayerIds = storage.get('layerIds');
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
        liveLayers.set(layerId, layer);
        liveLayerIds.push(layerId);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
    }
}
