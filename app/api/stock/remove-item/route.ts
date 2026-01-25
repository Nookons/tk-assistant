import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id, value, warehouse, material_number, location } = body;

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