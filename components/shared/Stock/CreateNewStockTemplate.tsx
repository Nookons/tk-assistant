import React, {useState} from 'react';
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {CreateNewTemplate} from "@/futures/stock/createNewTemplate";
import {useUserStore} from "@/store/user";
import {useStockStore} from "@/store/stock";
import dayjs from "dayjs";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {robots_types} from "@/utils/RobotsConsts";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const CreateNewStockTemplate = () => {
    const add_item_template = useStockStore(state => state.add_item_template)
    const user_store = useUserStore(state => state.currentUser)

    const [data, setData] = useState({
        material_number: "",
        description_chinese: "",
        description_english: "",
        robot_match: [] as string[],
        robot_type: ""
    })

    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setData(prev => ({
            ...prev,
            [name]: value
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

    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            if (!user_store) throw new Error('User not found')

            const obj = {
                id: dayjs().valueOf(),
                created_at: dayjs().add(1, 'h').utc().toISOString(),
                updated_at: dayjs().add(1, 'h').utc().toISOString(),
                add_by: user_store.card_id,
                material_number: data.material_number,
                description_orginall: data.description_chinese,
                description_eng: data.description_english,
                part_type: data.robot_type,
                robot_match: data.robot_match,
                avatar_url: '',
            }

            await CreateNewTemplate({data: obj})

            add_item_template(obj)

            setIsOpen(false)
            setData({
                material_number: "",
                description_chinese: "",
                description_english: "",
                robot_match: [] as string[],
                robot_type: ""
            })
        } catch (error) {
            console.error('Error creating template:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`flex gap-4 items-center justify-start`}>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button>Create New</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create template</DialogTitle>
                        <DialogDescription>
                            Create new template for stock item if you don't find it in the list
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 items-center gap-4">
                        <div className={`flex flex-col gap-2`}>
                            <Label>Material Number</Label>
                            <Input
                                name="material_number"
                                value={data.material_number}
                                onChange={handleChange}
                                placeholder="9.03.02.004969"
                            />
                        </div>
                        <div className={`flex flex-col gap-2`}>
                            <Label>Description Chinese</Label>
                            <Input
                                name="description_chinese"
                                value={data.description_chinese}
                                onChange={handleChange}
                                placeholder="光电传感器"
                            />
                        </div>
                        <div className={`flex flex-col gap-2`}>
                            <Label>Description English</Label>
                            <Input
                                name="description_english"
                                value={data.description_english}
                                onChange={handleChange}
                                placeholder="Fork Position Anti-Mistake Sensor"
                            />
                        </div>
                        <div className={`flex flex-col gap-2`}>
                            <Label>Robot Type</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full text-left">
                                        {data.robot_match.length
                                            ? data.robot_match.join(", ")
                                            : "Select robot types"}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-full">
                                    {robots_types.map(robot => (
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
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <p>No results found</p>
        </div>
    );
};

export default CreateNewStockTemplate;