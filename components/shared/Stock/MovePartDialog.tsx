import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import React, {useState} from 'react';
import {ArrowLeftRight, Loader} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {getWarehouseLocations} from "@/futures/stock/getWarehouseLocations";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {LocationItem} from "@/types/stock/SummaryItem";
import {useUserStore} from "@/store/user";
import {AddToStock} from "@/futures/stock/AddToStock";
import {toast} from "sonner";
import {AddToStockHistory} from "@/futures/stock/AddToStockHistory";

const MovePartDialog = ({location, part}: { location: string | null, part: LocationItem }) => {
    const user_store = useUserStore(state => state.currentUser)
    const [new_location_value, setNew_location_value] = useState<string>("")

    const [isDialog, setIsDialog] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);

    const {data, isLoading, isError} = useQuery({
        queryKey: ['warehouse_locations'],
        queryFn: () => getWarehouseLocations(part.warehouse),
        retry: 3
    })

    const handleMove = async () => {
        try {
            if (!user_store) throw new Error('User not found')
            if (new_location_value === location) throw new Error('You cant move part to the same location')

            setIsSending(true)

            await AddToStock({
                card_id: user_store.card_id.toString(),
                material_number: part.material_number,
                location: new_location_value,
                warehouse: part.warehouse,
                location_key: `${part.warehouse.toLowerCase()}-${new_location_value.toLowerCase()}`,
                quantity: part.total_quantity.toString()
            })

            await AddToStockHistory({
                card_id: user_store.card_id.toString(),
                material_number: part.material_number,
                location: new_location_value,
                warehouse: part.warehouse,
                quantity: part.total_quantity.toString()
            })

            await fetch(`/api/stock/use-part`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    warehouse: part.warehouse,
                    location: location,
                    material_number: part.material_number,
                    card_id: user_store.card_id,
                    value: part.total_quantity,
                })
            })

            setIsDialog(false)
            setNew_location_value("")
            toast.success('Part moved successfully')
        } catch (error) {
            error && toast.error(error.toString() || 'Error moving part')
            console.error('Error moving part:', error)
        } finally {
            setIsSending(false)
        }
    }


    return (
        <Dialog open={isDialog} onOpenChange={(e) => setIsDialog(e as boolean)}>
            <DialogTrigger asChild>
                <Button className={``} variant={`outline`}><ArrowLeftRight/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Move part</DialogTitle>
                    <DialogDescription>
                        Move stock part from one location to another.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    {isLoading && <div>Loading...</div>}
                    {!data
                        ? <div>Loading...</div>
                        :
                        <Select
                            value={new_location_value}
                            onValueChange={(e) => setNew_location_value(e)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a new location"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Available locations</SelectLabel>
                                    {data.map(location => (
                                        <SelectItem value={location}>{location}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                    }

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button disabled={isSending} variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        disabled={isSending}
                        onClick={handleMove}
                        type="submit"
                    >
                        <div className={`flex items-center gap-2`}>
                            <p>Save changes</p>
                            {isSending && <Loader className={`animate-spin`}/>}
                        </div>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MovePartDialog;