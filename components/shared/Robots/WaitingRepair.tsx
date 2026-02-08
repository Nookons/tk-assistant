import React from 'react';
import {Table, TableBody, TableCaption, TableCell, TableRow} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import {timeToString} from "@/utils/timeToString";
import {useRobotsStore} from "@/store/robotsStore";

const WaitingRepair = () => {
    const {robots} = useRobotsStore()

    return (
        <div>
            {robots &&
                <>
                    <Table className={`backdrop-blur-2xl`}>
                        {/*<TableCaption>
                            <p>Robots waiting for repair: ({robots.filter(item => item.status === "离线 | Offline").length})</p>
                        </TableCaption>*/}
                        <TableBody>
                            {robots.filter(item => item.status === "离线 | Offline").map((robot, index) => (
                                <TableRow key={index}>
                                    <TableCell className={`flex items-center gap-2 p-1`}>
                                        {robot.robot_type === "K50H"
                                            ?
                                            <>
                                                {robot.status === "离线 | Offline"
                                                    ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={30}
                                                             height={30}/>
                                                    : <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={30}
                                                             height={30}/>
                                                }
                                            </>
                                            :
                                            <>
                                                {robot.status === "离线 | Offline"
                                                    ? <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={30}
                                                             height={30}/>
                                                    : <Image src={`/img/A42T_Green.svg`} alt={`robot_img`} width={30}
                                                             height={30}/>
                                                }
                                            </>
                                        }
                                    </TableCell>
                                    <TableCell><div className="font-mono font-semibold">{robot.robot_type}</div></TableCell>
                                    <TableCell className={`text-right`}><Link href={`/robot/${robot.id}`} className="font-mono font-semibold">{robot.robot_number}</Link></TableCell>
                                    <TableCell className={`text-right`}><div className="font-mono font-semibold">{timeToString(robot.updated_at)}</div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            }
        </div>
    );
};

export default WaitingRepair;