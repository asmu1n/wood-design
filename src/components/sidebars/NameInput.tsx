import React from 'react';
import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { Input } from '../ui/input';

export default function NumberInput({
    value,
    onChange,
    min,
    max,
    icon,
    classNames
}: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    icon: ReactNode;
    classNames?: string;
}) {
    const [inputValue, setInputValue] = useState(value.toString());

    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleCommit = () => {
        const newValue = parseFloat(inputValue);

        if (isNaN(newValue)) {
            setInputValue(value.toString());

            return;
        }

        const clampedValue = Math.min(max ?? newValue, Math.max(min ?? newValue, newValue));

        setInputValue(clampedValue.toString());
        onChange(clampedValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommit();
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    return (
        <div className={`relative h-fit ${classNames ?? 'w-28'}`}>
            <Input type="number" value={inputValue} onChange={handleChange} onBlur={handleCommit} onKeyDown={handleKeyDown} min={min} max={max} />
            {React.isValidElement(icon) && icon.type === 'p' ? (
                <p className="absolute top-[50%] left-2 -translate-y-1/2 text-[10px] text-gray-400">
                    {(icon as React.ReactElement<{ children: React.ReactNode }>).props.children}
                </p>
            ) : (
                React.cloneElement(icon as React.ReactElement<{ className: string }>, {
                    className: 'absolute left-1.5 top-[50%] h-3 w-3 -translate-y-1/2 text-gray-400'
                })
            )}
        </div>
    );
}
