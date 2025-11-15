import React, {useState} from 'react';
import {
    useQuery,
} from '@tanstack/react-query';
import { getAllShifts } from "@/futures/shifts/getAllShifts";
import ShiftsList from "@/components/shared/dashboard/employeeShiftsList/shiftsList";
import {Button} from "@/components/ui/button";
import {generateMonthReport} from "@/futures/PDF/monthReport";

const AdminShiftsList = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['shifts'], // better name than 'todos'
        queryFn: getAllShifts,
    });

    const [isReportLoading, setIsReportLoading] = useState<boolean>(false)

    if (isLoading) return <p>Loading shifts...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const reportHandle = async () => {
        try {
            setIsReportLoading(true)
            const sorted_data = [...data].sort((a, b) => new Date(b.shift_date).valueOf() - new Date(a.shift_date).valueOf());
            await generateMonthReport({report_data: sorted_data})
            setIsReportLoading(false)
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div>
            <div className={`mb-4`}>
                <Button disabled={isReportLoading} onClick={() => reportHandle()}>Generate Month Report</Button>
            </div>
            <ShiftsList data={data} list_type={'admin'}/>
        </div>
    )
};

export default AdminShiftsList;
