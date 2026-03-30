import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {IUserSession} from "@/types/Session/Session";

export const getAllStockHistory = async (session: IUserSession | null): Promise<IHistoryStockItem[]> => {
    if (!session) throw new Error("Session not found");

    const res = await fetch(`/api/stock/get-stock-history?warehouse=${session.warehouse.title}`);

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
}