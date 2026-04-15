import React, {useEffect} from 'react';
import {useSessionStore} from "@/store/session";
import {IssuesByTypes} from "@/components/shared/DashboardNew/DashboardComponents/Reports/WeeklyCharts/IssueByTypes";
import {SpareParts} from "@/components/shared/DashboardNew/DashboardComponents/Reports/WeeklyCharts/SpareParts";
import {useQuery} from "@tanstack/react-query";
import {ExceptionService} from "@/services/exceptionService";

const WeeklyReport = () => {
    const session = useSessionStore(state => state.currentSession)
    if (!session) return null;

    const {data: exceptions_data, isLoading, isError} = useQuery({
        queryKey: ['week-exception'],
        queryFn: () => ExceptionService.getExceptionsWeek(session.warehouse.title),
        retry: 1,
    })


    return (
        <div>
            <div className={`flex gap-2 items-center`}>
                <p>{session.user.user_name}</p>
                <p>{session.warehouse.title}</p>
            </div>
            <div className={`grid grid-cols-3 gap-2 items-start`}>
                <IssuesByTypes exceptions_data={exceptions_data} />
                <SpareParts />
            </div>
        </div>
    );
};

export default WeeklyReport;