import React from 'react';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import UpdateSheet from "@/components/shared/DashboardNew/DashboardComponents/Docs/UpdateSheet";
import Link from "next/link";
import FileLink from "@/components/shared/FileLink";
import ExcelListsDisplay from "@/components/shared/DashboardNew/DashboardComponents/Docs/ExcelListsDipslay";


const Docs = () => {
    return (
        <div className="min-h-screen font-mono">
            <div className="mx-auto">

                <div className="mb-10 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-2 mb-2">
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        TK Service <span className="text-emerald-400">DOCS</span>
                    </h1>
                </div>

                <Accordion
                    type="single"
                    collapsible
                    defaultValue="shipping"
                    className="w-full"
                >
                    <AccordionItem value="shipping">
                        <AccordionTrigger>Work Process?</AccordionTrigger>
                        <AccordionContent>
                            <div className={`grid md:grid-cols-3 gap-2`}>
                                <div className={`col-span-3 grid md:grid-cols-3 gap-2`}>
                                    <div>
                                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                            SOP Rules
                                        </h4>
                                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                            <li>
                                                <Link className={`text-emerald-500 hover:underline font-medium`} href={`/docs/AutomationFailureProcess`}>
                                                    Automation Equipment Failure Process
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={``}>
                                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                            Robots DOCS
                                        </h4>
                                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                            <li>
                                                <Link className={`text-emerald-500 hover:underline font-medium`} href={`/docs/k50h`}>
                                                    K50H
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className={`text-emerald-500 hover:underline font-medium`} href={`/docs/a42t`}>
                                                    A42T
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className={``}>
                                        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                                            Work Process
                                        </h4>
                                        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                                            <li>
                                                <Link className={`text-emerald-500 hover:underline font-medium`} href={`#`}>
                                                    Handle Exception
                                                </Link>
                                            </li>
                                            <li>
                                                <Link className={`text-emerald-500 hover:underline font-medium`} href={`/docs/ess-beginners`}>
                                                    ESS for beginner
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <ExcelListsDisplay />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="updates">
                        <AccordionTrigger>How i can update the robot fireware?</AccordionTrigger>
                        <AccordionContent>
                            <UpdateSheet/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};

export default Docs;