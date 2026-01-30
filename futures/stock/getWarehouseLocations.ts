
export const getWarehouseLocations = async (warehouse: string): Promise<string[]> => {
    const response = await fetch(`/api/stock/get-warehouse-locations?warehouse=${warehouse}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
}