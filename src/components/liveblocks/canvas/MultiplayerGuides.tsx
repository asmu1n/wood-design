import { shallow, useOthersConnectionIds, useOthersMapped } from '@liveblocks/react';
import { memo } from 'react';
import Cursor from './Cursor';
import PathLayer from './PathLayer';
import { connectionIdToColor } from '@/utils/layer';
import { hexToRgb } from '@/utils/common';

/**
 * Renders a Cursor component for each connected peer.
 *
 * @returns A React fragment containing a Cursor element for every other user's connection ID.
 */
function Cursors() {
    const idList = useOthersConnectionIds();

    return (
        <>
            {idList.map(id => (
                <Cursor key={id} connectionId={id} />
            ))}
        </>
    );
}

/**
 * Renders path previews for other users' pencil drafts on the canvas.
 *
 * For each connected peer that has a `pencilDraft` in presence, a `PathLayer` is created
 * using the peer's id, draft points, and pen color. Peers without a `pencilDraft` are omitted.
 *
 * @returns A React fragment containing `PathLayer` elements for each other user's pencil draft.
 */
function Drafts() {
    const others = useOthersMapped(
        other => ({
            id: other.id,
            pencilDraft: other.presence.pencilDraft,
            penColor: other.presence.penColor || hexToRgb(connectionIdToColor(other.connectionId))
        }),
        shallow
    );

    const othersContent = others.map(([userKey, user]) => {
        if (!user.pencilDraft) {
            return null;
        }

        return (
            <PathLayer
                id={user.id}
                key={userKey}
                layer={{
                    x: 0,
                    y: 0,
                    points: user.pencilDraft,
                    fill: user.penColor,
                    type: 'Path',
                    opacity: 100
                }}
            />
        );
    });

    return <>{othersContent}</>;
}

/**
 * Render real-time collaboration guides consisting of peer cursors and live pencil drafts.
 *
 * @returns A React fragment containing peer cursor indicators and their live pencil draft layers.
 */
function MultiplayerGuides() {
    return (
        <>
            <Cursors />
            <Drafts />
        </>
    );
}

export default memo(MultiplayerGuides);