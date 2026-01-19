import {IChangeRecord} from "@/types/Parts/ChangeRecord";

export const getAllChangedParts = async (): Promise<IChangeRecord[]> => {
    const res = await fetch(`/api/parts/get-all-changed-parts`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Could not get all shifts (status: ${res.status})`);
    }

    return await res.json();
};
