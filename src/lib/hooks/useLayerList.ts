import type { LiveObject } from '@liveblocks/client';
import { useMutation, useStorage } from '@liveblocks/react';

/**
 * Provides accessors and mutations for managing layer identifiers and their corresponding layer objects in Liveblocks storage.
 *
 * @returns An object containing:
 * - `layerIds` — the live list of layer identifiers from storage.
 * - `layers` — the live map of layerId to `Layer` live objects.
 * - `addLayer` — a mutation that appends a layerId to `layerIds` and stores the associated `Layer` under `layers`.
 * - `removeLayer` — a mutation that removes a layerId from `layerIds` (if present) and deletes its entry from `layers`.
 * - `updateLayerId` — a mutation that reorders the provided selection of layerIds; when `isUp` is `true` the selected IDs are moved toward the end, otherwise toward the start, preserving their relative order.
 */
export default function useLayerList() {
    const layerIds = useStorage(root => root.layerIds);
    const layers = useStorage(root => root.layers);
    const addLayer = useMutation(({ storage }, layer: LiveObject<Layer>, layerId: string) => {
        storage.get('layerIds').push(layerId);

        storage.get('layers').set(layerId, layer);
    }, []);
    const removeLayer = useMutation(({ storage }, layerId: string) => {
        const liveLayerIds = storage.get('layerIds');
        const index = liveLayerIds.indexOf(layerId);

        if (index !== -1) {
            liveLayerIds.delete(index);
        }

        storage.get('layers').delete(layerId);
    }, []);
    const updateLayerId = useMutation(({ storage }, selection: string[], isUp: boolean) => {
        const liveLayerIds = storage.get('layerIds');
        const indices: number[] = [];

        const arr = liveLayerIds.toArray();

        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];

            if (element !== undefined && selection?.includes(element)) {
                indices.push(i);
            }
        }

        if (isUp) {
            for (let i = indices.length - 1; i >= 0; i--) {
                const element = indices[i];

                if (element !== undefined) {
                    liveLayerIds.move(element, arr.length - 1 - (indices.length - 1 - i));
                }
            }
        } else {
            for (let i = 0; i < indices.length; i++) {
                const element = indices[i];

                if (element !== undefined) {
                    liveLayerIds.move(element, i);
                }
            }
        }
    }, []);

    return {
        layerIds,
        layers,
        addLayer,
        removeLayer,
        updateLayerId
    };
}