import { IStockItemTemplate } from "@/types/stock/StockItem";

export const PAGE_SIZE   = 30;
export const DEBOUNCE_MS = 250;
export const MIN_QTY     = 1;
export const MAX_QTY     = 999;

export const clampQty = (v: number) =>
    Math.max(MIN_QTY, Math.min(MAX_QTY, v));

export const buildSearchText = (item: IStockItemTemplate) =>
    `${item.description_orginall ?? ""} ${item.description_eng ?? ""} ${item.material_number ?? ""}`.toLowerCase();

export const matchesAllTerms = (text: string, terms: string[]) =>
    terms.every((t) => text.includes(t));