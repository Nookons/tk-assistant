import React from 'react';
import RobotsList from "@/components/shared/DashboardNew/DashboardComponents/RobotsList";

const RobotsDisplay = () => {
    return (
        <div>
            <RobotsList previewLimit={9999} warehouse={'GLPC'} />
        </div>
    );
};

export default RobotsDisplay;