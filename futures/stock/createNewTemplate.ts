import React from "react";

interface IProps {
    card_id: string;
    material_number: string;
    description_orginall: string;
    description_eng: string;
    part_type: string;
}

export const CreateNewTemplate = async ({card_id, material_number, description_orginall, description_eng, part_type}: IProps) => {
    const res = await fetch(`/api/stock/create-template`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            card_id,
            material_number,
            description_orginall,
            description_eng,
            part_type
        })
    });

    if (!res.ok) {
        throw new Error(`Could not create template. (status: ${res.status})`);
    }

    return await res.json();
};