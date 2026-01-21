import { useMutation, useSelf } from '@liveblocks/react';
import useLayerList from './useLayerList';

/**
 * Provides a mutation that deletes all layers currently selected in presence and then clears the selection.
 *
 * @returns A mutation object that, when executed, calls the layer removal for each id in the current presence selection and then sets `presence.selection` to an empty array with `addToHistory: true`.
 */
export default function useDeleteLayer() {
    const { removeLayer } = useLayerList();
    const selection = useSelf(self => self.presence.selection);

    return useMutation(
        ({ setMyPresence }) => {
            for (const selectedId of selection || []) {
                removeLayer(selectedId);
            }

            setMyPresence({ selection: [] }, { addToHistory: true });
        },
        [selection, removeLayer]
    );
}