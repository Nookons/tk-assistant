import React from 'react';
import {
    useQuery,
} from '@tanstack/react-query';
import { getAllShifts } from "@/futures/shifts/getAllShifts";
import ShiftsList from "@/components/shared/dashboard/employeeShiftsList/shiftsList";
import {ParamValue} from "next/dist/server/request/params";
import {getEmployeeShifts} from "@/futures/shifts/getEmployeeShifts";

const EmployeeShiftsList = ({card_id}: {card_id: ParamValue}) => {

    if (!card_id) return null;

    const { data, error, isLoading } = useQuery({
        queryKey: ['shifts', card_id.toString()], // better name than 'todos'
        queryFn: () => getEmployeeShifts(card_id.toString()),
    });

    if (isLoading) return <p>Loading shifts...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <ShiftsList data={data} list_type={'employee'}/>
};

export default EmployeeShiftsList;
