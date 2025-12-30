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
import React, {useEffect, useState, useMemo} from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {useUserStore} from "@/store/user";
import {BellPlus, Copy, FilePlusCorner, Loader} from "lucide-react";
import {toast} from "sonner";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getAllParts} from "@/futures/stock/getAllParts";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Item} from "@/components/ui/item";
import {Badge} from "@/components/ui/badge";
import dayjs from "dayjs";
import {Separator} from "@/components/ui/separator";

// ========== ТРИГРАММНЫЙ ПОИСК ==========

/**
 * Генерирует триграммы из строки
 */
function generateTrigrams(str: string): string[] {
    if (!str) return [];

    const normalized = str.toLowerCase().replace(/\s+/g, '');
    const trigrams: string[] = [];
    const padded = `  ${normalized}  `;

    for (let i = 0; i < padded.length - 2; i++) {
        trigrams.push(padded.substring(i, i + 3));
    }

    return trigrams;
}

/**
 * Вычисляет процент совпадения триграмм
 */
function calculateTrigramSimilarity(trigrams1: string[], trigrams2: string[]): number {
    if (trigrams1.length === 0 || trigrams2.length === 0) {
        return 0;
    }

    const set1 = new Set(trigrams1);
    const set2 = new Set(trigrams2);

    let matchCount = 0;
    set1.forEach(trigram => {
        if (set2.has(trigram)) {
            matchCount++;
        }
    });

    const baseSize = Math.min(set1.size, set2.size);
    return (matchCount / baseSize) * 100;
}

/**
 * Поиск с триграммами по нескольким полям
 */
function trigramSearchMultiField<T>(
    searchQuery: string,
    item: T,
    fields: (keyof T)[],
    threshold: number = 50
): { match: boolean; similarity: number; matchedField?: keyof T } {
    if (!searchQuery.trim()) {
        return { match: true, similarity: 100 };
    }

    const queryTrigrams = generateTrigrams(searchQuery);
    let maxSimilarity = 0;
    let matchedField: keyof T | undefined;

    for (const field of fields) {
        const value = item[field];
        if (typeof value === 'string') {
            const textTrigrams = generateTrigrams(value);
            const similarity = calculateTrigramSimilarity(queryTrigrams, textTrigrams);

            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                matchedField = field;
            }
        }
    }

    return {
        match: maxSimilarity >= threshold,
        similarity: maxSimilarity,
        matchedField
    };
}

// ========== КОМПОНЕНТ ==========

const Page = () => {
    const user = useUserStore(state => state.current_user)

    const [value, setValue] = useState<string>("")
    const [threshold, setThreshold] = useState<number>(50) // Порог совпадения
    const [parts_data, setParts_data] = useState<IStockItemTemplate[]>([])

    const getAllPartsLocal = async () => {
        try {
            const res = await getAllParts();
            setParts_data(res);
        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        }
    }

    const copyToClipboard = (text: string) => {
        try {
            navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard");
        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        }
    }

    useEffect(() => {
        getAllPartsLocal()
    }, []);

    // Триграммный поиск с сортировкой по релевантности
    const filtered_data = useMemo(() => {
        if (!value.trim()) {
            return parts_data;
        }

        return parts_data
            .map(item => {
                const result = trigramSearchMultiField(
                    value,
                    item,
                    ['description_orginall', 'description_eng', 'material_number'],
                    threshold
                );
                return { item, ...result };
            })
            .filter(result => result.match)
            .sort((a, b) => b.similarity - a.similarity)
            .map(result => result.item);
    }, [value, parts_data, threshold]);

    return (
        <div className={`px-4 max-w-[1600px] m-auto`}>
            <div className={`mb-4 space-y-2`}>
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Поиск по названию или номеру материала..."
                />

                {/* Показываем количество результатов */}
                {value && (
                    <Label className="text-xs text-muted-foreground">
                        Find: {filtered_data.length} / {parts_data.length}
                    </Label>
                )}
            </div>

            <Separator className={`my-4`} />

            <div className={`w-full grid grid-cols-1 gap-2`}>
                {filtered_data.length === 0 && value ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Ничего не найдено</p>
                        <p className="text-xs mt-2">Попробуйте уменьшить точность поиска</p>
                    </div>
                ) : (
                    filtered_data.map((part, index) => {
                        return (
                            <Item variant={`muted`} className={`flex items-center gap-2`} key={index}>
                                <div className={`w-full flex items-center gap-2 justify-between mb-6`}>
                                    <Label className={`text-xs`}>
                                        <BellPlus size={18} /> {dayjs(part.updated_at).format('HH:mm · MMM D, YYYY')}
                                    </Label>
                                    <Label className={`text-xs`}>{part.user?.user_name}</Label>
                                </div>

                                <div className={`flex flex-col gap-2 w-full`}>
                                    <p>{part.description_eng}</p>
                                    <Separator />
                                    <p>{part.description_orginall}</p>
                                </div>

                                <div className={`w-full flex items-center justify-between mt-2`}>
                                    <Badge
                                        onClick={() => copyToClipboard(part.material_number)}
                                        className="cursor-pointer"
                                    >
                                        <Copy /> {part.material_number}
                                    </Badge>
                                    <Label className={`text-xs text-muted-foreground`}>
                                        {dayjs(part.created_at).format('HH:mm · MMM D, YYYY')}
                                    </Label>
                                </div>
                            </Item>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default Page;