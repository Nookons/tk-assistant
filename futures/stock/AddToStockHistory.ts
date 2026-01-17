
interface IProps {
    card_id: string;
    material_number: string;
    warehouse: string;
    location: string;
    value: string;
}

export const AddToStockHistory = async ({card_id, material_number, location, warehouse, value}: IProps) => {
    const res = await fetch(`/api/stock/add-to-stock-history`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            add_by: card_id,
            material_number,
            value,
            warehouse,
            location
        })
    });

    if (!res.ok) {
        throw new Error(`Could not create template. (status: ${res.status})`);
    }

    return await res.json();
};