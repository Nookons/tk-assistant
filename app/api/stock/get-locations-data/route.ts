import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { StockByLocationResponse, LocationItem } from '@/types/stock/SummaryItem';

interface StockRow {
    location: string;
    warehouse: string;
    quantity: number;
    location_key: string;
    material_number: string;
    item: {
        description_eng: string;
        description_orginall: string;
        avatar_url: string;
    } | Array<{ description_eng: string; description_orginall: string; avatar_url: string }>;
}

const UNKNOWN_LOCATION = 'unknown';

function extractDescription(item: StockRow['item']): string {
    if (Array.isArray(item) && item.length > 0) {
        return item[0]?.description_eng ?? '';
    }
    return (item as { description_eng: string })?.description_eng ?? '';
}
function extractDescriptionOriginal(item: StockRow['item']): string {
    if (Array.isArray(item) && item.length > 0) {
        return item[0]?.description_orginall ?? '';
    }
    return (item as { description_orginall: string })?.description_orginall ?? '';
}

function extractAvatarUrl(item: StockRow['item']): string {
    if (Array.isArray(item) && item.length > 0) {
        return item[0]?.avatar_url ?? '';
    }
    return (item as { avatar_url: string })?.avatar_url ?? '';
}

function groupStockByLocation(data: StockRow[]): StockByLocationResponse {
    const locationMap = new Map<string, Map<string, LocationItem>>();

    for (const row of data) {
        const locationKey = row.location_key ?? UNKNOWN_LOCATION;

        if (!locationMap.has(locationKey)) {
            locationMap.set(locationKey, new Map());
        }

        const itemsMap = locationMap.get(locationKey)!;
        const materialNumber = row.material_number;

        if (!itemsMap.has(materialNumber)) {
            itemsMap.set(materialNumber, {
                material_number: materialNumber,
                description_eng: extractDescription(row.item),
                description_orginall: extractDescriptionOriginal(row.item),
                avatar_url: extractAvatarUrl(row.item), // ✅ теперь берётся отдельно
                warehouse: row.warehouse,
                location_key: locationKey,
                total_quantity: 0,
            });
        }

        const item = itemsMap.get(materialNumber)!;
        item.total_quantity += Number(row.quantity ?? 0);
    }

    return Array.from(locationMap.entries()).map(([location_key, items]) => ({
        location: location_key,
        items: Array.from(items.values()),
    }));
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('stock')
            .select(`
        location,
        warehouse,
        quantity,
        location_key,
        material_number,
        item:stock_items_template!material_number(
          description_eng,
          description_orginall,
          avatar_url
        )
      `);

        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch stock data', details: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'No stock data available' },
                { status: 404 }
            );
        }

        const result = groupStockByLocation(data as StockRow[]);

        return NextResponse.json(result, { status: 200 });

    } catch (err) {
        console.error('Unexpected server error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}