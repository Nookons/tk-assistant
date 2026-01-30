'use client'
import React, {useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";
import {useStockStore} from "@/store/stock";
import {LocationStock} from "@/types/stock/SummaryItem";
import {Item} from "@/components/ui/item";
import {ButtonGroup} from "@/components/ui/button-group";
import {Button} from "@/components/ui/button";
import {ArrowLeftRight, MapPinHouse, Trash2} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {toast} from "sonner";
import MovePartDialog from "@/components/shared/Stock/MovePartDialog";

const Page = () => {
    const searchParams = useSearchParams();

    const location = searchParams.get('location');
    const warehouse = searchParams.get('warehouse');

    const stock_summary = useStockStore(state => state.stock_summary)

    const [cell_data, setCell_data] = useState<LocationStock | null>(null)

    useEffect(() => {
        if (stock_summary) {
            const find_result = stock_summary.find(item => item.location === location)

            if (find_result) {
                setCell_data(find_result);
            }
        }
    }, [stock_summary, warehouse, location]);

    return (
        <div className={`max-w-4xl mx-auto p-4`}>
            <div className={`flex items-center gap-4 mt-6`}>
                <MapPinHouse/>
                <p className={`text-xl font-bold`}>{location}</p>
            </div>
            <div className={`flex flex-col gap-2 mt-4`}>
                {cell_data?.items.map(item => {

                    return (
                        <Item className={`flex justify-between gap-2`} variant={`muted`}
                              key={`${item.material_number}`}>
                            <div className={`max-w-[210px] md:max-w-full`}>
                                <p className={`font-bold`}>({item.total_quantity}) pcs - {item.material_number}</p>
                                <p className={`line-clamp-1`}>{item.description_eng}</p>
                            </div>
                            <ButtonGroup className={``}>

                                <MovePartDialog
                                    location={location}
                                    part={item}
                                />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className={``} variant={`outline`}><Trash2/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete from our
                                                servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => toast.warning(`Doesn't work right now, try again later`)}>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </ButtonGroup>
                        </Item>
                    )
                })}
            </div>
        </div>
    );
};

export default Page;
