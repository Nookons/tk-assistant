import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {IRobot} from "@/types/robot/robot";
import {Label} from "@/components/ui/label";
import {Hammer, Laugh} from "lucide-react";

// Interface for easy state management of statistics
interface RobotStats {
    quantity: number;
    broken_quantity: number;
}

const ListStats = ({robots}: {robots: IRobot[]}) => {

    // 1. State for K50H
    const [k50h, setK50h] = useState<RobotStats>({
        quantity: 0,
        broken_quantity: 0,
    });

    // 2. State for A42T
    const [a42t, setA42t] = useState<RobotStats>({
        quantity: 0,
        broken_quantity: 0,
    });

    // 3. State for A42T E2
    const [a42tE2, setA42tE2] = useState<RobotStats>({
        quantity: 0,
        broken_quantity: 0,
    });

    useEffect(() => {
        // --- Filtering all robots by type ---
        const k50hRobots = robots.filter(robot => robot.robot_type === 'K50H');
        const a42tRobots = robots.filter(robot => robot.robot_type === 'A42T');
        const a42tE2Robots = robots.filter(robot => robot.robot_type === 'A42T E2');

        // --- Calculating broken units (where status is not 'online') ---
        const k50h_broken = k50hRobots.filter(robot => robot.status !== 'online');
        const a42t_broken = a42tRobots.filter(robot => robot.status !== 'online');
        const a42tE2_broken = a42tE2Robots.filter(robot => robot.status !== 'online');

        // --- Updating states ---
        setK50h({
            quantity: k50hRobots.length,
            broken_quantity: k50h_broken.length,
        });

        setA42t({
            quantity: a42tRobots.length,
            broken_quantity: a42t_broken.length,
        });

        setA42tE2({
            quantity: a42tE2Robots.length,
            broken_quantity: a42tE2_broken.length,
        });

    }, [robots]);

    return (
        // Grid layout for 3 cards
        <div className={`flex flex-wrap gap-4 mb-6`}>

            {/* Card for K50H */}
            <Card className={`p-2`}>
                <CardContent className="flex flex-col gap-2 p-2">
                    {/* Working Quantity (Total - Broken) */}
                    <Label className="flex items-center gap-2 mb-2 font-medium">
                        K50H
                    </Label>
                    {/* Working Quantity (Total - Broken) */}
                    <div className={`grid grid-cols-2 gap-6`}>
                        <Label className="flex items-center gap-2  font-medium">
                            <Laugh className="h-4 w-4" />
                            Working: {k50h.quantity - k50h.broken_quantity}
                        </Label>
                        {/* Broken Quantity */}
                        <Label className="flex items-center gap-2  font-medium">
                            <Hammer className="h-4 w-4" />
                            Broken: {k50h.broken_quantity}
                        </Label>
                    </div>
                    {/* Total Quantity */}
                    <Label className="mt-2 text-gray-500 text-sm">
                        Total: {k50h.quantity}
                    </Label>
                </CardContent>
            </Card>

            {/* Card for A42T */}
            <Card className={`p-2`}>
                <CardContent className="flex flex-col gap-2 p-2">
                    <Label className="flex items-center gap-2 mb-2 font-medium">
                        A42T
                    </Label>
                    <div className={`grid grid-cols-2 gap-6`}>
                        <Label className="flex items-center gap-2  font-medium">
                            <Laugh className="h-4 w-4" />
                            Working: {a42t.quantity - a42t.broken_quantity}
                        </Label>
                        <Label className="flex items-center gap-2  font-medium">
                            <Hammer className="h-4 w-4" />
                            Broken: {a42t.broken_quantity}
                        </Label>
                    </div>
                    <Label className="mt-2 text-gray-500 text-sm">
                        Total: {a42t.quantity}
                    </Label>
                </CardContent>
            </Card>

            {/* Card for A42T E2 */}
            <Card className={`p-2`}>
                <CardContent className="flex flex-col gap-2 p-2">
                    <Label className="flex items-center gap-2 mb-2 font-medium">
                        A42T E2
                    </Label>
                    <div className={`grid grid-cols-2 gap-6`}>
                        <Label className="flex items-center gap-2  font-medium">
                            <Laugh className="h-4 w-4" />
                            Working: {a42tE2.quantity - a42tE2.broken_quantity}
                        </Label>
                        <Label className="flex items-center gap-2  font-medium">
                            <Hammer className="h-4 w-4" />
                            Broken: {a42tE2.broken_quantity}
                        </Label>
                    </div>
                    <Label className="mt-2 text-muted-foreground text-sm">
                        Total: {a42tE2.quantity}
                    </Label>
                </CardContent>
            </Card>
        </div>
    );
};

export default ListStats;