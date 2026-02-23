"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {clampQty, MAX_QTY, MIN_QTY} from "@/lib/helpers";

interface QuantityInputProps {
    value: number;
    onChange: (v: number) => void;
    max?: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ value, onChange, max }) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsed = parseInt(e.target.value, 10);
        if (!isNaN(parsed)) onChange(clampQty(parsed));
    };

    const atMax = max != null && value >= max;

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onChange(clampQty(value - 1))}
                disabled={value <= MIN_QTY}
            >
                <Minus className="h-3 w-3" />
            </Button>

            <Input
                type="number"
                min={MIN_QTY}
                max={max ?? MAX_QTY}
                value={value}
                onChange={handleInput}
                className="h-8 w-20 text-center font-mono text-sm
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none"
            />

            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onChange(clampQty(value + 1))}
                disabled={atMax}
            >
                <Plus className="h-3 w-3" />
            </Button>

            {max != null && (
                <span className="text-xs text-muted-foreground">
          / {max} in stock
        </span>
            )}
        </div>
    );
};

export default QuantityInput;