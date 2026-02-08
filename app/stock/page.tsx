"use client"
import React, {useEffect, useState, useMemo} from 'react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useUserStore} from "@/store/user";
import {BellPlus, Bot, Copy} from "lucide-react";
import {toast} from "sonner";
import {getAllParts} from "@/futures/stock/getAllParts";
import {IStockItemTemplate} from "@/types/stock/StockItem";
import {Item} from "@/components/ui/item";
import {Badge} from "@/components/ui/badge";
import dayjs from "dayjs";
import {Separator} from "@/components/ui/separator";
import TemplatePhotoChange from "@/components/shared/Stock/TemplatePhotoChange";
import {useStockStore} from "@/store/stock";
import TemplateEditDialog from "@/components/shared/Stock/TemplateEditDialog";

// ========== ТРИГРАММНЫЙ ПОИСК ==========

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

const Page = () => {
    // Все хуки должны быть на верхнем уровне, до любых условий
    const user = useUserStore(state => state.currentUser);
    const stock_store = useStockStore(state => state.items_templates);

    const [value, setValue] = useState<string>("");
    const [threshold, setThreshold] = useState<number>(50);
    const [parts_data, setParts_data] = useState<IStockItemTemplate[]>([]);

    const getAllPartsLocal = async () => {
        try {
            const res = await getAllParts();
            setParts_data(res);
        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        }
    };

    const copyToClipboard = (text: string) => {
        try {
            navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard");
        } catch (error) {
            error && toast.error(error.toString() || "Unknown error");
        }
    };

    useEffect(() => {
        getAllPartsLocal();
    }, []);

    // Триграммный поиск с сортировкой по релевантности
    const filtered_data = useMemo(() => {
        if (!stock_store) return [];

        if (!value.trim()) {
            return stock_store;
        }

        return stock_store
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
    }, [value, stock_store, threshold]);

    if (!stock_store) return null;

    return (
        <div className={`px-4 max-w-[1600px] m-auto`}>
            <div className={`mb-4 space-y-2`}>
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Find part by description or material number"
                />

                {value && (
                    <Label className="text-xs text-muted-foreground">
                        Find: {filtered_data.length} / {parts_data.length}
                    </Label>
                )}
            </div>

            <Separator className={`my-4`} />

            <div className={`w-full grid grid-cols-1 gap-2`}>
                {filtered_data.slice(0, 25).map((part, index) => {
                    return (
                        <Item variant={`muted`} className={`flex items-center gap-2`} key={index}>
                            <div className={`w-full flex items-center gap-2 justify-between mb-6`}>
                                <Label className={`text-xs`}>
                                    <BellPlus size={18} />
                                </Label>
                                <div className={`flex items-center gap-4`}>
                                    <Label className={`text-xs`}><Bot /> {part.robot_match?.join(' | ')}</Label>
                                    <TemplateEditDialog part={part} />
                                </div>
                            </div>

                            <div className={`grid md:grid-cols-[240px_1fr] gap-4 w-full`}>
                                <TemplatePhotoChange
                                    part={part}
                                />

                                <div className={`flex flex-col gap-2 w-full`}>
                                    <p>{part.description_eng}</p>
                                    <Separator />
                                    <p>{part.description_orginall}</p>
                                </div>
                            </div>

                            <div className={`w-full flex items-center justify-between mt-2`}>
                                <Badge
                                    onClick={() => copyToClipboard(part.material_number)}
                                    className="cursor-pointer"
                                >
                                    <Copy /> {part.material_number}
                                </Badge>
                                <Label className={`text-xs text-muted-foreground`}>
                                    {dayjs(part.updated_at).format('HH:mm · MMM D, YYYY')}
                                </Label>
                            </div>
                        </Item>
                    );
                })}
            </div>
        </div>
    );
};

export default Page;