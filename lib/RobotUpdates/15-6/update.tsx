import React from "react";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/copyToClipboard";

const CmdBlock = ({ cmd }: { cmd: string }) => (
    <div className="flex items-start gap-2 mt-2 bg-black/40 border border-zinc-700 rounded px-3 py-2 font-mono text-xs text-primary group">
        <Copy
            onClick={() => copyToClipboard(cmd)}
            className="shrink-0 mt-0.5 cursor-pointer text-zinc-500 group-hover:text-emerald-400 transition-colors"
            size={14}
        />
        <span className="break-all">{cmd}</span>
    </div>
);

export const version_15_6: { title: string; description: React.ReactNode }[] = [
    {
        title: 'Reflash System',
        description: 'Using RKDevTool upgrade the file system on the robot. Requires Ubuntu image: update_Ubuntu18.04_CST-2022-12-30-154415.img',
    },
    {
        title: 'Connect via SSH',
        description: <>
            Connect to the robot using SSH credentials:
            <CmdBlock cmd="root" />
            <span className="text-zinc-500 text-xs">username</span>
            <CmdBlock cmd="HairouKubot_@2018!" />
            <span className="text-zinc-500 text-xs">password</span>
            <div className="mt-2">Navigate to the upgrade folder and drop the archive there:</div>
            <CmdBlock cmd="cd /home/kubot/upgrade" />
        </>,
    },
    {
        title: 'Extract Archive',
        description: <>
            Extract the archive in the current folder:
            <CmdBlock cmd="tar -xzvf HAIPICKG4-KUBOT-V4.15.6[P220400040-0]RTM20240125174431R87540b4e-D5CF8723924165DBEA4B87DD7BA3615F.tar.gz" />
        </>,
    },
    {
        title: 'Rename Folder',
        description: <>
            Remove brackets <code className="text-amber-400 text-xs">[ ]</code> from the folder name — they cause install errors:
            <CmdBlock cmd={`mv "HAIPICKG4-KUBOT-V4.15.6[P220400040-0]RTM20240125174431R87540b4e" "HAIPICKG4-KUBOT-V4.15.6P220400040-0RTM20240125174431R87540b4e"`} />
        </>,
    },
    {
        title: 'Run Installer',
        description: <>
            Enter the extracted folder and start the update:
            <CmdBlock cmd="cd HAIPICKG4-KUBOT-V4.15.6P220400040-0RTM20240125174431R87540b4e" />
            <CmdBlock cmd="python3 install.py --language english --force-feature-model A42TNA --force-hardware-vers V4 --ins-all /home/kubot/app" />
        </>,
    },
    {
        title: 'Replace Config Files',
        description: <>
            Reboot the robot, reconnect via SSH, then clear old configs:
            <CmdBlock cmd="cd /home/kubot/app && rm -f config__* dmcode-mapping.json" />
            Upload the new config files to the robot, then apply them:
            <CmdBlock cmd="chmod +x config__* dmcode-mapping.json && /etc/kubot_application.sh stop && ./kubo_upgrade firmware --chip=/dev/ttyUSB0 --config=config__software-design.json --verify=wc && /etc/kubot_application.sh start" />
        </>,
    },
];