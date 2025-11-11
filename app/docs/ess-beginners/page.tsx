import React from 'react';
import Image from 'next/image';

const Page = () => {
    return (
        <div className="max-w-[1200px] m-auto border-2 p-4 rounded">
            <h1 className="text-center font-bold mb-4">
                Hai Robotics ESS System Beginner's Guide
            </h1>
            <ul className={`grid grid-cols-3 gap-4 mt-6`}>
                <li className="relative flex items-start gap-4 mb-4">
                    <div className={`flex gap-4`}>
                        <div className={`min-w-[75px]`}>
                            <Image
                                width={75}
                                height={75}
                                src="/docs/ess-beginner/green_kubot.jpg"
                                alt="Robot Icon"
                                className={`rounded-2xl`}
                            />
                        </div>
                        <p>
                            This icon represents a large vehicle.
                            The number below represents the vehicle number, while the middle section indicates the signal light. Vehicles with fewer blank spaces represent the front end, as shown in the image below for vehicle number 03.
                        </p>
                    </div>
                </li>
                <li className="relative flex items-start gap-4 mb-4">
                    <div className={`flex gap-4`}>
                        <div className={`min-w-[75px]`}>
                            <Image
                                width={75}
                                height={75}
                                src="/docs/ess-beginner/green_kubot.jpg"
                                alt="Robot Icon"
                                className={`rounded-2xl`}
                            />
                        </div>
                        <p>
                            When the signal light is red, it indicates a robot malfunction that requires immediate attention.
                        </p>
                    </div>
                </li>
                <li className="relative flex items-start gap-4 mb-4">
                    <div className={`flex gap-4`}>
                        <div className={`min-w-[75px]`}>
                            <Image
                                width={75}
                                height={75}
                                src="/docs/ess-beginner/gray_kubot.jpg"
                                alt="Robot Icon"
                                className={`rounded-2xl`}
                            />
                        </div>
                        <p>
                            When the signal light is gray, it indicates offline control/manual control of the robot.
                        </p>
                    </div>
                </li>
                <li className="relative flex items-start gap-4 mb-4">
                    <div className={`flex gap-4`}>
                        <div className={`min-w-[75px]`}>
                            <Image
                                width={75}
                                height={75}
                                src="/docs/ess-beginner/yellow_kubot.jpg"
                                alt="Robot Icon"
                                className={`rounded-2xl`}
                            />
                        </div>
                        <p>
                            When the signal light turns yellow, it indicates that the robot will pause its operation. Manual intervention is required to trigger the pause.
                        </p>
                    </div>
                </li>
                <li className="relative flex items-start gap-4 mb-4">
                    <div className={`flex gap-4`}>
                        <div className={`min-w-[75px]`}>
                            <Image
                                width={175}
                                height={175}
                                src="/docs/ess-beginner/green_task_kubot.jpg"
                                alt="Robot Icon"
                                className={`rounded-2xl rotate-[90deg]`}
                            />
                        </div>
                        <p>
                            If there are two yellow lines beneath the signal light, it indicates the robot has a system task assigned to it.
                        </p>
                    </div>
                </li>
            </ul>
            <div>
                <p>
                    The compact vehicle's signal lights resemble those of larger vehicles, with the side featuring more blank space indicating the front end/charging port. In the diagram, the compact vehicle's front end faces left.
                </p>
            </div>
        </div>
    );
};

export default Page;
