import {ParamValue} from "next/dist/server/request/params";

interface ILocalData {
    card_id: ParamValue;
    robot_number: string;
    robot_type: string;
    type_problem: string[];
    problem_note: string;
}

export const addRobotToMaintenance = async (robot_data: ILocalData) => {
    if (!robot_data.robot_number) return;
    if (!robot_data.robot_type) return;
    if (!robot_data.type_problem) return;

    const res = await fetch(`/api/robots/add-robot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(robot_data),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    await fetch(`/api/user/update-user-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id: robot_data.card_id,
            value: 0.1,
        })
    })

    return await res.json(); // если хочешь вернуть данные
};
