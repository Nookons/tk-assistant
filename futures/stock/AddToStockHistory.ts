
interface IProps {
    card_id: string;
    material_number: string;
    warehouse: string;
    location: string;
    quantity: number;
}

export const AddToStockHistory = async ({data}: {data: IProps}) => {
    const res = await fetch(`/api/stock/add-to-stock-history`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            add_by: data.card_id,
            material_number: data.material_number,
            quantity: data.quantity,
            warehouse: data.warehouse,
            location: data.location
        })
    });

    if (!res.ok) {
        throw new Error(`Could not create template. (status: ${res.status})`);
    }

    return await res.json();
};