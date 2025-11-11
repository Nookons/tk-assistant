import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {IUser} from "@/types/user/user";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import dayjs from "dayjs";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BrushCleaning} from "lucide-react";

interface IComplain {
    id: number;
    created_at: Timestamp;
    card_id: number;
    type: string;
    description: string;
    add_by: number;
    value: number;
}


const ComplainList = ({user_data} : {user_data: IUser}) => {

    const [data, setData] = useState<IComplain[]>([])

    const getComplainList = async () => {
        try {
            const res = await fetch(`/api/complain/get-employee-complains?card_id=${user_data.card_id}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                }
            });


            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json(); // исправлено
            setData(result);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    }

    useEffect(() => {
        getComplainList()
    }, []);

    if (data.length < 1) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <BrushCleaning />
                    </EmptyMedia>
                    <EmptyTitle>No Complains Yet</EmptyTitle>
                    <EmptyDescription>
                        You haven&apos;t any records yet. When you will be have some you will be see it here.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>

                </EmptyContent>
            </Empty>
        )
    }


    return (
        <Table>
            <TableCaption>A list of your recent Notes.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>WHY</TableHead>
                    <TableHead className="text-right">AMOUNT</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((complain, index) => {

                    return (
                        <TableRow key={complain.id}>
                            <TableCell className="font-medium">{complain.id}</TableCell>
                            <TableCell>{complain.type.toUpperCase()}</TableCell>
                            <TableCell>{dayjs(complain.created_at).format("HH:mm · MMM D, YYYY")}</TableCell>
                            <TableCell>{complain.description}</TableCell>
                            <TableCell className="text-right">{complain.value}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );
};

export default ComplainList;