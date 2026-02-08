import {IStockItemTemplate} from "@/types/stock/StockItem";

interface IProps {
   data: IStockItemTemplate;
}

export const CreateNewTemplate = async ({data}: IProps) => {
    console.log(data);

    const res = await fetch(`/api/stock/create-template`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...data
        })
    });

    if (!res.ok) {
        throw new Error(`Could not create template. (status: ${res.status})`);
    }

    return await res.json();
};