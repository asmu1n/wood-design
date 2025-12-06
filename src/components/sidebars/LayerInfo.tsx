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

export function SectionTemplate({ title, children }: ItemTemplateProps) {
    return (
        <>
            <div className="border-b border-gray-200"></div>
            <div className="flex flex-col gap-2 py-4">
                <span className="mb-2 text-[11px] font-medium">{title}</span>
                {children}
            </div>
        </>
    );
}

interface SectionItemTemplateProps {
    label: string;
    className?: string;
    children: React.ReactNode;
}

function SectionItemTemplate({ label, className, children }: SectionItemTemplateProps) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <p className="text-[9px] font-medium text-gray-500">{label}</p>
            {children}
        </div>
    );
}
