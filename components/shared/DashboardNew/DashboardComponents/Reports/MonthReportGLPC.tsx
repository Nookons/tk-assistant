import React, {useState} from 'react';
import dayjs from "dayjs";
import {IRobotException} from "@/types/Exception/Exception";
import {NoteItem} from "@/types/Important/Important";
import {generateMonthReport} from "@/futures/pdf/monthReport";
import MonthPicker from "@/components/shared/DatesPickers/MonthPicker";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {FileDown} from "lucide-react";
import ImportantDisplay from "@/app/reports/month/ImportantDisplay";
import ChangedPartsDisplay from "@/app/reports/month/ChangedPartsDisplay";
import ExceptionDisplay from "@/app/reports/month/ExceptionDisplay";
import {IMonthParts} from "@/app/reports/month/page";

const MonthReportGlpc = () => {
    const [date, setDate] = React.useState<Date | null>(dayjs().toDate());

    const [exception_data,     setException_data]     = useState<IRobotException[]>([]);
    const [important_data,     setImportant_data]     = useState<NoteItem[]>([]);
    const [changed_parts_data, setChanged_parts_data] = useState<IMonthParts[]>([]);

    const HandlePDF = async () => {
        await generateMonthReport({
            report_data: {exception_data, important_data, changed_parts_data},
            date,
        });
    };

    const hasData = exception_data.length > 0 || important_data.length > 0 || changed_parts_data.length > 0;

    return (
        <div className="space-y-4">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                    <MonthPicker date={date} setDate={setDate}/>
                    {date && (
                        <Badge variant="outline" className="text-xs">
                            {dayjs(date).format("MMMM YYYY")}
                        </Badge>
                    )}
                </div>
                <Button
                    onClick={HandlePDF}
                    disabled={!hasData}
                    size="sm"
                    className="gap-2"
                >
                    <FileDown size={14}/>
                    Create PDF
                </Button>
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4 items-start">

                {/* Left: Notes + Parts */}
                <div className="space-y-4">
                    <ImportantDisplay
                        setImportant_data={setImportant_data}
                        date={date}
                    />
                    <ChangedPartsDisplay
                        setChanged_parts_data={setChanged_parts_data}
                        date={date}
                    />
                </div>

                {/* Right: Exceptions table */}
                <ExceptionDisplay
                    setException_data={setException_data}
                    date={date}
                />
            </div>
        </div>
    );
};

export default MonthReportGlpc;