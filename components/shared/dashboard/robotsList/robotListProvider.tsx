import React from 'react';
import {ParamValue} from "next/dist/server/request/params";
import RobotsList from "@/components/shared/dashboard/robotsList/robotsList";

const robotsListProvider = ({card_id}: {card_id: ParamValue}) => {
    if (!card_id) return null;

    return (
        <div>
            <RobotsList />
        </div>
    )
};

export default robotsListProvider;
