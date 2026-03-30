import React from "react";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/copyToClipboard";

const CmdBlock = ({ cmd }: { cmd: string }) => (
    <div className="flex items-start gap-2 mt-2  border border-foreground rounded px-3 py-2 font-mono text-xs text-primary group">
        <Copy
            onClick={() => copyToClipboard(cmd)}
            className="shrink-0 mt-0.5 cursor-pointer text-zinc-500 group-hover:text-emerald-400 transition-colors"
            size={14}
        />
        <span className="break-all">{cmd}</span>
    </div>
);

export const version_23_5_a42t: { title: string; description: React.ReactNode }[] = [
    {
        title: 'Connect via SSH',
        description: <>
            Connect to the robot using SSH credentials:
            <CmdBlock cmd="root" />
            <span className="text-zinc-500 text-xs">username</span>
            <CmdBlock cmd="HairouKubot_@2018!" />
            <span className="text-zinc-500 text-xs">password</span>
        </>,
    },
    {
        title: 'Extract Archive',
        description: <>
            Remove folder app on robot to avoid conflict while update:
            <CmdBlock cmd="cd /home/kubot && rm -rf app" />
            <p className={`mt-1`}>Create a new folder app:</p>
            <CmdBlock cmd="mkdir app && chomd +x app" />
        </>,
    },
    {
        title: 'Run Installer',
        description: <>
            Run update in HAI BOX
        </>,
    },
    {
        title: 'Replace Config Files',
        description: <>
            <p className={`mt-1`}>Once the update is finished you need to connect to robot via SSH again and update configs files for him. Lets start from remove its</p>
            <CmdBlock cmd="cd /home/kubot/app && rm -f config__*" />
            <p className={`mt-1`}>Now after remove old files we must upload new files for robot and when it done run command below</p>
            <CmdBlock cmd="chmod +x config__* && /etc/kubot_application.sh stop && ./kubo_upgrade firmware --chip=/dev/ttyUSB0 --config=config__software-design.json --verify=wc && /etc/kubot_application.sh start" />
        </>,
    },
];