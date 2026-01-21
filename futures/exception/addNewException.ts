import {ILocalIssue} from "@/app/exceptions-parsing/page";

export const addNewException = async ({data}: {data: ILocalIssue}) => {
    if (!data) return;

    const res = await fetch(`/api/exception/add-new-exception`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            add_by: data.add_by,
            device_type: data.device_type,
            employee: data.employee,
            error_end_time: data.error_end_time,
            error_robot: data.error_robot,
            error_start_time: data.error_start_time,
            first_column: data.first_column,
            issue_description: data.issue_description,
            issue_type: data.issue_type,
            shift_type: data.shift_type,
            recovery_title: data.recovery_title,
            second_column: data.second_column,
            solving_time: data.solving_time,
            uniq_key: data.uniq_key
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to add robot');
    }

    await fetch(`/api/user/update-user-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            card_id: data.add_by,
            value: 0.01,
        })
    })

    return await res.json(); // если хочешь вернуть данные
}