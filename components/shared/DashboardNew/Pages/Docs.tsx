import React from 'react';
import Link from "next/link";
import {version_15_6} from "@/lib/RobotUpdates/15-6/update";
import {AlertTriangle, ChevronDown, Download, Settings, Wrench} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

const updates_version = [
    {version: '11.5 | D', steps: version_15_6},
    {version: '11.6 | D', steps: version_15_6},
    {version: '15.6 | E', steps: version_15_6},
    {version: '16.9 | E', steps: version_15_6},
    {version: '23.5 | GLPC K50H', steps: version_15_6},
    {version: '23.5 | GLPC A42T', steps: version_15_6},
];

const rkdev_links = [
    {label: 'update_Ubuntu18.04_CST-2022-12-30-154415.img', href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYbon0LCp'},
    {label: 'RKDevTool Program', href: 'https://docs.radxa.com/en/zero/zero3/low-level-dev/rkdevtool'},
    {label: 'RKDevTool Driver (Windows)', href: 'https://drive.weixin.qq.com/s?k=AHIA_gejAGYYvDY1d3'},
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

const SectionLabel = ({children}: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">{children}</span>
        <div className="flex-1 h-px bg-zinc-800"/>
    </div>
);

const FileLink = ({href, label, sub}: { href: string; label: string; sub?: string }) => (
    <Link
        href={href}
        className="group flex items-start gap-3 px-3 py-2.5 rounded-md border border-transparent hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150"
    >
        <Download size={16} className="shrink-0 mt-0.5 text-zinc-600 group-hover:text-emerald-400 transition-colors"/>
        <div className="min-w-0">
            {sub && <div className="text-xs font-bold  mb-0.5">{sub}</div>}
            <div className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">{label}</div>
        </div>
    </Link>
);

const Docs = () => {
    return (
        <div className="min-h-screen font-mono">
            <div className="mx-auto">

                {/* Header */}
                <div className="mb-10 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-2 mb-2">
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        TK Service <span className="text-emerald-400">DOCS</span>
                    </h1>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-5 gap-6">

                    {/* LEFT — Resources */}
                    <div className="col-span-2 flex flex-col gap-6">

                        {/* RKDevTool */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                            <SectionLabel>RKDevTool</SectionLabel>
                            <div className="flex flex-col gap-0.5">
                                {rkdev_links.map(l => <FileLink key={l.href} href={l.href} label={l.label}/>)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                            <SectionLabel>Firmware Packages</SectionLabel>
                            <div className="flex flex-col gap-0.5">
                                {update_links.map(l => <FileLink key={l.href} href={l.href} label={l.name}
                                                                 sub={l.label}/>)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                            <SectionLabel>Hardware Configs</SectionLabel>

                            <div
                                className="flex gap-2.5 items-start bg-amber-950/40 border border-amber-800/50 rounded-lg px-3 py-2.5 mb-3">
                                <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-400"/>
                                <p className="text-xs text-amber-300/80 leading-relaxed">
                                    Configs are <span className="text-amber-400 font-bold">not universal</span> — they
                                    vary per robot. ~50% chance of compatibility mismatch.
                                </p>
                            </div>

                            <div className="flex flex-col gap-0.5">
                                {config_links.map(l => <FileLink key={l.href} href={l.href} label={l.label}/>)}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <Accordion type="single" collapsible defaultValue="version-15.6" className="w-full">
                            {updates_version.map(({version, steps}) => (
                                <AccordionItem
                                    key={version}
                                    value={`version-${version}`}
                                    className="rounded-lg mb-2 overflow-hidden data-[state=open]:border data-[state=open]:border-emerald-800/60"
                                >
                                    <AccordionTrigger
                                        className="px-4 py-3 hover:no-underline hover:bg-zinc-800/50 group">
                                        <div className="flex items-center gap-3">
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-800/50 font-mono font-bold">
                                                    v{version}
                                                </span>
                                            <span
                                                className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                    Update
                                                </span>
                                            <span className="text-xs text-zinc-600">{steps.length} steps</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2">
                                        <div className="flex flex-col">
                                            {steps.map((step, index) => (
                                                <div key={index} className="flex gap-4">
                                                    <div className="flex flex-col items-center pt-1">
                                                        <div
                                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xs font-bold ">
                                                            {index + 1}
                                                        </div>
                                                        {index < steps.length - 1 && (
                                                            <div className="mt-1 w-px flex-1 bg-zinc-800 min-h-4"/>
                                                        )}
                                                    </div>
                                                    {/* Content */}
                                                    <div className="pb-5 flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-zinc-200 mb-1">{step.title}</p>
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
            </div>
        </div>
    );
};

export default Docs;