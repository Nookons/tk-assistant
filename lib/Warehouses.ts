
export const WAREHOUSES = ['All', 'GLPC', 'SMALL_P3', 'P3', 'PNT_A'] as const;

export const WAREHOUSE_LABELS: Record<Warehouse, string> = {
    All: 'All', GLPC: 'GLP-C', SMALL_P3: 'SMALL P3', P3: 'P3', PNT_A: 'PNT-A',
};

export const STORAGE_KEY = 'stock_sub_tab';
export type Warehouse = typeof WAREHOUSES[number];