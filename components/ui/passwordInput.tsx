import React, {useState} from "react";
import {Input} from "@/components/ui/input";
import {Eye, EyeOff} from "lucide-react";

export const PasswordInput = ({
                                  placeholder = 'Password',
                                  value,
                                  onChange
                              }: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative w-full">
            <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                className="pr-10"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
                {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                ) : (
                    <Eye size={18} strokeWidth={1.5} />
                )}
            </button>
        </div>
    );
};