import {usePersistedTab} from "@/hooks/usePersistedTab";
import {Warehouse, WAREHOUSE_LABELS, WAREHOUSES} from "@/lib/Warehouses";

const STORAGE_KEY = 'stock_sub_tab';

export function useWarehouseFilter() {
    const [pickedWarehouse, setPickedWarehouse] = usePersistedTab<Warehouse>(
        STORAGE_KEY, 'All',
        (v) => (WAREHOUSES as readonly string[]).includes(v) ? v as Warehouse : 'All'
    );

    const handleWarehouse = (v: string) => {
        setPickedWarehouse(v as Warehouse);
    };

    return { pickedWarehouse, handleWarehouse, WAREHOUSES, WAREHOUSE_LABELS };
}