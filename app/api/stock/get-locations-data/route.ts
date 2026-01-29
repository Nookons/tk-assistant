import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import {StockByLocationResponse} from "@/types/stock/SummaryItem";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('stock')
            .select(`
        location,
        warehouse,
        quantity,
        material_number,
        item:stock_items_template!material_number(
          description_eng
        )
      `);

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'No data found' }, { status: 404 });
        }

        const locationMap = new Map<string, Map<string,
            {
                material_number: string;
                description_eng: string | null;
                total_quantity: number;
                warehouse: string;
            }>
        >();

        for (const row of data) {
            if (!locationMap.has(row.location)) {
                locationMap.set(row.location, new Map());
            }

            const itemsMap = locationMap.get(row.location)!;
            const key = row.material_number;

            if (!itemsMap.has(key)) {
                // Handle the case where item is an array
                const description = Array.isArray(row.item) && row.item.length > 0
                    ? row.item[0].description_eng
                    : (row.item as any)?.description_eng;

                itemsMap.set(key, {
                    material_number: key,
                    description_eng: description,
                    warehouse: row.warehouse,
                    total_quantity: 0
                });
            }

            itemsMap.get(key)!.total_quantity += row.quantity;
        }

        const result: StockByLocationResponse = Array.from(locationMap.entries()).map(
            ([location, items]) => ({
                location,
                items: Array.from(items.values()).map(item => ({
                    material_number: item.material_number,
                    description_eng: item.description_eng ?? '',
                    total_quantity: item.total_quantity,
                    warehouse: item.warehouse
                }))
            })
        );

        return NextResponse.json(result, { status: 200 });

    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}