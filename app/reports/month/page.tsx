'use client'

import * as React from "react"
import MonthPicker from "@/components/shared/DatesPickers/MonthPicker";
import ExceptionDisplay from "@/app/reports/month/ExceptionDisplay";
import ImportantDisplay from "@/app/reports/month/ImportantDisplay";
import ChangedPartsDisplay from "@/app/reports/month/ChangedPartsDisplay";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {IRobotException} from "@/types/Exception/Exception";
import {NoteItem} from "@/types/Important/Important";
import {IHistoryParts} from "@/types/robot/robot";
import {generateMonthReport} from "@/futures/PDF/monthReport";
import dayjs from "dayjs";

export interface IMonthParts extends IHistoryParts {
    part_description: string;
}

const Page: React.FC = () => {
    const [date, setDate] = React.useState<Date | null>(dayjs().toDate())

    const [exception_data, setException_data] = useState<IRobotException[]>([])
    const [important_data, setImportant_data] = useState<NoteItem[]>([])
    const [changed_parts_data, setChanged_parts_data] = useState<IMonthParts[]>([])


    const HandlePDF = async () => {
        const report_data = {
            exception_data: exception_data,
            important_data: important_data,
            changed_parts_data: changed_parts_data
        }

        await generateMonthReport({report_data, date})
    }

    return (
        <div className={`p-4`}>
            <MonthPicker date={date} setDate={setDate}/>
            <div className={`mt-4`}>
                <Button onClick={HandlePDF}>Create PDF</Button>
            </div>
            <div className="mx-auto grid grid-cols-[450px_1fr] gap-4">
                <div className={`flex flex-col gap-4`}>
                    <ImportantDisplay
                        setImportant_data={setImportant_data}
                        date={date}
                    />
                    <ChangedPartsDisplay
                        setChanged_parts_data={setChanged_parts_data}
                        date={date}
                    />
                </div>
                <ExceptionDisplay
                    setException_data={setException_data}
                    date={date}
                />
            </div>
        </div>
    )
}

export default Page
