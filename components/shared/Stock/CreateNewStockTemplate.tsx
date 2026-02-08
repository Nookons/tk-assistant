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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {CreateNewTemplate} from "@/futures/stock/createNewTemplate";
import {useUserStore} from "@/store/user";
import {useStockStore} from "@/store/stock";
import dayjs from "dayjs";

const CreateNewStockTemplate = () => {
    const add_item_template = useStockStore(state => state.add_item_template)
    const user_store = useUserStore(state => state.currentUser)

    const [data, setData] = useState({
        material_number: "",
        description_chinese: "",
        description_english: "",
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

    const handleSelectChange = (value: string) => {
        setData(prev => ({
            ...prev,
            robot_type: value
        }))
    }

    const handleSubmit = async () => {
        // Ваш код для отправки данных
        setIsLoading(true)
        try {
            if (!user_store) throw new Error('User not found')

            const obj = {
                card_id: user_store.card_id.toString(),
                material_number: data.material_number,
                description_orginall: data.description_chinese,
                description_eng: data.description_english,
                part_type: data.robot_type,
                robot_match: [data.robot_type],
            }

            await CreateNewTemplate(obj)

            const obj_extend = {
                id: dayjs().valueOf(),
                created_at: dayjs().valueOf(),
                updated_at: dayjs().valueOf(),
                add_by: Number(obj.card_id),
                user: user_store,
                avatar_url: '',
                ...obj,
            }

            add_item_template(obj_extend)
            setIsOpen(false)
            setData({
                material_number: "",
                description_chinese: "",
                description_english: "",
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
                            <Select value={data.robot_type} onValueChange={handleSelectChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Types</SelectLabel>
                                        <SelectItem value="K50H">K50H</SelectItem>
                                        <SelectItem value="A42T">A42T</SelectItem>
                                        <SelectItem value="P1200">P1200</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
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