import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StockSearchProps {
    searchValue: string;
    onSearch: (v: string) => void;
    onClear: () => void;
    total: number;
    shown: number;
}

export function StockSearch({ searchValue, onSearch, onClear, total, shown }: StockSearchProps) {
    return (
        <>
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                    value={searchValue}
                    onChange={e => onSearch(e.target.value)}
                    placeholder="Search by location, material or description…"
                    className="pl-9 pr-9 h-9 text-base"
                />
                {searchValue && (
                    <button
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{shown}</span> of{' '}
                    <span className="font-medium text-foreground">{total}</span> locations
                </p>
                {searchValue && (
                    <Badge variant="secondary" className="text-xs gap-1">
                        <Search size={10} />{searchValue}
                    </Badge>
                )}
            </div>
        </>
    );
}