import {StockByLocationResponse} from "@/types/stock/SummaryItem";
import * as XLSX from "xlsx";

export function stockToExcel(data: StockByLocationResponse, warehouse: string) {
    const rows = data.flatMap(loc =>
        (loc.items ?? []).map(item => ({
            'Location':        item.location_key.split('-')[1]?.toUpperCase() ?? '',
            'Material Number': item.material_number ?? '',
            'Description':     item.description_eng ?? '',
            'Warehouse':       item.warehouse ?? '',
            'Total Quantity':  item.total_quantity ?? 0,
        }))
    );

    if (rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Авто-ширина колонок
    const colWidths = Object.keys(rows[0]).map(key => ({
        wch: Math.max(key.length, ...rows.map(r => String(r[key as keyof typeof r] ?? '').length)) + 2,
    }));
    worksheet['!cols'] = colWidths;

    // ── Сетка ─────────────────────────────────────────────────────────────────
    const borderStyle = {
        top:    { style: 'thin', color: { rgb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
        left:   { style: 'thin', color: { rgb: 'D1D5DB' } },
        right:  { style: 'thin', color: { rgb: 'D1D5DB' } },
    };

    const headerFill = { fgColor: { rgb: 'F3F4F6' }, patternType: 'solid' as const };
    const headerFont = { bold: true };

    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = { t: 's', v: '' };
            }

            worksheet[cellAddress].s = {
                border: borderStyle,
                ...(R === 0 && { fill: headerFill, font: headerFont }),
            };
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock');

    const warehouseLabel = warehouse === 'all' ? 'All' : warehouse;
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `stock_${warehouseLabel}_${date}.xlsx`);
}