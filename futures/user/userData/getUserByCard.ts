import {IUser} from "@/types/user/user";

export const getUserByCard = async (card: string): Promise<IUser> => {
    const res = await fetch(`/api/user/get-user-by-card?card_id=${card}`);

    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}