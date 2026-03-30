import React from 'react';
import {AlertTriangle, Download} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {version_15_6} from "@/lib/RobotUpdates/15-6/update";
import FileLink from "@/components/shared/FileLink";
import {version_23_5_k50h} from "@/lib/RobotUpdates/23-5-k50h/update";
import {Badge} from "@/components/ui/badge";
import {version_23_5_a42t} from "@/lib/RobotUpdates/23-5-a42t/update";

const SectionLabel = ({children}: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">{children}</span>
        <div className="flex-1 h-px"/>
    </div>
);


const rkdev_links = [
    {label: 'update_Ubuntu18.04_CST-2022-12-30-154415.img', href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYbon0LCp'},
    {label: 'RKDevTool Program', href: 'https://docs.radxa.com/en/zero/zero3/low-level-dev/rkdevtool'},
    {label: 'RKDevTool Driver (Windows)', href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYYvDY1d3'},
];

const updates_version = [
    {version: '11.5 | A42T D', steps: version_15_6},
    {version: '11.6 | A42T D', steps: version_15_6},
    {version: '15.6 | A42T E', steps: version_15_6},
    {version: '16.9 | A42T E', steps: version_15_6},
    {version: '23.5 | K50H', steps: version_23_5_k50h},
    {version: '23.5 | A42T', steps: version_23_5_a42t},
];

const update_links = [
    {
        label: 'v4.11.5',
        name: 'HAIPICKG4-KUBOT-V4.11.5RTM20230607114245Rb6069181',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYlJZ1Xi1'
    },
    {
        label: 'v4.11.6',
        name: 'HAIPICKG4-KUBOT-V4.11.6RTM20230707165448Rc11b6c8f',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYXi16hx7'
    },
    {
        label: 'v4.15.6',
        name: 'HAIPICKG4-KUBOT-V4.15.6[P220400040-0]RTM20240125174431R87540b4e',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGY3DO0vhA'
    },
    {
        label: 'v4.16.9',
        name: 'HAIPICKG4-KUBOT-V4.16.9[PD02A21110102-18]RTM20241202101456R38ecd4b3',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGY8Q8PqL8'
    },
    {
        label: 'v4.23.5-2',
        name: 'HAIPICKG4-KUBOT-V4.23.5[P230900159-3]RTM20250730101240R0ea7599e',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGY6PNIfZS'
    },
    {
        label: 'v4.23.5-3',
        name: 'HAIPICKG4-KUBOT-V4.23.5[PD06A22040102-2]RTM20250425191740R425a5e2e',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYRdTZ48a'
    },
];

const config_links = [
    {
        label: 'HAIFLEX-K50H-P1-Lift-400W-71RR_V5_P230900159-V1.0.3',
        href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGY3j01CGX'
    },
    {label: 'HAIPICK-A42TNA_V4_P230600109-V1.0.4', href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYDW0IpOt'},
    {label: 'Small P3 E — Old Fingers modules', href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGY22ncMnS'},
];

const UpdateSheet = () => {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-foreground/15 mask-r-from-0  p-5">
                    <SectionLabel>RKDevTool</SectionLabel>
                    <div className="flex flex-col gap-0.5">
                        {rkdev_links.map(l => <FileLink key={l.href} href={l.href} label={l.label}/>)}
                    </div>
                </div>

                <div className="rounded-xl border border-foreground/15 mask-r-from-0  p-5">
                    <SectionLabel>Firmware Packages</SectionLabel>
                    <div className="flex flex-col gap-0.5">
                        {update_links.map(l => <FileLink key={l.href} href={l.href} label={l.name}
                                                         sub={l.label}/>)}
                    </div>
                </div>

                <div className="rounded-xl border border-foreground/15 mask-r-from-0  p-5">
                    <SectionLabel>Hardware Configs</SectionLabel>

                    <div
                        className="flex gap-2.5 items-start border rounded-lg px-3 py-2.5 mb-3">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-400"/>
                        <p className="text-xs leading-relaxed">
                            Configs are <span className="text-amber-400 font-bold">not universal</span> — they
                            vary per robot. ~50% chance of compatibility mismatch.
                        </p>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        {config_links.map(l => <FileLink key={l.href} href={l.href} label={l.label}/>)}
                    </div>
                </div>
            </div>

            <div className="">
                <Accordion type="single" collapsible defaultValue="version-15.6" className="w-full">
                    {updates_version.map(({version, steps}) => (
                        <AccordionItem
                            key={version}
                            value={`version-${version}`}
                            className="rounded-lg mb-2 overflow-hidden data-[state=open]:border data-[state=open]:border-emerald-800/60"
                        >
                            <AccordionTrigger
                                className="px-4 py-3 hover:no-underline group">
                                <div className="flex items-center gap-3">
                                    <Badge
                                        className="text-xs px-2 py-0.5 rounded font-mono font-bold">
                                        {version}
                                    </Badge>
                                    <span className="text-xs ">{steps.length} steps</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 pt-2">
                                <div className="flex flex-col">
                                    {steps.map((step, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center pt-1">
                                                <div
                                                    className="flex h-6 w-6 shrink-0 text-foreground items-center justify-center rounded-full  border text-xs font-bold ">
                                                    {index + 1}
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className="mt-1 w-px flex-1 bg-zinc-800 min-h-4"/>
                                                )}
                                            </div>
                                            {/* Content */}
                                            <div className="pb-5 flex-1 min-w-0">
                                                <p className="text-sm font-bold text-muted-foreground mb-1">{step.title}</p>
                                                <div
                                                    className="text-xs  leading-relaxed">{step.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default UpdateSheet;