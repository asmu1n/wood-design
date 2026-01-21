import { cn } from '@/utils/common';
import { ChangeEvent, useEffect, useState } from 'react';

/**
 * Renders a stylized select input whose selection is kept in sync with the provided `value`.
 *
 * @param value - Currently selected option value displayed by the dropdown
 * @param onChange - Callback invoked with the newly selected value when the user changes selection
 * @param options - Array of option strings to render as selectable items
 * @param className - Optional additional class names applied to the wrapper element
 * @returns The dropdown React element
 */
export default function Dropdown({
    value,
    onChange,
    options,
    className
}: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    className?: string;
}) {
    const [selectedValue, setSelectedValue] = useState(value);

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;

        setSelectedValue(newValue);
        onChange(newValue);
    };

    return (
        <div className={cn('relative', className)}>
            <select
                value={selectedValue}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#e8e8e8] bg-[#f5f5f5] px-2 py-1 text-xs hover:bg-[#e8e8e8]">
                {options.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}