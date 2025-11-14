'use client'
import React, {useEffect, useState} from 'react';
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import dayjs from "dayjs";
import {IShift} from "@/types/shift/shift";


const EmployeeStats = ({ shifts }: { shifts: IShift[] }) => {
    const [rt_kubot, setRt_kubot] = useState<number>(0);
    const [rt_kubot_mini, setRt_kubot_mini] = useState<number>(0);
    const [rt_kubot_e2, setRt_kubot_e2] = useState<number>(0);
    const [abnormal_locations, setAbnormal_locations] = useState<number>(0);
    const [abnormal_cases, setAbnormal_cases] = useState<number>(0);

    useEffect(() => {
        if (shifts && shifts.length) {

            const total_rt_kubot = shifts.reduce(
                (sum, item) => sum + Number(item.rt_kubot_exc || 0),
                0
            );
            const total_rt_kubot_mini = shifts.reduce(
                (sum, item) => sum + Number(item.rt_kubot_mini || 0),
                0
            );
            const total_rt_kubot_e2 = shifts.reduce(
                (sum, item) => sum + Number(item.rt_kubot_e2 || 0),
                0
            );
            const total_abnormal_locations = shifts.reduce(
                (sum, item) => sum + Number(item.abnormal_locations || 0),
                0
            );
            const total_abnormal_cases = shifts.reduce(
                (sum, item) => sum + Number(item.abnormal_cases || 0),
                0
            );

            setRt_kubot(total_rt_kubot);
            setRt_kubot_mini(total_rt_kubot_mini)
            setRt_kubot_e2(total_rt_kubot_e2)
            setAbnormal_locations(total_abnormal_locations)
            setAbnormal_cases(total_abnormal_cases)
        } else {
            setRt_kubot(0);
        }
    }, [shifts]);



    if (!shifts) return null;

    return (
        <div>
            <p className={`text-neutral-500 text-xs`}>Last Record: {dayjs(shifts[0]?.created_at).format('HH:mm · MMM D, YYYY') || "None"}</p>
            <div className={`flex flex-wrap gap-4 mt-4`}>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{rt_kubot}</ItemTitle>
                        <ItemDescription>
                            RT KUBOT
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{rt_kubot_mini}</ItemTitle>
                        <ItemDescription>
                            RT KUBOT MINI
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{rt_kubot_e2}</ItemTitle>
                        <ItemDescription>
                            RT KUBOT E2
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{abnormal_locations}</ItemTitle>
                        <ItemDescription>
                            Abnormal Location
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{abnormal_cases}</ItemTitle>
                        <ItemDescription>
                            Abnormal case
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </div>
        </div>
    );
};

export default EmployeeStats;