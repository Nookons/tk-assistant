import {IRobot} from "@/types/robot/robot";

export const hasProblem = ({robot}: {robot: IRobot}): boolean => {
    return robot.type_problem.length > 0
}