import React from 'react';
import {
    useQuery,
} from '@tanstack/react-query';
import { getAllShifts } from "@/futures/shifts/getAllShifts";
import ShiftsList from "@/components/shared/dashboard/employeeShiftsList/shiftsList";

const AdminShiftsList = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['shifts'], // better name than 'todos'
        queryFn: getAllShifts,
    });

    if (isLoading) return <p>Loading shifts...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <ShiftsList data={data}/>
};

export default AdminShiftsList;
