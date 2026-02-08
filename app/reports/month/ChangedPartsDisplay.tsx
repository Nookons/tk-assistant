import React, {useEffect, useState} from 'react';
import {useRobotsStore} from "@/store/robotsStore";
import dayjs from "dayjs";
import {useStockStore} from "@/store/stock";
import {Item} from "@/components/ui/item";
import {timeToString} from "@/utils/timeToString";
import {IMonthParts} from "@/app/reports/month/page";


const ChangedPartsDisplay = ({date, setChanged_parts_data}: {date: Date | null, setChanged_parts_data: (data: IMonthParts[]) => void}) => {
    const robots_store = useRobotsStore(state => state.robots)
    const parts_templates_store = useStockStore(state => state.items_templates)

    const [month_parts, setMonth_parts] = useState<IMonthParts[]>([])

    useEffect(() => {
        setMonth_parts([]);

        if (robots_store) {
            for (const robot of robots_store) {
                if (robot.parts_history.length > 0) {

                    for (const part of robot.parts_history) {
                        if (dayjs(part.created_at).format("YYYY-MM") !== dayjs(date).format("YYYY-MM")) continue;

                        const changed_parts = JSON.parse(part.parts_numbers)

                        if (changed_parts) {
                            for (const solo_part of changed_parts) {
                                const part_template = parts_templates_store?.find(item => item.material_number === solo_part)
                                const obj = {
                                    ...part,
                                    parts_numbers: solo_part,
                                    part_description: part_template?.description_eng || "None"
                                }

                                setMonth_parts(prev => [...prev, obj])
                            }
                        }
                    }
                }
            }
        }
    }, [robots_store, date]);

    useEffect(() => {
        setChanged_parts_data([])
        if (month_parts.length > 0) setChanged_parts_data(month_parts)
    }, [month_parts, robots_store, parts_templates_store]);

    return (
        <div>
            <article className={`font-bold text-xl`}>Parts was changed: ({month_parts.length})</article>

            {month_parts.map((part, index) => {

                return (
                    <Item variant={`muted`} key={part.id} className={`flex flex-col gap-2 items-start w-full mt-4`}>
                        <div className={`flex w-full flex-wrap justify-between gap-2`}>
                            <p className={`text-muted-foreground text-xs`}>{timeToString(part.created_at)}</p>
                            <p className={`text-muted-foreground text-xs`}>{part.user.user_name}</p>
                        </div>
                        <div className={`flex w-full flex-wrap justify-between gap-2`}>
                            <p className={`font-bold text-base`}>{part.parts_numbers}</p>
                            <p className={`font-bold text-base`}>{part.part_description}</p>
                            <p className={`font-bold text-base`}>{part.robot.robot_number}</p>
                            <p className={`font-bold text-base`}>{part.robot.robot_type}</p>
                        </div>
                    </Item>
                )
            })}
        </div>
    );
};

export default ChangedPartsDisplay;