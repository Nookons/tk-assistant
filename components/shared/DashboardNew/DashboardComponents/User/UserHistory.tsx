import React, {useEffect, useState} from 'react';
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {BicepsFlexed} from "lucide-react";
import {IUser} from "@/types/user/user";
import {UserService} from "@/services/userService";
import {IHistoryStockItem} from "@/types/stock/HistoryStock";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {timeToString} from "@/utils/timeToString";
import dayjs from "dayjs";

const UserHistory = ({user}:{user: IUser}) => {
    const [combined_data, setCombined_data] = useState<IHistoryStockItem[]>([])

    const getStockHistory = async () => {
        try {
            const response = await UserService.getUserStockHistory(user)
            if (response) {
                const sorted = response.sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
                setCombined_data(sorted)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getStockHistory();
    }, []);

    if (!combined_data.length) {
        return (
            <Empty className="h-full bg-muted/30">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <BicepsFlexed />
                    </EmptyMedia>
                    <EmptyTitle>User History</EmptyTitle>
                    <EmptyDescription className="max-w-xs text-pretty">
                        Your history is currently in working... soon it will be here
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Robot</TableHead>
                        <TableHead>Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combined_data.slice(0, 20).map((item, i) => {
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{timeToString(item.created_at.valueOf())}</TableCell>
                                <TableCell className="font-medium">{item.warehouse}</TableCell>
                                <TableCell className="font-medium">{item.location}</TableCell>
                                <TableCell className="font-medium">{item?.robot_data?.robot_number || "-"}</TableCell>
                                <TableCell className={`font-medium ${item.quantity > 0 ? "text-green-500" : "text-red-500"}`}>{item.quantity}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default UserHistory;