"use client"
import React, {useEffect, useState} from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useUserStore} from "@/store/user";
import {toast} from "sonner";
import {getAllParts} from "@/futures/stock/getAllParts";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Separator} from "@/components/ui/separator";
import {useStockStore} from "@/store/stock";
import StockItemPreview from "@/components/shared/Stock/StockItemPreview";
import {LocationStock} from "@/types/stock/SummaryItem";
import CreateNewStockTemplate from "@/components/shared/Stock/CreateNewStockTemplate";


const SearchStockTemplate = () => {
    const user = useUserStore(state => state.currentUser);
    const stock_store = useStockStore(state => state.items_templates);

    const [value, setValue] = useState<string>("");
    const [filtered_data, setFiltered_data] = useState<IStockItemTemplate[]>([])

    const copyToClipboard = (text: string) => {
        try {
            navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard");
        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        }
    };

    useEffect(() => {
        if (!stock_store) return;

        const trimmedValue = value.trim();

        if (trimmedValue.length === 0) {
            setFiltered_data(stock_store);
            return;
        }

        const searchTerms = trimmedValue.toUpperCase().split(/\s+/); // Разбиваем на слова

        const filteredItems = stock_store
            .map(item => {
                const materialNumber = item.material_number?.toUpperCase() || '';
                const description = item.description_eng?.toUpperCase() || '';

                // Проверяем, содержатся ли все поисковые термины
                const matchCount = searchTerms.filter(term =>
                    materialNumber.includes(term) || description.includes(term)
                ).length;

                // Бонус за точное совпадение в начале
                const startsWithBonus =
                    materialNumber.startsWith(searchTerms[0]) ? 2 :
                        description.startsWith(searchTerms[0]) ? 1 : 0;

                return {
                    item,
                    score: matchCount + startsWithBonus,
                    matchCount
                };
            })
            .filter(result => result.matchCount === searchTerms.length) // Все термины должны совпадать
            .sort((a, b) => b.score - a.score) // Сортировка по релевантности
            .map(result => result.item);

        setFiltered_data(filteredItems);
    }, [value, stock_store]);

    if (!stock_store) return null;

    return (
        <div className={`mt-4`}>
            <div className={`mb-4 space-y-2`}>
                <div className={`flex flex-col justify-start gap-2 items-end`}>
                    <CreateNewStockTemplate />
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Find part by description or material number"
                    />
                </div>

                {value && (
                    <Label className="text-xs text-muted-foreground">
                        Find: {filtered_data.length} / {stock_store.length}
                    </Label>
                )}
            </div>

            <Separator className={`my-4`} />

            <div className={`w-full grid grid-cols-1 gap-2`}>
                {filtered_data.slice(0, 25).map((part, index) => {
                    return (
                        <StockItemPreview data={part} />
                    );
                })}
            </div>
        </div>
    );
};

export default SearchStockTemplate;