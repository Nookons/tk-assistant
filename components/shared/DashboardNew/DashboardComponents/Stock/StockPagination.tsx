import { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';

interface StockPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: Dispatch<SetStateAction<number>>;
}

export function StockPagination({ page, totalPages, onPageChange }: StockPaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(p => p - 1)} disabled={page === 1}>
                    ← Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPageChange(p => p + 1)} disabled={page === totalPages}>
                    Next →
                </Button>
            </div>
        </div>
    );
}