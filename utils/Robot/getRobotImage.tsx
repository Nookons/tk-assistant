import Image from "next/image";
import React from "react";
import {isOffline} from "@/utils/Robot/isOffline";

export function RobotImage({ type, status }: { type: string; status: string }) {
    const offline = isOffline(status)
    const src =
        type === 'K50H'
            ? offline ? '/img/K50H_red.svg' : '/img/K50H_green.svg'
            : offline ? '/img/A42T_red.svg' : '/img/A42T_Green.svg'
    return <Image src={src} alt="robot" width={36} height={36} priority />
}