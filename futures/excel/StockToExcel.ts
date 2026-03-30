import { StockByLocationResponse } from "@/types/stock/SummaryItem";
import * as XLSX from "xlsx-js-style";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type BorderSide = { style: string; color: { rgb: string } };

type CellStyle = {
    border?: Partial<Record<"top" | "bottom" | "left" | "right", BorderSide>>;
    fill?: { patternType: "solid"; fgColor: { rgb: string } };
    font?: { bold?: boolean; sz?: number; color?: { rgb: string } };
    alignment?: {
        horizontal?: "left" | "center" | "right";
        vertical?: "center" | "top" | "bottom";
    };
};

// ─── Константы ───────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 5;

const BORDER: CellStyle["border"] = {
    top:    { style: "thin", color: { rgb: "E5E7EB" } },
    bottom: { style: "thin", color: { rgb: "E5E7EB" } },
    left:   { style: "thin", color: { rgb: "E5E7EB" } },
    right:  { style: "thin", color: { rgb: "E5E7EB" } },
};

const BORDER_MEDIUM_TOP_BOTTOM: CellStyle["border"] = {
    top:    { style: "medium", color: { rgb: "1F2937" } },
    bottom: { style: "medium", color: { rgb: "1F2937" } },
    left:   { style: "thin",   color: { rgb: "E5E7EB" } },
    right:  { style: "thin",   color: { rgb: "E5E7EB" } },
};

const STYLES: Record<string, CellStyle> = {
    // Шапка таблицы
    header: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "1F2937" } },
        font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { horizontal: "center", vertical: "center" },
    },
    // Строка-группа локации
    locationGroup: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "F0FDF4" } },
        font:      { bold: true, color: { rgb: "15803D" }, sz: 10 },
        alignment: { horizontal: "left", vertical: "center" },
    },
    // Чётные/нечётные строки
    rowEven: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        font:      { sz: 10 },
        alignment: { vertical: "center" },
    },
    rowOdd: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "F9FAFB" } },
        font:      { sz: 10 },
        alignment: { vertical: "center" },
    },
    // Количество (центрирование)
    quantityEven: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        font:      { sz: 10 },
        alignment: { horizontal: "center", vertical: "center" },
    },
    quantityOdd: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "F9FAFB" } },
        font:      { sz: 10 },
        alignment: { horizontal: "center", vertical: "center" },
    },
    // Низкий остаток
    rowLowStock: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FEF2F2" } },
        font:      { sz: 10, color: { rgb: "991B1B" } },
        alignment: { vertical: "center" },
    },
    quantityLowStock: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FEF2F2" } },
        font:      { bold: true, sz: 10, color: { rgb: "991B1B" } },
        alignment: { horizontal: "center", vertical: "center" },
    },
    // Итог
    total: {
        border:    BORDER_MEDIUM_TOP_BOTTOM,
        fill:      { patternType: "solid", fgColor: { rgb: "EFF6FF" } },
        font:      { bold: true, sz: 10, color: { rgb: "1E40AF" } },
        alignment: { horizontal: "center", vertical: "center" },
    },
    totalLabel: {
        border:    BORDER_MEDIUM_TOP_BOTTOM,
        fill:      { patternType: "solid", fgColor: { rgb: "EFF6FF" } },
        font:      { bold: true, sz: 10, color: { rgb: "1E40AF" } },
        alignment: { horizontal: "left", vertical: "center" },
    },
    // Summary sheet
    summaryHeader: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "1E3A5F" } },
        font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        alignment: { horizontal: "center", vertical: "center" },
    },
    summaryEven: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        font:      { sz: 10 },
        alignment: { horizontal: "center", vertical: "center" },
    },
    summaryOdd: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "F0F9FF" } },
        font:      { sz: 10 },
        alignment: { horizontal: "center", vertical: "center" },
    },
    summaryLabelEven: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        font:      { sz: 10 },
        alignment: { horizontal: "left", vertical: "center" },
    },
    summaryLabelOdd: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "F0F9FF" } },
        font:      { sz: 10 },
        alignment: { horizontal: "left", vertical: "center" },
    },
    summaryTotal: {
        border:    BORDER_MEDIUM_TOP_BOTTOM,
        fill:      { patternType: "solid", fgColor: { rgb: "EFF6FF" } },
        font:      { bold: true, sz: 10, color: { rgb: "1E40AF" } },
        alignment: { horizontal: "center", vertical: "center" },
    },
    summaryTotalLabel: {
        border:    BORDER_MEDIUM_TOP_BOTTOM,
        fill:      { patternType: "solid", fgColor: { rgb: "EFF6FF" } },
        font:      { bold: true, sz: 10, color: { rgb: "1E40AF" } },
        alignment: { horizontal: "left", vertical: "center" },
    },
    // Info sheet
    infoLabel: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "F3F4F6" } },
        font:      { bold: true, sz: 10, color: { rgb: "374151" } },
        alignment: { horizontal: "left", vertical: "center" },
    },
    infoValue: {
        border:    BORDER,
        fill:      { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
        font:      { sz: 10 },
        alignment: { horizontal: "left", vertical: "center" },
    },
};

// ─── Колонки основного листа ──────────────────────────────────────────────────

const STOCK_COLUMNS = [
    { key: "location",        label: "Location",        width: 14 },
    { key: "material_number", label: "Material Number", width: 22 },
    { key: "description_eng", label: "Description",     width: 52 },
    { key: "description_orginall", label: "Description ORG",     width: 52 },
    { key: "warehouse",       label: "Warehouse",       width: 14 },
    { key: "total_quantity",  label: "Qty",             width: 10 },
] as const;

type RowKey = (typeof STOCK_COLUMNS)[number]["key"];

// ─── Хелперы ─────────────────────────────────────────────────────────────────

function writeCell(
    ws: XLSX.WorkSheet,
    r: number,
    c: number,
    value: string | number,
    style: CellStyle
) {
    const addr = XLSX.utils.encode_cell({ r, c });
    ws[addr] = { v: value, t: typeof value === "number" ? "n" : "s", s: style };
}

function setSheetRange(ws: XLSX.WorkSheet, rows: number, cols: number) {
    ws["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: rows - 1, c: cols - 1 },
    });
}

// ─── Лист 1: Stock ────────────────────────────────────────────────────────────

function buildStockSheet(data: StockByLocationResponse): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const merges: XLSX.Range[] = [];
    let currentRow = 0;
    let globalItemIndex = 0;
    let totalQty = 0;
    let lowStockCount = 0;

    // Заголовок
    STOCK_COLUMNS.forEach((col, c) =>
        writeCell(ws, currentRow, c, col.label, STYLES.header)
    );
    currentRow++;

    for (const loc of data) {
        const items = loc.items ?? [];
        if (items.length === 0) continue;

        const locationLabel = loc.location.split("-").pop()?.toUpperCase() ?? loc.location;

        // Строка группы — merged по всей ширине
        writeCell(ws, currentRow, 0, `📦  ${locationLabel}`, STYLES.locationGroup);
        for (let c = 1; c < STOCK_COLUMNS.length; c++) {
            const addr = XLSX.utils.encode_cell({ r: currentRow, c });
            ws[addr] = { v: "", t: "s", s: STYLES.locationGroup };
        }
        merges.push({
            s: { r: currentRow, c: 0 },
            e: { r: currentRow, c: STOCK_COLUMNS.length - 1 },
        });
        currentRow++;

        // Строки товаров
        for (const item of items) {
            const isEven     = globalItemIndex % 2 === 0;
            const isLowStock = (item.total_quantity ?? 0) <= LOW_STOCK_THRESHOLD;

            const rowStyle = isLowStock
                ? STYLES.rowLowStock
                : isEven ? STYLES.rowEven : STYLES.rowOdd;

            const qtyStyle = isLowStock
                ? STYLES.quantityLowStock
                : isEven ? STYLES.quantityEven : STYLES.quantityOdd;

            const rowData: Record<RowKey, string | number> = {
                location:        locationLabel,
                material_number: item.material_number ?? "",
                description_eng: item.description_eng ?? "",
                description_orginall: item.description_orginall ?? "",
                warehouse:       item.warehouse       ?? "",
                total_quantity:  item.total_quantity  ?? 0,
            };

            STOCK_COLUMNS.forEach((col, c) => {
                const style = col.key === "total_quantity" ? qtyStyle : rowStyle;
                writeCell(ws, currentRow, c, rowData[col.key], style);
            });

            totalQty += item.total_quantity ?? 0;
            if (isLowStock) lowStockCount++;
            globalItemIndex++;
            currentRow++;
        }
    }

    // Итоговая строка
    writeCell(
        ws, currentRow, 0,
        `Total: ${globalItemIndex} items  |  Low stock: ${lowStockCount}`,
        STYLES.totalLabel
    );
    for (let c = 1; c < STOCK_COLUMNS.length - 1; c++) {
        const addr = XLSX.utils.encode_cell({ r: currentRow, c });
        ws[addr] = { v: "", t: "s", s: STYLES.total };
    }
    writeCell(ws, currentRow, STOCK_COLUMNS.length - 1, totalQty, STYLES.total);
    merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow, c: STOCK_COLUMNS.length - 2 },
    });

    // Настройки листа
    setSheetRange(ws, currentRow + 1, STOCK_COLUMNS.length);
    ws["!cols"]       = STOCK_COLUMNS.map((col) => ({ wch: col.width }));
    ws["!rows"]       = [{ hpt: 24 }];
    ws["!merges"]     = merges;
    ws["!freeze"]     = { xSplit: 0, ySplit: 1 };
    ws["!autofilter"] = {
        ref: `A1:${XLSX.utils.encode_col(STOCK_COLUMNS.length - 1)}1`,
    };

    return ws;
}

function buildInfoSheet(
    warehouse: string,
    totalLocations: number,
    totalItems: number,
    lowStockItems: number
): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};

    const meta: [string, string | number][] = [
        ["Generated at",     new Date().toLocaleString()],
        ["Warehouse",        warehouse === "all" ? "All warehouses" : warehouse],
        ["Locations",        totalLocations],
        ["Total SKUs",       totalItems],
        ["Low stock items",  lowStockItems],
        ["Threshold",        `≤ ${LOW_STOCK_THRESHOLD} units`],
    ];

    meta.forEach(([label, value], r) => {
        writeCell(ws, r, 0, label,           STYLES.infoLabel);
        writeCell(ws, r, 1, value as string, STYLES.infoValue);
    });

    setSheetRange(ws, meta.length, 2);
    ws["!cols"] = [{ wch: 20 }, { wch: 32 }];
    ws["!rows"] = meta.map(() => ({ hpt: 20 }));

    return ws;
}

// ─── Главная функция ─────────────────────────────────────────────────────────

export function stockToExcel(
    data: StockByLocationResponse,
    warehouse: string,
    onDone?: (filename: string) => void
) {
    if (!data?.length) {
        console.warn("[stockToExcel] Нет данных для экспорта");
        return;
    }

    const allItems = data.flatMap((l) => l.items ?? []);

    if (allItems.length === 0) {
        console.warn("[stockToExcel] Локации есть, но товаров нет");
        return;
    }

    const totalLocations = data.filter((l) => (l.items ?? []).length > 0).length;
    const lowStockItems  = allItems.filter(
        (i) => (i.total_quantity ?? 0) <= LOW_STOCK_THRESHOLD
    ).length;

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, buildStockSheet(data),   "Stock");
    XLSX.utils.book_append_sheet(
        wb,
        buildInfoSheet(warehouse, totalLocations, allItems.length, lowStockItems),
        "Info"
    );

    const warehouseLabel = warehouse === "all" ? "All" : warehouse;
    const date           = new Date().toISOString().slice(0, 10);
    const filename       = `stock_${warehouseLabel}_${date}.xlsx`;

    XLSX.writeFile(wb, filename);
    onDone?.(filename);
}