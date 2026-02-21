import React, { useState } from 'react';
import { IRobotException } from "@/types/Exception/Exception";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {ExceptionStats} from "@/components/shared/StatsDisplay/ExceptionStats";
import Exception from "@/components/shared/Lists/Exception";
import {useExceptionStore} from "@/store/exception";


const ExceptionDashboard = () => {
    const exception_data = useExceptionStore(state => state.today_exception)
    const [searchQuery, setSearchQuery] = useState("");


    const filteredData = exception_data.filter((exception) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            exception.error_robot?.toString().toLowerCase().includes(searchLower) ||
            exception.first_column?.toLowerCase().includes(searchLower) ||
            exception.second_column?.toLowerCase().includes(searchLower) ||
            exception.employee?.toLowerCase().includes(searchLower) ||
            exception.device_type?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="">
            <div className={`hidden md:block`}>
                <ExceptionStats data={exception_data} />
            </div>

            <Exception data={filteredData} />
        </div>
    );
};

export default ExceptionDashboard;