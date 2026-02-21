import React from 'react';
import {IRobot} from "@/types/robot/robot";
import Image from "next/image";
import {timeToString} from "@/utils/timeToString";
import Link from "next/link";

interface Props {
    robots_data: IRobot[];
}

const RobotsAwaiting: React.FC<Props> = ({robots_data}) => {

    return (
        <div className={`grid md:grid-cols-3 gap-2`}>
            {robots_data.map((robot, index) => (
                <Link key={robot.id} href={`/robot/${robot.id}`} className={`rounded-md hover:bg-foreground/10 p-2 overflow-hidden`}>
                    <div className="flex py-2">
                        <div>
                            {robot.robot_type === "K50H"
                                ?
                                <>
                                    {robot.status === "离线 | Offline"
                                        ? <Image src={`/img/K50H_red.svg`} alt={`robot_img`} width={50}
                                                 height={50}/>
                                        : <Image src={`/img/K50H_green.svg`} alt={`robot_img`} width={50}
                                                 height={50}/>
                                    }
                                </>
                                :
                                <>
                                    {robot.status === "离线 | Offline"
                                        ? <Image src={`/img/A42T_red.svg`} alt={`robot_img`} width={50}
                                                 height={50}/>
                                        : <Image src={`/img/A42T_Green.svg`} alt={`robot_img`} width={50}
                                                 height={50}/>
                                    }
                                </>
                            }
                        </div>
                        <div className={``}>
                            <article className={`text-xs text-muted-foreground`}>
                                Number:
                                <span className={`font-bold  text-foreground ml-2`}>{robot.robot_number}</span>
                            </article>
                            <article className={`text-xs text-muted-foreground`}>
                                Date:
                                <span
                                    className={`font-bold  text-foreground ml-2`}>{timeToString(robot.updated_at)}</span>
                            </article>
                            <article className={`text-xs text-muted-foreground`}>
                                By:
                                <span className={`font-bold  text-foreground ml-2`}>{robot.updated_by?.user_name}</span>
                            </article>
                        </div>
                    </div>
                    <p className={`text-xs text-foreground line-clamp-2`}>{robot.problem_note}</p>
                </Link>
            ))}
        </div>
    );
};

export default RobotsAwaiting;