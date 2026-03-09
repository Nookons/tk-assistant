'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialImageProps {
    url?: string | null;
    alt?: string;
}

export function MaterialImage({ url, alt = 'Material photo' }: MaterialImageProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const hasImage = !!url && !error;

    return (
        <div className="relative w-full aspect-[4/3] bg-muted rounded-xl overflow-hidden">

            {loading && hasImage && (
                <div className="absolute inset-0 z-10 animate-pulse bg-muted" />
            )}

            {/* Image */}
            {hasImage && (
                <Image
                    src={url}
                    alt={alt}
                    fill
                    className={cn(
                        'object-cover transition-opacity duration-300',
                        loading ? 'opacity-0' : 'opacity-100'
                    )}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                />
            )}

            {/* Fallback — нет фото или ошибка */}
            {!hasImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ImageOff className="w-8 h-8 opacity-40" />
                    <span className="text-xs opacity-50">No Img</span>
                </div>
            )}
        </div>
    );
}