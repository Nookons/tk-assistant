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
            const newData = data.robot_match.filter(el => el !== robot)
            setData((prev) => ({...prev, robot_match: newData}))
        } else {
            setData((prev) => ({
                ...prev,
                robot_match: [...prev.robot_match, robot]
            }))
        }
    }

    const handleSubmit = useMutation({
        mutationFn: (data: Partial<IStockItemTemplate> & { id: number }) =>
            StockService.updateItemTemplate(data),
        onSuccess: (data) => {
            console.log(data);
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
                <Button className={`p-0 m-0`} variant="ghost"><Pencil/></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>This is edit dialog for part</AlertDialogTitle>
                    <AlertDialogDescription>
                        If you want to change picture for item, please click directly on picture of part
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className={`grid md:grid-cols-[125px_1fr] gap-2`}>
                    <div className={``}>
                        <StockPartImage avatar_url={part.avatar_url}/>
                        <TemplatePhotoChange part={part}/>
                    </div>
                    <div className={`flex flex-col gap-2`}>
                        <div className={`flex items-center md:grid md:grid-cols-[1fr_75px] gap-2`}>
                            <Input
                                value={data.description_eng}
                                onChange={(e) => handleInput(e)}
                                name={`description_eng`}
                                type="text" placeholder={part.description_eng}
                            />
                            <Label>English</Label>
                        </div>
                        <div className={`flex items-center md:grid md:grid-cols-[1fr_75px] gap-2`}>
                            <Input
                                value={data.description_orginall}
                                onChange={(e) => handleInput(e)}
                                name={`description_orginall`}
                                type="text" placeholder={part.description_orginall}
                            />
                            <Label>Chinese</Label>
                        </div>

                        <div className={`relative flex items-center md:grid md:grid-cols-[1fr_75px] gap-2`}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="w-full rounded-md">
                                        {data.robot_match.length
                                            ?
                                            <div className={`flex gap-1 p-1.5 border-2 rounded-md cursor-pointer`}>
                                                {data.robot_match.map((type) => (
                                                    <Badge>{type}</Badge>
                                                ))}
                                            </div>
                                            :
                                            <Button className={`w-full`}>Select robot types</Button>
                                        }
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-full">
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
                            <Label>Types</Label>
                        </div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() =>
                            handleSubmit.mutate({
                                id: part.id,
                                ...data
                            })
                        }
                    >
                        Save
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default TemplateEditDialog;