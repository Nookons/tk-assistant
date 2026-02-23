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
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {BellPlus, ChevronDownIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Textarea} from "@/components/ui/textarea";
import {useUserStore} from "@/store/user";
import {getWorkDate} from "@/futures/date/getWorkDate";
import dayjs from "dayjs";
import {addNotes} from "@/futures/important/addNotes";
import {toast} from "sonner";

const Important = () => {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(getWorkDate(dayjs().toDate()))

    const [isDialog, setIsDialog] = useState<boolean>(false);

    const [note_value, setNote_value] = useState<string>('')

    const user_store = useUserStore(state => state.currentUser)

    const addImportantNote = async () => {
        try {
            if (!user_store) return

            const add_by = user_store.card_id
            const date =  dayjs().toDate()

            const res = await addNotes({add_by: add_by, date: date, note: note_value})

            if (res) {
                setNote_value('')
                toast.success("Important note added successfully")
            }

        } catch (err) {

        } finally {
            setIsDialog(false)
        }
    }

    return (
        <div>
            <Dialog open={isDialog} onOpenChange={(e) => setIsDialog(e as boolean)}>
                <form>
                    <DialogTrigger asChild>
                        <Button className={`w-full`}>
                            <BellPlus />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Important note</DialogTitle>
                            <DialogDescription>
                                Please provide here the important notes for everyone to see.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="date" className="px-1">
                                    Date for important note
                                </Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full justify-between font-normal"
                                        >
                                            {date ? date.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            className="w-full"
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setDate(date)
                                                setOpen(false)
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="name-1">Notes</Label>
                                <Textarea
                                    id="name-1"
                                    name="name"
                                    placeholder="Notes"
                                    value={note_value}
                                    onChange={(e) => setNote_value(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={() => addImportantNote()} type="submit">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>
    );
};

export default Important;