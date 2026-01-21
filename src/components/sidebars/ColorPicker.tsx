import { cn } from '@/utils/common';
import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
    value: string;
    onUpdateColor: (value: string) => void;
    className?: string;
}

const validColorRegex = /^#[0-9a-f]{6}$/i;

/**
 * Renders a text input with a color swatch and popup hex color picker for editing a hex color value.
 *
 * The component validates input against `#` followed by six hex digits, calls `onUpdateColor` when a valid
 * color is committed or selected, resets the input to `value` on blur if invalid, and closes the popup
 * when clicking outside.
 *
 * @param value - Current hex color string (e.g., `#aabbcc`) shown in the input and swatch.
 * @param onUpdateColor - Called with a valid hex color when the user commits or selects a color.
 * @param className - Optional additional CSS classes applied to the root container.
 * @returns The color-picker React element.
 */
export default function ColorPicker({ value, onUpdateColor, className }: ColorPickerProps) {
    const [inputValue, setInputValue] = useState(value);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const validColor = validColorRegex.test(inputValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [pickerRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        const validColor = validColorRegex.test(e.target.value);

        if (validColor) {
            onUpdateColor(e.target.value);
        }
    };

    function resetInvalidColor() {
        if (!validColor) {
            setInputValue(value);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // handleCommit();
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    function handleCommit(newColor: string) {
        const validColor = validColorRegex.test(newColor);

        if (validColor) {
            setInputValue(newColor);
            onUpdateColor(newColor);
        }
    }

    useEffect(
        function syncInputValue() {
            setInputValue(value);
        },
        [value]
    );

    return (
        <div ref={pickerRef} className={`relative h-fit ${className ?? 'w-28'}`}>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onBlur={resetInvalidColor}
                onKeyDown={handleKeyDown}
                className={cn(
                    'h-fit w-full rounded-lg border bg-[#f5f5f5] px-2 py-1 pl-6 text-xs hover:border-[#e8e8e8]',
                    validColor ? 'border-[#f5f5f5]' : 'border-red-500'
                )}
            />
            <div
                style={{ backgroundColor: inputValue }}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="absolute top-[50%] left-1.5 h-3.5 w-3.5 -translate-y-1/2 cursor-pointer rounded"
            />
            {isPickerOpen && (
                <div className="absolute right-0 z-10 mt-2 -translate-x-[125px]">
                    <HexColorPicker color={inputValue} onChange={handleCommit} />
                </div>
            )}
        </div>
    );
}