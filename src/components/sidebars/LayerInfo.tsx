import { cn, colorToCss, hexToRgb } from '@/utils/common';
import NumberInput from './NameInput';
import ColorPicker from './ColorPicker';
import Dropdown from './DropDown';
import { BsCircleHalf } from 'react-icons/bs';
import type { UpdateLayerParams } from '../../../types';
import { RiRoundedCorner } from 'react-icons/ri';
import { useMutation, useStorage } from '@liveblocks/react';

interface LayerInfoProps {
    layer: Layer | null;
    updateLayer: (update: UpdateLayerParams) => void;
}

/**
 * Render the layer inspector sidebar, showing controls for the selected layer or page settings when no layer is selected.
 *
 * @param layer - The currently selected layer, or `null` to show page-level settings
 * @param updateLayer - Callback invoked with partial layer updates to apply changes to the selected layer
 * @returns The sidebar UI as a React element containing sectioned controls for editing layer properties or the page color
 */
export default function LayerInfo({ layer, updateLayer }: LayerInfoProps) {
    const roomColor = useStorage(root => root.roomColor);

    const setRoomColor = useMutation(({ storage }, newColor: Color) => {
        storage.set('roomColor', newColor);
    }, []);
    // const setRoomColor = () => {};

    return (
        <>
            {layer ? (
                <>
                    {/* Position */}
                    <PositionSection layer={layer} updateLayer={updateLayer} />
                    {/* Path */}
                    <PathSection layer={layer} updateLayer={updateLayer} />
                    {/* Appearance */}
                    <AppearanceSection layer={layer} updateLayer={updateLayer} />
                    {/* Fill */}
                    <FillSection layer={layer} updateLayer={updateLayer} />
                    {/* Stroke */}
                    <StrokeSection layer={layer} updateLayer={updateLayer} />
                    {/* Text */}
                    <TextSection layer={layer} updateLayer={updateLayer} />
                </>
            ) : (
                <PageSection roomColor={roomColor} setRoomColor={setRoomColor} />
            )}
        </>
    );
}

/**
 * Render controls for editing a layer's X and Y coordinates.
 *
 * @param layer - The layer whose position is being edited.
 * @param updateLayer - Callback invoked with a partial update object (e.g., `{ x: number }` or `{ y: number }`) to apply changes to the layer.
 * @returns A JSX element containing labeled numeric inputs for the layer's `x` and `y` values.
 */
function PositionSection({ layer, updateLayer }: { layer: Layer; updateLayer: (update: UpdateLayerParams) => void }) {
    return (
        <>
            <SectionTemplate title="Position">
                <SectionItemTemplate label="Position">
                    <div className="flex w-full gap-2">
                        <NumberInput
                            value={layer.x}
                            onChange={number => {
                                updateLayer({ x: number });
                            }}
                            classNames="w-1/2"
                            icon={<p>X</p>}
                        />
                        <NumberInput
                            value={layer.y}
                            onChange={number => {
                                updateLayer({ y: number });
                            }}
                            classNames="w-1/2"
                            icon={<p>Y</p>}
                        />
                    </div>
                </SectionItemTemplate>
            </SectionTemplate>
        </>
    );
}

/**
 * Render the "Typography" section for editing properties of a Text layer.
 *
 * Renders font family, font size, and font weight controls when `layer.type` is `"Text"`.
 *
 * @param layer - The layer to edit; expected to be a Text layer.
 * @param updateLayer - Callback that applies the provided layer property updates.
 * @returns The Typography section UI for a Text layer, or `null` when `layer.type` is not `"Text"`.
 */
function TextSection({ layer, updateLayer }: { layer: Layer; updateLayer: (update: UpdateLayerParams) => void }) {
    if (layer.type !== 'Text') {
        return null;
    }

    return (
        <>
            <SectionTemplate title="Typography">
                <div className="flex flex-col gap-2">
                    <Dropdown
                        value={layer.fontFamily}
                        onChange={value => {
                            updateLayer({ fontFamily: value });
                        }}
                        options={['Inter', 'Arial', 'Times New Roman']}
                    />
                    <div className="flex w-full gap-2">
                        <SectionItemTemplate label="Size" className="flex-1">
                            <NumberInput
                                value={layer.fontSize}
                                onChange={number => {
                                    updateLayer({ fontSize: number });
                                }}
                                icon={<p>W</p>}
                            />
                        </SectionItemTemplate>
                        <SectionItemTemplate label="Weight" className="flex-1">
                            <Dropdown
                                value={layer.fontWeight.toString()}
                                onChange={value => {
                                    updateLayer({ fontWeight: Number(value) });
                                }}
                                options={['100', '200', '300', '400', '500', '600', '700', '800', '900']}
                            />
                        </SectionItemTemplate>
                    </div>
                </div>
            </SectionTemplate>
        </>
    );
}

/**
 * Render the "Layout" section with width and height controls for a Path layer.
 *
 * Renders two numeric inputs labeled "W" and "H" that update the layer's `width` and `height` via `updateLayer`. Returns `null` when the provided layer is not of type `Path`.
 *
 * @param layer - The layer to display and edit; must be a `Path` layer for controls to be shown.
 * @param updateLayer - Callback invoked with partial layer properties to apply updates (e.g., `{ width: number }`).
 * @returns A JSX element containing the layout controls, or `null` if the layer is not a `Path`.
 */
function PathSection({ layer, updateLayer }: { layer: Layer; updateLayer: (update: UpdateLayerParams) => void }) {
    if (layer.type !== 'Path') {
        return null;
    }

    return (
        <>
            <SectionTemplate title="Layout">
                <SectionItemTemplate label="Dimensions">
                    <div className="flex w-full gap-2">
                        <NumberInput
                            value={layer.width}
                            onChange={number => {
                                updateLayer({ width: number });
                            }}
                            classNames="w-1/2"
                            icon={<p>W</p>}
                        />
                        <NumberInput
                            value={layer.height}
                            onChange={number => {
                                updateLayer({ height: number });
                            }}
                            classNames="w-1/2"
                            icon={<p>H</p>}
                        />
                    </div>
                </SectionItemTemplate>
            </SectionTemplate>
        </>
    );
}

/**
 * Renders appearance controls for a layer.
 *
 * Displays an opacity control for all layers and, when the layer is a rectangle, a corner-radius control.
 *
 * @param layer - The layer whose appearance is being edited.
 * @param updateLayer - Callback invoked with partial layer properties to apply updates (e.g., `{ opacity: number }`, `{ cornerRadius: number }`).
 * @returns A section containing controls for adjusting opacity and, for rectangle layers, corner radius.
 */
function AppearanceSection({ layer, updateLayer }: { layer: Layer; updateLayer: (update: UpdateLayerParams) => void }) {
    return (
        <SectionTemplate title="Appearance">
            <div className="flex w-full gap-2">
                <SectionItemTemplate className="w-1/2" label="Opacity">
                    <NumberInput
                        value={layer.opacity}
                        min={0}
                        max={100}
                        onChange={number => {
                            updateLayer({ opacity: number });
                        }}
                        classNames="w-full"
                        icon={<BsCircleHalf />}
                    />
                </SectionItemTemplate>
                {layer.type === 'Rectangle' && (
                    <SectionItemTemplate className="w-1/2" label="Corner radius">
                        <NumberInput
                            value={layer.cornerRadius ?? 0}
                            min={0}
                            max={100}
                            onChange={number => {
                                updateLayer({ cornerRadius: number });
                            }}
                            classNames="w-full"
                            icon={<RiRoundedCorner />}
                        />
                    </SectionItemTemplate>
                )}
            </div>
        </SectionTemplate>
    );
}

/**
 * Render the "Fill" section with a color picker that updates the layer's fill and stroke colors.
 *
 * @param layer - The layer whose current fill is shown and will be updated
 * @param updateLayer - Callback invoked with the updated layer properties; receives an object containing `fill` and `stroke` set to the chosen color
 * @returns The rendered Fill section
 */
function FillSection({ layer, updateLayer }: { layer: Layer; updateLayer: (update: UpdateLayerParams) => void }) {
    return (
        <SectionTemplate title="Fill">
            <ColorPicker
                value={colorToCss(layer.fill)}
                onUpdateColor={color => {
                    updateLayer({ fill: color, stroke: color });
                }}
            />
        </SectionTemplate>
    );
}

/**
 * Displays a stroke color picker for a layer and applies chosen colors to the layer.
 *
 * @param layer - The layer whose stroke color is being edited.
 * @param updateLayer - Callback invoked with an update object when the stroke color changes.
 * @returns A React element containing a stroke color picker that updates the layer's `stroke` property.
 */
function StrokeSection({ layer, updateLayer }: { layer: Layer; updateLayer: (update: UpdateLayerParams) => void }) {
    return (
        <SectionTemplate title="Stroke">
            <ColorPicker
                value={colorToCss(layer.stroke)}
                onUpdateColor={color => {
                    updateLayer({ stroke: color });
                }}
            />
        </SectionTemplate>
    );
}

/**
 * Render the "Page" section containing a color picker for the page/room background.
 *
 * @param roomColor - Current room color as a `Color` object, or `null` when unset
 * @param setRoomColor - Callback invoked with an RGB `Color` when a new color is selected
 * @returns The JSX element for the Page section with a ColorPicker control
 */
function PageSection({ roomColor, setRoomColor }: { roomColor: Color | null; setRoomColor: (color: Color) => void }) {
    return (
        <SectionTemplate title="Page">
            <ColorPicker
                onUpdateColor={color => {
                    const rgbColor = hexToRgb(color);

                    setRoomColor(rgbColor);
                }}
                value={roomColor ? colorToCss(roomColor) : '#1e1e1e'}
            />
        </SectionTemplate>
    );
}

interface ItemTemplateProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Renders a titled section container used to group related controls in the sidebar.
 *
 * @param title - The heading text displayed above the section content
 * @param children - Elements to render within the section body
 * @returns A container element with the title and the provided children
 */
export function SectionTemplate({ title, children }: ItemTemplateProps) {
    return (
        <div className="flex flex-col gap-2 border-t border-gray-200 p-4">
            <span className="mb-2 text-[11px] font-medium">{title}</span>
            {children}
        </div>
    );
}

interface SectionItemTemplateProps {
    label: string;
    className?: string;
    children: React.ReactNode;
}

/**
 * Render a labeled vertical container for grouping inputs or controls.
 *
 * @param label - The small label text displayed above the children
 * @param className - Optional additional CSS class names applied to the outer container
 * @returns The container element containing the label and the provided children
 */
function SectionItemTemplate({ label, className, children }: SectionItemTemplateProps) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <p className="text-[9px] font-medium text-gray-500">{label}</p>
            {children}
        </div>
    );
}