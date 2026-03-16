import { PackageSearch } from 'lucide-react';
import { LocationStock } from '@/types/stock/SummaryItem';
import LocationCard from "@/components/shared/DashboardNew/DashboardComponents/Stock/LocationCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface StockGridProps {
    data: LocationStock[];
    searchValue: string;
    onPickItem: (el: LocationStock) => void;
}

export function StockGrid({ data, searchValue, onPickItem }: StockGridProps) {
    if (data.length === 0) {
        return <EmptyState icon={PackageSearch} title="No locations found" searchValue={searchValue} />;
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {data.map((el, index) => (
                <LocationCard
                    key={`${el.location}-${index}`}
                    el={el}
                    onClick={() => onPickItem(el)}
                />
            ))}
        </div>
    );
}