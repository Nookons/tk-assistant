import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { StockByLocationResponse, LocationItem } from '@/types/stock/SummaryItem';

// Type for raw Supabase response
interface StockRow {
    location: string;
    warehouse: string;
    quantity: number;
    location_key: string;
    material_number: string;
    item: {
        description_eng: string;
    } | Array<{ description_eng: string }>;
}

// Constants
const UNKNOWN_LOCATION = 'unknown';

/**
 * Extract description from item field (handles both object and array formats)
 */
function extractDescription(item: StockRow['item']): string {
    if (Array.isArray(item) && item.length > 0) {
        return item[0]?.description_eng ?? '';
    }
    return (item as { description_eng: string })?.description_eng ?? '';
}

/**
 * Group stock data by location and material
 */
function groupStockByLocation(data: StockRow[]): StockByLocationResponse {
    const locationMap = new Map<string, Map<string, LocationItem>>();

    for (const row of data) {
        const locationKey = row.location_key ?? UNKNOWN_LOCATION;

        // Initialize location map if needed
        if (!locationMap.has(locationKey)) {
            locationMap.set(locationKey, new Map());
        }

        const itemsMap = locationMap.get(locationKey)!;
        const materialNumber = row.material_number;

        // Initialize material entry if needed
        if (!itemsMap.has(materialNumber)) {
            itemsMap.set(materialNumber, {
                material_number: materialNumber,
                description_eng: extractDescription(row.item),
                warehouse: row.warehouse,
                location_key: locationKey,
                total_quantity: 0,
            });
        }

        // Accumulate quantity
        const item = itemsMap.get(materialNumber)!;
        item.total_quantity += Number(row.quantity ?? 0);
    }

    // Transform to response format
    return Array.from(locationMap.entries()).map(([location_key, items]) => ({
        location: location_key,
        items: Array.from(items.values()),
    }));
}

/**
 * GET /api/stock-by-location
 * Retrieves stock data grouped by location and material
 */
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
          description_eng
        )
      `);

        // Handle Supabase errors
        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch stock data', details: error.message },
                { status: 500 }
            );
        }

        // Check if data exists
        if (!data || data.length === 0) {
            return NextResponse.json(
                { message: 'No stock data available' },
                { status: 404 }
            );
        }

        // Group and format data
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