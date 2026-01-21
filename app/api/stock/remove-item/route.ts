import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id, value, warehouse, material_number } = body;

        if (!id || !material_number || !warehouse || value === undefined) {
            return NextResponse.json({
                error: 'id, value, warehouse, and material_number are required'
            }, { status: 400 });
        }

        // 1. Удаляем запись из stock_history
        const { data: deletedData, error: deleteError } = await supabase
            .from('stock_history')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return NextResponse.json({
                error: 'Failed to delete from stock_history'
            }, { status: 500 });
        }

        // 2. Ищем материал во второй таблице (предположим, что это 'stock')
        const { data: stockData, error: findError } = await supabase
            .from('stock')  // замените на название вашей таблицы
            .select('*')
            .eq('material_number', material_number)
            .eq('warehouse', warehouse)
            .single();

        if (findError && findError.code !== 'PGRST116') {  // PGRST116 = not found
            console.error('Find error:', findError);
            return NextResponse.json({
                error: 'Failed to find stock item'
            }, { status: 500 });
        }

        // 3. Если нашли материал, отнимаем значение
        if (stockData) {
            const newValue = stockData.quantity - value;

            const { error: updateError } = await supabase
                .from('stock')  // замените на название вашей таблицы
                .update({ quantity: newValue })
                .eq('material_number', material_number)
                .eq('warehouse', warehouse);

            if (updateError) {
                console.error('Update error:', updateError);
                return NextResponse.json({
                    error: 'Failed to update stock value'
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                deleted: deletedData,
                updated: { material_number, warehouse, oldValue: stockData.value, newValue }
            }, { status: 200 });
        }

        // Если материал не найден во второй таблице
        return NextResponse.json({
            success: true,
            deleted: deletedData,
            message: 'Stock item not found, only deleted from history'
        }, { status: 200 });

    } catch (err: any) {
        console.error('Server error:', err);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: err.message
        }, { status: 500 });
    }
}