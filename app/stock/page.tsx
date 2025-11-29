"use client"
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import React, {useState} from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {useUserStore} from "@/store/user";
import {FilePlusCorner, Loader} from "lucide-react";
import {toast} from "sonner";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";


const Page = () => {
    const [part_number, setPart_number] = useState<string>("")
    const [description_chinese, setDescription_chinese] = useState<string>("")
    const [description_eng, setDescription_eng] = useState<string>("")

    const [part_type, setPart_type] = useState<string>("A42T")

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const user = useUserStore(state => state.current_user)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true)
        console.log(part_type);
        console.log(user);

        if (!user) return;

        console.log(part_type);

        try {
            const res = await fetch(`/api/stock/create-template`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    card_id: user.card_id,
                    material_number: part_number || null,
                    description_orginall: description_chinese || null,
                    description_eng: description_eng || null,
                    part_type: part_type || null,
                })
            })

            await res.json()

            if (res.ok) {
                toast.success("Item template created successfully!")
                setPart_number("")
                setDescription_chinese("")
                setDescription_eng("")
            } else {
                toast.error(res.statusText.toString() || "Failed to create item template")
            }

        } catch (error) {
            toast.error("Failed to create item template")
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`px-4`}>
            <Dialog>
                <form>
                    <DialogTrigger asChild>
                        <Button variant="outline">Create New Item</Button>
                    </DialogTrigger>
                    <DialogContent className="">
                        <DialogHeader>
                            <DialogTitle>Create Item</DialogTitle>
                            <DialogDescription>
                                Create new item template for stocking. Fill in the form below to create a new item template.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="part-1">Part Number</Label>
                                <Input
                                    value={part_number}
                                    onChange={(e) => setPart_number(e.target.value)}
                                    id="part-1"
                                    name="part_number"
                                    placeholder={`1.04.04.000176`}
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="part-1">For what this part</Label>
                                <Select value={part_type} onValueChange={(value) => setPart_type(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a type for what this part" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Robot type</SelectLabel>
                                            <SelectItem value="A42T">A42T</SelectItem>
                                            <SelectItem value="K50H">K50H</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description-1">Description Chinese</Label>
                                <Textarea
                                    value={description_chinese}
                                    onChange={(e) => setDescription_chinese(e.target.value)}
                                    id="description-1"
                                    name="description"
                                    placeholder="底盘前后急停开关"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description-1">Description ENG</Label>
                                <Textarea
                                    value={description_eng}
                                    onChange={(e) => setDescription_eng(e.target.value)}
                                    id="description-1"
                                    name="description"
                                    placeholder="FRONT AND REAR EMERGENCY STOP SWITCHES"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button disabled={isLoading} onClick={(e: any) => handleSubmit(e)} type="submit">
                                {isLoading ? <Loader className={`animate-spin`} /> : <FilePlusCorner />}
                                 Create Item
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>
    );
};

export default Page;