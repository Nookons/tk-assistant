import React from 'react';
import RobotsList from "@/components/shared/DashboardNew/DashboardComponents/RobotsList";
import {useUserStore} from "@/store/user";
import {getUserWarehouse} from "@/utils/getUserWarehouse";

const RobotsDisplay = () => {
    const user = useUserStore(state => state.currentUser);
    const warehouse = getUserWarehouse(user?.warehouse || "");
    return (
        <div>
            <RobotsList previewLimit={9999} warehouse={warehouse} />
        </div>
    );
};

export default RobotsDisplay;