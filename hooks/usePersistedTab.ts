// hooks/usePersistedTab.ts
import {useState} from "react";

export function usePersistedTab<T extends string>(key: string, defaultValue: T, validate?: (v: string) => T) {
    const [tab, setTab] = useState<T>(() => {
        if (typeof window === 'undefined') return defaultValue;
        const stored = localStorage.getItem(key);
        if (!stored) return defaultValue;
        return validate ? validate(stored) : (stored as T);
    });

    const onChange = (value: T) => {
        localStorage.setItem(key, value);
        setTab(value);
    };

    return [tab, onChange] as const;
}