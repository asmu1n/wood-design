import { useMutation, useSelf } from '@liveblocks/react';
import useLayerList from './useLayerList';

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
