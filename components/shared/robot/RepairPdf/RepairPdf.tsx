import React, { useState } from 'react'
import { Wrench, Plus, Minus, FileText, Search, Trash2, X, User, ChevronsUpDown, Check } from 'lucide-react'
import {
    Drawer, DrawerClose, DrawerContent, DrawerFooter,
    DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Command, CommandEmpty, CommandGroup,
    CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSessionStore } from '@/store/session'
import { useStockStore } from '@/store/stock'
import { IStockItemTemplate } from '@/types/stock/StockItem'
import { IRobot } from '@/types/robot/robot'
import StockPartImage from '@/components/shared/StockPart/StockPartImage'
import { generateRepairPdf } from './generateRepairPdf'
import { useQuery } from '@tanstack/react-query'
import { getEmployeesList } from '@/futures/user/getEmployees'
import '@/utils/fonts/NotoSansSC-Regular-normal'
import {IUser} from "@/types/user/user";

interface PickedPart {
    part: IStockItemTemplate
    qty: number
}

const RepairPdf = ({ robot }: { robot: IRobot }) => {
    const session     = useSessionStore(state => state.currentSession)
    const spare_parts = useStockStore(state => state.items_templates)

    const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['employees_display'],
        queryFn: () => getEmployeesList(),
        retry: 1,
    })

    const [search, setSearch]             = useState('')
    const [pickedParts, setPickedParts]   = useState<PickedPart[]>([])
    const [noteInput, setNoteInput]       = useState('')
    const [notes, setNotes]               = useState<string[]>([])
    const [isLoading, setIsLoading]       = useState(false)
    const [technicianOpen, setTechnicianOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null)

    const filteredParts = React.useMemo(() => {
        if (!spare_parts) return []
        const q = search.toLowerCase()
        return spare_parts
            .filter(p => p.robot_match.includes(robot.robot_type.toUpperCase()))
            .filter(p =>
                p.material_number.toLowerCase().includes(q) ||
                p.description_eng.toLowerCase().includes(q) ||
                p.description_orginall.toLowerCase().includes(q)
            )
            .slice(0, 30)
    }, [spare_parts, search, robot.robot_type])

    const addPart = (part: IStockItemTemplate) =>
        setPickedParts(prev => {
            const existing = prev.find(p => p.part.material_number === part.material_number)
            if (existing) return prev.map(p =>
                p.part.material_number === part.material_number ? { ...p, qty: p.qty + 1 } : p
            )
            return [...prev, { part, qty: 1 }]
        })

    const removePart = (materialNumber: string) =>
        setPickedParts(prev => prev.filter(p => p.part.material_number !== materialNumber))

    const changeQty = (materialNumber: string, delta: number) =>
        setPickedParts(prev =>
            prev
                .map(p => p.part.material_number === materialNumber ? { ...p, qty: p.qty + delta } : p)
                .filter(p => p.qty > 0)
        )

    const addNote = () => {
        if (!noteInput.trim()) return
        setNotes(prev => [...prev, noteInput.trim()])
        setNoteInput('')
    }

    const handleSubmit = async () => {
        if (!pickedParts.length) return
        setIsLoading(true)
        try {
            await generateRepairPdf({
                robot,
                parts:      pickedParts,
                technician: selectedUser ?? undefined,
                warehouse:  session?.warehouse.title ?? 'None',
                notes,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const totalParts = pickedParts.reduce((s, p) => s + p.qty, 0)

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <div className="flex gap-2 items-center w-full cursor-pointer">
                    <Wrench size={15} />
                    Repair PDF
                </div>
            </DrawerTrigger>

            <DrawerContent className="max-h-[90dvh]">
                <div className="mx-auto w-full max-w-6xl mt-2 flex flex-col h-full">
                    <div className="flex-1 overflow-hidden grid grid-cols-[1fr_1px_1fr] min-h-0">

                        {/* ── Left: Catalogue ── */}
                        <div className="flex flex-col p-6 gap-4 min-h-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                Parts Catalogue
                            </p>

                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by material no. or description…"
                                    className="pl-8 text-sm"
                                />
                            </div>

                            <ScrollArea className="flex-1 -mx-2 px-2">
                                <div className="flex flex-col gap-1">
                                    {filteredParts.length === 0 && (
                                        <EmptyState icon={<Search size={20} />} label="No parts found" />
                                    )}
                                    {filteredParts.slice(0, 6).map(part => {
                                        const picked = pickedParts.find(p => p.part.material_number === part.material_number)
                                        return (
                                            <PartRow
                                                key={part.material_number}
                                                part={part}
                                                badge={picked?.qty}
                                                action={
                                                    <Button size="icon" variant="outline" className="h-7 w-7 shrink-0"
                                                            onClick={() => addPart(part)}>
                                                        <Plus size={12} />
                                                    </Button>
                                                }
                                            />
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        <Separator orientation="vertical" />

                        {/* ── Right: Selected + Technician + Notes ── */}
                        <div className="flex flex-col p-6 gap-5 min-h-0 overflow-y-auto">

                            {/* Technician picker */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                    Technician
                                </p>

                                <Popover open={technicianOpen} onOpenChange={setTechnicianOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                            disabled={isLoadingEmployees}
                                        >
                                            {selectedUser ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={selectedUser.avatar_url ?? ''} />
                                                        <AvatarFallback className="text-[9px]">
                                                            {selectedUser.user_name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{selectedUser.user_name}</span>
                                                    {selectedUser.position_title && (
                                                        <span className="text-xs text-muted-foreground">
                                                            · {selectedUser.position_title}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <User size={13} /> Select technician…
                                                </span>
                                            )}
                                            <ChevronsUpDown size={13} className="text-muted-foreground shrink-0" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-[320px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search employee…" className="text-sm" />
                                            <CommandList>
                                                <CommandEmpty>No employees found.</CommandEmpty>
                                                <CommandGroup>
                                                    {/* Сброс выбора */}
                                                    <CommandItem
                                                        onSelect={() => {
                                                            setSelectedUser(null)
                                                            setTechnicianOpen(false)
                                                        }}
                                                        className="text-muted-foreground"
                                                    >
                                                        <User size={13} className="mr-2" />
                                                        No technician
                                                        {!selectedUser && <Check size={13} className="ml-auto" />}
                                                    </CommandItem>

                                                    {employees.map((emp: IUser) => (
                                                        <CommandItem
                                                            key={emp.id}
                                                            value={emp.user_name}
                                                            onSelect={() => {
                                                                setSelectedUser(emp)
                                                                setTechnicianOpen(false)
                                                            }}
                                                        >
                                                            <Avatar className="h-6 w-6 mr-2">
                                                                <AvatarImage src={emp.avatar_url ?? ''} />
                                                                <AvatarFallback className="text-[9px]">
                                                                    {emp.user_name.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{emp.user_name}</span>
                                                                {emp.position_title && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {emp.position_title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {selectedUser?.id === emp.id && (
                                                                <Check size={13} className="ml-auto" />
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Separator />

                            {/* Selected parts */}
                            <div className="flex flex-col gap-3 min-h-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                        Selected Parts
                                    </p>
                                    {pickedParts.length > 0 && (
                                        <Button variant="ghost" size="sm"
                                                className="h-6 text-xs text-muted-foreground hover:text-destructive"
                                                onClick={() => setPickedParts([])}>
                                            Clear all
                                        </Button>
                                    )}
                                </div>

                                <ScrollArea className="max-h-[22dvh] -mx-2 px-2">
                                    <div className="flex flex-col gap-1">
                                        {pickedParts.length === 0 && (
                                            <EmptyState icon={<FileText size={20} />} label="No parts selected yet" />
                                        )}
                                        {pickedParts.map(({ part, qty }) => (
                                            <PartRow
                                                key={part.material_number}
                                                part={part}
                                                action={
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button variant="outline" size="icon" className="h-7 w-7"
                                                                onClick={() => changeQty(part.material_number, -1)}>
                                                            <Minus size={10} />
                                                        </Button>
                                                        <span className="w-5 text-center text-xs">{qty}</span>
                                                        <Button variant="outline" size="icon" className="h-7 w-7"
                                                                onClick={() => changeQty(part.material_number, +1)}>
                                                            <Plus size={10} />
                                                        </Button>
                                                        <Button variant="outline" size="icon"
                                                                className="h-7 w-7 hover:text-destructive hover:border-destructive"
                                                                onClick={() => removePart(part.material_number)}>
                                                            <Trash2 size={10} />
                                                        </Button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            <Separator />

                            {/* Notes */}
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                    Notes
                                </p>

                                <div className="flex gap-2">
                                    <Input
                                        value={noteInput}
                                        onChange={e => setNoteInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addNote()}
                                        placeholder="Add a note… (Enter to save)"
                                        className="text-sm"
                                    />
                                    <Button variant="outline" size="icon" onClick={addNote} disabled={!noteInput.trim()}>
                                        <Plus size={13} />
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-1.5 max-h-[15dvh] overflow-y-auto">
                                    {notes.map((note, i) => (
                                        <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-md border bg-muted/40 group">
                                            <span className="text-xs text-muted-foreground pt-0.5 shrink-0 tabular-nums">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <p className="text-sm flex-1 leading-relaxed">{note}</p>
                                            <button
                                                onClick={() => setNotes(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DrawerFooter className="border-t flex-row gap-3">
                        <Button className="flex-1" onClick={handleSubmit}
                                disabled={!pickedParts.length || isLoading}>
                            <FileText size={13} />
                            {isLoading ? 'Generating…' : 'Export PDF'}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

const EmptyState = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
        {icon}
        <p className="text-xs">{label}</p>
    </div>
)

const PartRow = ({ part, action, badge }: {
    part: IStockItemTemplate
    action: React.ReactNode
    badge?: number
}) => (
    <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors">
        <div className="w-15 h-15 shrink-0 rounded-md overflow-hidden border bg-muted relative">
            <StockPartImage avatar_url={part.avatar_url} />
            {badge != null && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]">
                    {badge}
                </Badge>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-mono">{part.material_number}</p>
            <p className="text-sm truncate leading-tight">{part.description_eng}</p>
        </div>
        {action}
    </div>
)

export default RepairPdf