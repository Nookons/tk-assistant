
export const WAREHOUSES = ['all', 'GLPC', 'SMALL_P3', 'P3'] as const;

export const WAREHOUSE_LABELS: Record<Warehouse, string> = {
    all: 'All', GLPC: 'GLP-C', SMALL_P3: 'SMALL P3', P3: 'P3',
};

export const STORAGE_KEY = 'stock_sub_tab';
export type Warehouse = typeof WAREHOUSES[number];