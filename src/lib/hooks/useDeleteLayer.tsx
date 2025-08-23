import { useMutation, useSelf } from '@liveblocks/react';

export default function useDeleteLayer() {
    const selection = useSelf(self => self.presence.selection);

    return useMutation(
        ({ storage, setMyPresence }) => {
            const liveLayers = storage.get('layers');

            for (const selectedId of selection || []) {
                liveLayers.delete(selectedId);
            }

            setMyPresence({ selection: [] }, { addToHistory: true });
        },
        [selection]
    );
}
