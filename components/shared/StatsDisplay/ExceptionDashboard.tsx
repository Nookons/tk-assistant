import React, { useState } from 'react';
import { IRobotException } from "@/types/Exception/Exception";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {ExceptionStats} from "@/components/shared/StatsDisplay/Exceptionstats";
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
        <div className="space-y-6 ">
            {/* Results count */}
            {searchQuery && (
                <div className="text-sm text-muted-foreground">
                    Found {filteredData.length} of {exception_data.length} exceptions
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by robot, error, operator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Statistics */}
            <div className={`hidden md:block`}>
                <ExceptionStats data={exception_data} />
            </div>

            {/* Exception List */}
            <Exception data={filteredData} />
        </div>
    );
};

export default ExceptionDashboard;