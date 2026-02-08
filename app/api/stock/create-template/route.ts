import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { IStockItemTemplate } from '@/types/stock/StockItem';

export async function POST(request: Request) {
    try {
        const templateData: Partial<IStockItemTemplate> = await request.json();

        const filteredData = Object.fromEntries(
            Object.entries(templateData).filter(([_, v]) => v !== undefined)
        );

        // Просто добавляем add_by, который реально есть
        const insertData = {
            ...filteredData,
        };

        const { data, error } = await supabase
            .from('stock_items_template')
            .insert(insertData)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data?.[0] ?? null }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
