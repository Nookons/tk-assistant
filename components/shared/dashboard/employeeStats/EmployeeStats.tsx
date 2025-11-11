'use client'
import React, {useEffect, useState} from 'react';
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {Item, ItemActions, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import dayjs from "dayjs";
import {Button} from "@/components/ui/button";
import {ParamValue} from "next/dist/server/request/params";

interface ILocalStats {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    rt_kubot_exc: number;
    rt_kubot_mini: number;
    rt_kubot_e2: number;
    abnormal_locations: number;
    abnormal_cases: number;
    card_id: number
}

const EmployeeStats = ({card_id, score} : {card_id: ParamValue, score: number}) => {
    const [data, setData] = useState<ILocalStats | null>(null)

    const getStatsData = async () => {
        try {
            const res = await fetch(`/api/user/get-employee-stats?card_id=${card_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (res.status !== 200) {
                throw new Error("Something went wrong!");
            }

            const result = await res.json()
            setData(result);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
       if (card_id) {
           getStatsData()
       }
    }, [card_id]);

    const min = -100;
    const max = 100;
    const value = score;
    const percent = ((value - min) / (max - min)) * 100; // преобразуем в 0–100%

    return (
        <div>
            <p className={`text-neutral-500 text-xs`}>Last Record: {dayjs(data?.updated_at).format('HH:mm · MMM D, YYYY') || "None"}</p>
            <div className={`flex flex-wrap gap-4 mt-4`}>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>
                            <div className="relative h-2 w-64 bg-foreground rounded-full overflow-hidden">
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.25 bg-gray-400"/>
                                    Центр
                                <div
                                    className={`absolute top-0 h-full ${
                                        value >= 0 ? "bg-green-500" : "bg-red-500"
                                    }`}
                                    style={{
                                        left: value >= 0 ? "50%" : `${percent}%`,
                                        width: `${Math.abs(percent - 50)}%`,
                                    }}
                                />
                            </div>
                            </ItemTitle>
                        <ItemDescription>
                            <p className="text-sm text-right mt-1">{value > 0 ? `+${value}` : value}</p>
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{data?.rt_kubot_exc.toLocaleString()}</ItemTitle>
                        <ItemDescription>
                            RT KUBOT
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{data?.rt_kubot_mini.toLocaleString()}</ItemTitle>
                        <ItemDescription>
                            RT KUBOT MINI
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{data?.rt_kubot_e2.toLocaleString()}</ItemTitle>
                        <ItemDescription>
                            RT KUBOT E2
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{data?.abnormal_locations.toLocaleString()}</ItemTitle>
                        <ItemDescription>
                            Abnormal Location
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="muted">
                    <ItemContent>
                        <ItemTitle>{data?.abnormal_cases.toLocaleString()}</ItemTitle>
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