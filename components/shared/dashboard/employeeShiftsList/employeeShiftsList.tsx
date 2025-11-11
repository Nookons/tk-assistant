import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BrushCleaning} from "lucide-react";
import {ParamValue} from "next/dist/server/request/params";

interface ILocalShift {
    id: number;
    created_at: Timestamp;
    shift_type: string;
    employee_name: string;
    card_id: number;
    rt_kubot_exc: number;
    rt_kubot_mini: number;
    rt_kubot_e2: number;
    abnormal_locations: number;
    abnormal_cases: number;
    shift_date: string;
}

const EmployeeShiftsList = ({card_id}: { card_id: ParamValue }) => {

    const [data, setData] = useState<ILocalShift[] | null>(null)

    const getStatsData = async () => {
        try {
            const res = await fetch(`/api/user/get-employee-shifts?card_id=${card_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (res.status !== 200) {
                throw new Error("Something went wrong!");
            }

            const result = await res.json()
            const reversed = result.reverse()
            setData(reversed);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (card_id) {
            getStatsData()
        }
    }, [card_id]);

    if (!data || data.length < 1) return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <BrushCleaning/>
                </EmptyMedia>
                <EmptyTitle>No Shifts Yet</EmptyTitle>
                <EmptyDescription>
                    You haven&apos;t any records yet. When you will be have some you will be see it here.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>

            </EmptyContent>
        </Empty>
    );

    return (
        <Table>
            <TableCaption>A list of your recent Shifts.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>N</TableHead>
                    <TableHead>Shift Type</TableHead>
                    <TableHead>Shift Date</TableHead>
                    <TableHead>RT KUBOT</TableHead>
                    <TableHead>RT KUBOT MINI</TableHead>
                    <TableHead>RT KUBOT E2</TableHead>
                    <TableHead>Abnormal Locations</TableHead>
                    <TableHead>Abnormal Cases</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.slice(0,20).map((shift, index) => {

                    return (
                        <TableRow key={shift.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{shift.shift_type.toUpperCase()}</TableCell>
                            <TableCell className="font-medium">{dayjs(shift.shift_date).format('MMM D, YYYY')}</TableCell>
                            <TableCell className="font-medium">{shift.rt_kubot_exc.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{shift.rt_kubot_mini.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{shift.rt_kubot_e2.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{shift.abnormal_locations.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">{shift.abnormal_cases.toLocaleString()}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );
};

export default EmployeeShiftsList;