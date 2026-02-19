'use client';

import { cn } from '@/utils/common';
import { useMutation } from '@liveblocks/react';
import { useMemo } from 'react';
import { AiOutlineFontSize } from 'react-icons/ai';
import { IoEllipseOutline, IoSquareOutline } from 'react-icons/io5';
import { PiPathLight } from 'react-icons/pi';

interface LayerButtonProps {
    layerId: string;
    type?: LayerType;
    isSelected: boolean;
}

export default function LayerButton({ layerId, type, isSelected }: LayerButtonProps) {
    const updateSelection = useMutation(({ setMyPresence }, layerId: string) => {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
    }, []);

    const typeMap = useMemo(
        () => ({
            Ellipse: { icon: <IoEllipseOutline className="h-3 w-3 text-gray-500" />, text: 'Ellipse' },
            Rectangle: { icon: <IoSquareOutline className="h-3 w-3 text-gray-500" />, text: 'Rectangle' },
            Path: { icon: <PiPathLight className="h-3 w-3 text-gray-500" />, text: 'Drawing' },
            Text: { icon: <AiOutlineFontSize className="h-3 w-3 text-gray-500" />, text: 'Text' }
        }),
        []
    );

    if (!type) {
        return null;
    }

    return (
        <button
            className={cn('flex items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] hover:bg-gray-100', isSelected ? 'bg-[#bce3ff]' : '')}
            onClick={() => updateSelection(layerId)}>
            {typeMap[type].icon}
            <span>{typeMap[type].text}</span>
        </button>
    );
}
