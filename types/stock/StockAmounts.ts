

export interface IStockAmountItem {
    id: number;
    created_at: Date;
    updated_at: Date;
    quantity: number;
    last_update_by: number;
    material_number: string;
    warehouse: string;
    location: string;
}