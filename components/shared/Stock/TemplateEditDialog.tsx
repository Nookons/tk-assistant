import React, {useEffect, useState} from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Pencil} from "lucide-react";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useMutation} from "@tanstack/react-query";
import {StockService} from "@/services/stockService";
import {toast} from "sonner";
import {useStockStore} from "@/store/stock";
import {parts_types} from "@/utils/RobotsConsts";
import TemplatePhotoChange from "@/components/shared/Stock/TemplatePhotoChange";
import StockPartImage from "@/components/shared/StockPart/StockPartImage";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";

interface props {
    part: IStockItemTemplate;
}

const TemplateEditDialog: React.FC<props> = ({part}) => {
    const update_store = useStockStore(state => state.update_item_template)

    const [data, setData] = useState({
        description_orginall: '',
        description_eng: '',
        robot_match: part.robot_match || [] as string[],
    })

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const setRobotMatch = (robot: string) => {
        if (data.robot_match.includes(robot)) {
            setData((prev) => ({...prev, robot_match: prev.robot_match.filter(el => el !== robot)}))
        } else {
            setData((prev) => ({...prev, robot_match: [...prev.robot_match, robot]}))
        }
    }

    const handleSubmit = useMutation({
        mutationFn: (data: Partial<IStockItemTemplate> & { id: number }) =>
            StockService.updateItemTemplate(data),
        onSuccess: (data) => {
            update_store(data.id.toString(), data)
            toast.success("Template updated successfully!")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    useEffect(() => {
        if (part) {
            setData({
                description_orginall: part.description_orginall,
                description_eng: part.description_eng,
                robot_match: part.robot_match || [] as string[]
            })
        }
    }, [part]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="p-0 m-0" variant="secondary">
                    <Pencil/>
                    <span>Edit part</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[95%] p-4">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit part template</AlertDialogTitle>
                    <AlertDialogDescription>
                        Click on the image to preview or change it.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                    <div className="flex flex-col gap-1">
                        <StockPartImage avatar_url={part.avatar_url}/>
                        <TemplatePhotoChange part={part}/>
                    </div>

                    <div className="grid grid-rows-[auto_auto_1fr] gap-3">
                        <div className="grid gap-1">
                            <Label className="text-muted-foreground text-xs">English</Label>
                            <Input
                                value={data.description_eng}
                                onChange={handleInput}
                                name="description_eng"
                                placeholder={part.description_eng}
                            />
                        </div>

                        {/* Chinese */}
                        <div className="grid gap-1">
                            <Label className="text-muted-foreground text-xs">Chinese</Label>
                            <Input
                                value={data.description_orginall}
                                onChange={handleInput}
                                name="description_orginall"
                                placeholder={part.description_orginall}
                            />
                        </div>

                        {/* Robot types */}
                        <div className="grid gap-1">
                            <Label className="text-muted-foreground text-xs">Robot types</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {data.robot_match.length ? (
                                        <div className="flex flex-wrap gap-1 min-h-9 px-2 py-1.5 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                            {data.robot_match.map((type, index) => (
                                                <Badge key={`${type}-${index}`} variant="secondary">{type}</Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <Button variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                                            Select robot types…
                                        </Button>
                                    )}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    {parts_types.map(robot => (
                                        <DropdownMenuCheckboxItem
                                            key={robot}
                                            checked={data.robot_match.includes(robot)}
                                            onCheckedChange={() => setRobotMatch(robot)}
                                        >
                                            {robot}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleSubmit.mutate({id: part.id, ...data})}
                        disabled={handleSubmit.isPending}
                    >
                        {handleSubmit.isPending ? 'Saving…' : 'Save'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default TemplateEditDialog;