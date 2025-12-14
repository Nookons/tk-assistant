import React, {useEffect, useState} from 'react';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import dayjs from "dayjs";
import {IShift} from "@/types/shift/shift";
import {Button} from "@/components/ui/button";
import {BrushCleaning, Trash2} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import {removeShift} from "@/futures/shifts/removeShift";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {ShiftsChart} from "@/components/shared/dashboard/employeeShiftsList/ShiftChart";



const ShiftsList = ({data, list_type}: { data: IShift[], list_type: string}) => {
    const [shifts, setShifts] = useState<IShift[]>([...data].sort((a, b) => dayjs(b.shift_date).valueOf() - dayjs(a.shift_date).valueOf()));

    const [shift_type, setShift_type] = useState<string>('all')
    const [sorted_data, setSorted_data] = useState<IShift[]>([])

    const deleteShiftMutation = useMutation({
        mutationFn: async (shift_id: number) => removeShift(shift_id),
        onSuccess: (_, shift_id) => {
            setSorted_data(prev => prev.filter(s => s.id !== shift_id));
        },
    });

    const removeHandle = (shift: IShift) => {
        deleteShiftMutation.mutate(shift.id);
    };

    useEffect(() => {
        if (shifts) {
            if (shift_type !== 'all') {
                const filtered = shifts.filter(shift => shift.shift_type === shift_type)
                setSorted_data(filtered)
            } else {
                setSorted_data(shifts)
            }
        }
    }, [shift_type]);

    if (sorted_data.length < 1) {
        return (
            <div className={`w-full`}>
                <div className={`mb-4`}>
                    <Tabs onValueChange={(value) => setShift_type(value)}  defaultValue="account" className="max-w-[200px]">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="night">Night</TabsTrigger>
                        </TabsList>
                        <TabsContent className={`text-neutral-500 text-xs p-1`} value="all">All shifts</TabsContent>
                        <TabsContent className={`text-neutral-500 text-xs p-1`} value="day">Only day shifts</TabsContent>
                        <TabsContent className={`text-neutral-500 text-xs p-1`} value="night">Only night shifts</TabsContent>
                    </Tabs>
                </div>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <BrushCleaning />
                        </EmptyMedia>
                        <EmptyTitle>No any record Yet</EmptyTitle>
                        <EmptyDescription>
                            You haven&apos;t any records yet. When you will be have some you will be see it here.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>

                    </EmptyContent>
                </Empty>
            </div>
        )
    }

    return (
        <div>
            <div className={`mb-6`}>
                <ShiftsChart
                    data={sorted_data}
                    setShift_type={setShift_type}
                />
            </div>
            <Table>
                <TableCaption>A list of your recent Shifts.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>N</TableHead>
                        <TableHead>Shift Type</TableHead>
                        <TableHead>Shift Date</TableHead>
                        <TableHead>Employee name</TableHead>
                        <TableHead>RT KUBOT</TableHead>
                        <TableHead>RT KUBOT MINI</TableHead>
                        <TableHead>RT KUBOT E2</TableHead>
                        <TableHead>Abnormal Locations</TableHead>
                        <TableHead>Abnormal Cases</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted_data.slice(0, 55).map((shift, index) => (
                        <TableRow key={shift.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{shift.shift_type.toUpperCase()}</TableCell>
                            <TableCell className="font-medium">{dayjs(shift.shift_date).format('MMM D, YYYY')}</TableCell>
                            <TableCell className="font-medium">{shift.employee_name}</TableCell>
                            <TableCell className="font-medium">{new Intl.NumberFormat().format(shift.rt_kubot_exc)}</TableCell>
                            <TableCell className="font-medium">{new Intl.NumberFormat().format(shift.rt_kubot_mini)}</TableCell>
                            <TableCell className="font-medium">{new Intl.NumberFormat().format(shift.rt_kubot_e2)}</TableCell>
                            <TableCell className="font-medium">{new Intl.NumberFormat().format(shift.abnormal_locations)}</TableCell>
                            <TableCell className="font-medium">{new Intl.NumberFormat().format(shift.abnormal_cases)}</TableCell>
                            <TableCell className="font-medium">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive"><Trash2 /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete and remove from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeHandle(shift)}
                                            >
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};


export default ShiftsList;