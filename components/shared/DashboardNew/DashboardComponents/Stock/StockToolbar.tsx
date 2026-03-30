import {Download, Loader2} from 'lucide-react';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import InventoryDisplay from "@/components/shared/DashboardNew/DashboardComponents/Stock/InventoryDisplay";
import {StockByLocationResponse} from '@/types/stock/SummaryItem';
import {useQuery} from "@tanstack/react-query";
import {WarehouseService} from "@/services/warehouseService";

interface StockToolbarProps {
    pickedWarehouse: string;
    onWarehouse: (v: string) => void;
    warehouses: readonly string[];
    warehouseLabels: Record<string, string>;
    rowsPerPage: number;
    onRowsPerPage: (v: number) => void;
    isExporting: boolean;
    filteredData: StockByLocationResponse;
    onExport: () => void;
}

export function StockToolbar({
                                 pickedWarehouse, onWarehouse, warehouses, warehouseLabels,
                                 rowsPerPage, onRowsPerPage,
                                 isExporting, filteredData, onExport,
                             }: StockToolbarProps) {

    const {data, isLoading, isError} = useQuery({
        queryKey: ['warehouses-list'],
        queryFn: () => WarehouseService.getWarehousesList(),
        retry: 3,
    })

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {
                isLoading
                    ? <Loader2 className={`animate-spin`}/>
                    :
                    <>
                        {data &&
                            <Tabs value={pickedWarehouse} onValueChange={onWarehouse}>
                                <TabsList className="h-9">
                                    <TabsTrigger key={'999'} value={'All'} className="text-xs px-3">
                                        All
                                    </TabsTrigger>
                                    {data.map(w => (
                                        <TabsTrigger key={w.id} value={w.title} className="text-xs px-3">
                                            {w.title}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        }
                    </>

            }

            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
                <Select value={String(rowsPerPage)} onValueChange={v => onRowsPerPage(Number(v))}>
                    <SelectTrigger className="w-[70px] h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent align="end">
                        <SelectGroup>
                            {[10, 25, 50, 100].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={onExport}
                    disabled={isExporting || filteredData.length === 0}
                    className="gap-1.5 text-xs"
                    title="Export filtered data to Excel"
                >
                    {isExporting ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}
                    Excel
                </Button>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-layers-plus">
                                <path
                                    d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 .83.18 2 2 0 0 0 .83-.18l8.58-3.9a1 1 0 0 0 0-1.831z"/>
                                <path d="M16 17h6"/>
                                <path d="M19 14v6"/>
                                <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 .825.178"/>
                                <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l2.116-.962"/>
                            </svg>
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-[70vw]">
                        <InventoryDisplay/>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}