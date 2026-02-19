import { useMutation } from '@liveblocks/react';

export default function useSelectLayer(layerIds?: readonly string[] | null) {
    const unselectedLayers = useMutation(({ self, setMyPresence }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] }, { addToHistory: true });
        }
    }, []);
    const selectAllLayers = useMutation(
        ({ setMyPresence }) => {
            if (layerIds) {
                setMyPresence({ selection: [...layerIds] }, { addToHistory: true });
            }
        },
        [layerIds]
    );

    const selectLayer = useMutation(({ setMyPresence, self }, layerId: string, isReplace: boolean = false, addToHistory: boolean = true) => {
        const newSelection = isReplace ? [layerId] : [...self.presence.selection, layerId];

        setMyPresence({ selection: newSelection }, { addToHistory });
    }, []);

    return {
        unselectedLayers,
        selectAllLayers,
        selectLayer
    };
}
