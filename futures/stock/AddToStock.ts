
interface IProps {
    card_id: string;
    material_number: string;
    warehouse: string;
    quantity: string;
    location: string;
}

export const AddToStock = async ({card_id, material_number, location, warehouse, quantity}: IProps) => {
    const res = await fetch(`/api/stock/add-to-stock`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            card_id,
            material_number,
            warehouse,
            location,
            quantity
        })
    });

    if (!res.ok) {
        throw new Error(`Could not create template. (status: ${res.status})`);
    }

    return await res.json();
};