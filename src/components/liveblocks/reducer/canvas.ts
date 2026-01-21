export type CanvasAction =
    | { type: 'SET_NONE_MODE' }
    // | { type: 'SET_PENCIL_MODE' }
    | { type: 'SET_INSERT_MODE'; payload: { layerType: LayerType } }
    | {
          type: 'SET_DRAGGING_MODE';
          payload: { disabled: boolean };
      }
    | { type: 'SET_RESIZING_MODE'; payload: { initialBounds: XYHW; corner: Side } }
    | {
          type: 'SET_TRANSITION_MODE';
      }
    | {
          type: 'SET_PRESSING_MODE';
          payload: { origin: Point };
      }
    | {
          type: 'SET_SELECTION_NET_MODE';
          payload: { origin: Point; current?: Point };
      }
    | {
          type: 'SET_DETAIL_MODE';
      };
// | { type: 'SET_PENCIL_DRAFT'; payload: [number, number, number][] | null }
// | { type: 'SET_SELECTION'; payload: string[] }
// | { type: 'SET_CURSOR'; payload: Point };

/**
 * Apply a canvas action to the current canvas state and produce the new state.
 *
 * @param state - The current canvas state to update
 * @param action - The action describing the state transition to apply
 * @returns The updated canvas state; if the action type is unrecognized, the original `state` is returned unchanged
 */
export function canvasReducer(state: CanvasType, action: CanvasAction): CanvasType {
    switch (action.type) {
        case 'SET_NONE_MODE':
            return { mode: 'None' };

        //? trigger by select tool
        case 'SET_INSERT_MODE':
            // insert a new layer
            return {
                mode: 'Inserting',
                layerType: action.payload.layerType
            };

        //? trigger by select tool and change disabled by pointDown on blank
        case 'SET_DRAGGING_MODE':
            // start drag camera viewBox
            return {
                mode: 'Dragging',
                disabled: action.payload.disabled
            };

        //? trigger by selection box
        case 'SET_RESIZING_MODE':
            // start to resize a layer, when pointer up will finish and change to translating
            return {
                mode: 'Resizing',
                initialBounds: action.payload.initialBounds,
                corner: action.payload.corner
            };

        //? trigger by pointerDown on layer
        case 'SET_TRANSITION_MODE':
            // move selected layer
            return {
                mode: 'Translating'
            };

        case 'SET_PRESSING_MODE':
            // start to press a layer
            return {
                mode: 'Pressing',
                origin: action.payload.origin
            };
        case 'SET_SELECTION_NET_MODE':
            // start to select a layer
            return {
                mode: 'SelectionNet',
                origin: action.payload.origin,
                current: action.payload.current
            };
        case 'SET_DETAIL_MODE':
            return {
                mode: 'Detailing'
            };
        // case 'SET_PENCIL_DRAFT':
        // case 'SET_SELECTION':
        // case 'SET_CURSOR':
        // 这些 action 只用于更新 presence，不改变 CanvasState
        // return state;

        default:
            return state;
    }
}

export const initialCanvasState: CanvasType = { mode: 'None' };